-- Audit log de ações de staff (super-admin). Imutável.

CREATE TABLE IF NOT EXISTS super_admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  before_value JSONB,
  after_value JSONB,
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_super_admin_audit_actor
  ON super_admin_audit_log(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_super_admin_audit_target
  ON super_admin_audit_log(target_type, target_id, created_at DESC);

ALTER TABLE super_admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "super_admin_audit_staff_select" ON super_admin_audit_log;
CREATE POLICY "super_admin_audit_staff_select"
  ON super_admin_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (users.is_super_admin = TRUE OR users.staff_role IS NOT NULL)
    )
  );

-- Imutável
CREATE OR REPLACE FUNCTION block_super_admin_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Super admin audit log is immutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_super_admin_audit_update ON super_admin_audit_log;
CREATE TRIGGER prevent_super_admin_audit_update BEFORE UPDATE ON super_admin_audit_log
  FOR EACH ROW EXECUTE FUNCTION block_super_admin_audit_modification();

DROP TRIGGER IF EXISTS prevent_super_admin_audit_delete ON super_admin_audit_log;
CREATE TRIGGER prevent_super_admin_audit_delete BEFORE DELETE ON super_admin_audit_log
  FOR EACH ROW EXECUTE FUNCTION block_super_admin_audit_modification();
