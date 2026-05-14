-- Preferências de notificação por usuário.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "weekly_digest": true,
    "push": true,
    "inbox_email": false
  }'::jsonb;
