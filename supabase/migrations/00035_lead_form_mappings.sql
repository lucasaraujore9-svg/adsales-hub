-- Mapeamento configurável de campos do lead form do Meta para CRM.
-- Permite ao admin decidir para onde vai cada campo (contact_field,
-- custom_field, tag, ou ignorar).

CREATE TABLE IF NOT EXISTS lead_form_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_form_id UUID NOT NULL REFERENCES lead_forms(id) ON DELETE CASCADE,
  source_field TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('contact_field','custom_field','ignore','tag','metadata')),
  target_field TEXT,
  target_custom_field_id UUID REFERENCES custom_fields(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lead_form_id, source_field)
);

CREATE INDEX IF NOT EXISTS idx_lfm_workspace
  ON lead_form_field_mappings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_lfm_form
  ON lead_form_field_mappings(lead_form_id);

ALTER TABLE lead_form_field_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lfm_workspace_all" ON lead_form_field_mappings;
CREATE POLICY "lfm_workspace_all"
  ON lead_form_field_mappings FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()))
  WITH CHECK (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));
