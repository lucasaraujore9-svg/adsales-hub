-- Trilha de auditoria de contrato (Lei 14.063/2020):
-- - content_hash (SHA-256) capturado na criação
-- - verification_token público pra rota /contrato/verificar
-- - signed_pdf_url
-- - contract_signature_events imutável

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS content_hash TEXT,
  ADD COLUMN IF NOT EXISTS verification_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS signed_pdf_url TEXT;

CREATE TABLE IF NOT EXISTS contract_signature_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'link_sent','viewed','signed','declined','revoked','reminder_sent','fully_signed'
  )),
  signatory_id UUID REFERENCES contract_signatories(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  geolocation JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_csig_events_contract
  ON contract_signature_events(contract_id, created_at);

ALTER TABLE contract_signature_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contract_signature_events_workspace_select" ON contract_signature_events;
CREATE POLICY "contract_signature_events_workspace_select"
  ON contract_signature_events FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid()));

-- Imutabilidade: bloqueia UPDATE/DELETE
CREATE OR REPLACE FUNCTION block_contract_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Contract audit events are immutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_csig_event_update ON contract_signature_events;
CREATE TRIGGER prevent_csig_event_update BEFORE UPDATE ON contract_signature_events
  FOR EACH ROW EXECUTE FUNCTION block_contract_audit_modification();

DROP TRIGGER IF EXISTS prevent_csig_event_delete ON contract_signature_events;
CREATE TRIGGER prevent_csig_event_delete BEFORE DELETE ON contract_signature_events
  FOR EACH ROW EXECUTE FUNCTION block_contract_audit_modification();
