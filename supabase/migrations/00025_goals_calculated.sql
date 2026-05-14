-- Metas (goals): `achieved` deixa de ser manual e passa a ser calculado
-- automaticamente. Adiciona `last_calculated_at` para feedback ao usuário.

ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS last_calculated_at TIMESTAMPTZ;
