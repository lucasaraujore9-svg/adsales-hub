-- Telefone de callback do vendedor para click-to-dial.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS callback_phone TEXT;
