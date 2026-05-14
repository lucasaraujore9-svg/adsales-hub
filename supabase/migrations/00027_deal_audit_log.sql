-- Audit log de negócios (deal_audit_log).
-- Captura mudanças em deals: criação, mudança de estágio, valor, owner, status.
-- Triggers preenchem automaticamente via fn_deal_audit_trigger.

CREATE TABLE IF NOT EXISTS deal_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  field TEXT,
  old_value JSONB,
  new_value JSONB,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deal_audit_log_deal_created
  ON deal_audit_log(deal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deal_audit_log_workspace
  ON deal_audit_log(workspace_id, created_at DESC);

ALTER TABLE deal_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deal_audit_log_workspace_select" ON deal_audit_log;
CREATE POLICY "deal_audit_log_workspace_select"
  ON deal_audit_log FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

-- Imutabilidade
CREATE OR REPLACE FUNCTION block_deal_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Deal audit log is immutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_deal_audit_update ON deal_audit_log;
CREATE TRIGGER prevent_deal_audit_update BEFORE UPDATE ON deal_audit_log
  FOR EACH ROW EXECUTE FUNCTION block_deal_audit_modification();

DROP TRIGGER IF EXISTS prevent_deal_audit_delete ON deal_audit_log;
CREATE TRIGGER prevent_deal_audit_delete BEFORE DELETE ON deal_audit_log
  FOR EACH ROW EXECUTE FUNCTION block_deal_audit_modification();

-- Trigger automático em deals
CREATE OR REPLACE FUNCTION fn_deal_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  actor UUID;
BEGIN
  -- Lê app.current_user_id setado pelo client antes do UPDATE (best-effort).
  -- Se não houver, deixa NULL.
  BEGIN
    actor := current_setting('app.current_user_id', true)::uuid;
  EXCEPTION WHEN OTHERS THEN
    actor := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO deal_audit_log (deal_id, workspace_id, event_type, actor_user_id, new_value)
    VALUES (
      NEW.id,
      NEW.workspace_id,
      'created',
      COALESCE(actor, NEW.owner_user_id),
      jsonb_build_object('title', NEW.title, 'value', NEW.value, 'stage_id', NEW.stage_id, 'owner_user_id', NEW.owner_user_id)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
      INSERT INTO deal_audit_log (deal_id, workspace_id, event_type, field, old_value, new_value, actor_user_id)
      VALUES (NEW.id, NEW.workspace_id, 'stage_changed', 'stage_id', to_jsonb(OLD.stage_id), to_jsonb(NEW.stage_id), actor);
    END IF;
    IF OLD.value IS DISTINCT FROM NEW.value THEN
      INSERT INTO deal_audit_log (deal_id, workspace_id, event_type, field, old_value, new_value, actor_user_id)
      VALUES (NEW.id, NEW.workspace_id, 'value_changed', 'value', to_jsonb(OLD.value), to_jsonb(NEW.value), actor);
    END IF;
    IF OLD.owner_user_id IS DISTINCT FROM NEW.owner_user_id THEN
      INSERT INTO deal_audit_log (deal_id, workspace_id, event_type, field, old_value, new_value, actor_user_id)
      VALUES (NEW.id, NEW.workspace_id, 'owner_changed', 'owner_user_id', to_jsonb(OLD.owner_user_id), to_jsonb(NEW.owner_user_id), actor);
    END IF;
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO deal_audit_log (deal_id, workspace_id, event_type, field, old_value, new_value, actor_user_id)
      VALUES (NEW.id, NEW.workspace_id, 'status_changed', 'status', to_jsonb(OLD.status), to_jsonb(NEW.status), actor);
    END IF;
    IF OLD.title IS DISTINCT FROM NEW.title THEN
      INSERT INTO deal_audit_log (deal_id, workspace_id, event_type, field, old_value, new_value, actor_user_id)
      VALUES (NEW.id, NEW.workspace_id, 'title_changed', 'title', to_jsonb(OLD.title), to_jsonb(NEW.title), actor);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS deals_audit ON deals;
CREATE TRIGGER deals_audit
  AFTER INSERT OR UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION fn_deal_audit_trigger();
