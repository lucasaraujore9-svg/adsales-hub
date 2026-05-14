-- Campos adicionais de auditoria em assinaturas de contrato (LGPD + Lei 14.063/2020)

ALTER TABLE contract_signatories
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ;
