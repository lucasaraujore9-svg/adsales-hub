-- LGPD Art. 7º + 11º: gravação de chamada exige consentimento explícito.
-- O assistente IA pergunta ao início; resposta é registrada e usada para
-- decidir se a gravação será mantida ou descartada.

ALTER TABLE sdr_calls
  ADD COLUMN IF NOT EXISTS consent_recorded BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consent_text TEXT,
  ADD COLUMN IF NOT EXISTS recording_retention_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recording_purged_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_sdr_calls_retention
  ON sdr_calls(recording_retention_until)
  WHERE recording_url IS NOT NULL AND recording_purged_at IS NULL;
