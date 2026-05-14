-- Tracking de publicação de posts sociais.

ALTER TABLE social_posts
  ADD COLUMN IF NOT EXISTS platform_post_ids JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS publish_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS error_message TEXT;
