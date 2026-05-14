-- Merge automático de contatos duplicados.
-- Soft-delete: contatos secundários ficam apontando para o "primary" via
-- merged_into_contact_id e param de aparecer em listagens (filtro NULL).

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS merged_into_contact_id UUID REFERENCES contacts(id),
  ADD COLUMN IF NOT EXISTS merged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS merged_by_user_id UUID REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_contacts_merged_into
  ON contacts(merged_into_contact_id) WHERE merged_into_contact_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS contact_merge_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  primary_contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  merged_contact_ids UUID[] NOT NULL,
  field_choices JSONB NOT NULL DEFAULT '{}'::jsonb,
  transferred_counts JSONB DEFAULT '{}'::jsonb,
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_merge_log_workspace
  ON contact_merge_log(workspace_id, created_at DESC);

ALTER TABLE contact_merge_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_merge_log_workspace_select" ON contact_merge_log;
CREATE POLICY "contact_merge_log_workspace_select"
  ON contact_merge_log FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));
