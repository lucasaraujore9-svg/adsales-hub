-- Do Not Call list (Anatel + LGPD): impede o SDR IA de ligar para números
-- que pediram para não ser contatados.

CREATE TABLE IF NOT EXISTS do_not_call_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  reason TEXT,
  source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual','self_request','call_request','bounced_max_attempts')),
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  added_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_dnc_workspace_phone
  ON do_not_call_list(workspace_id, phone);

ALTER TABLE do_not_call_list ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dnc_list_workspace_select" ON do_not_call_list;
CREATE POLICY "dnc_list_workspace_select"
  ON do_not_call_list FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "dnc_list_workspace_modify" ON do_not_call_list;
CREATE POLICY "dnc_list_workspace_modify"
  ON do_not_call_list FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));
