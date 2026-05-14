-- Lembretes automáticos de proposta (3d/5d/7d).

ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminders_sent INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminders_disabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_proposals_reminder_state
  ON proposals(status, sent_at)
  WHERE status = 'sent' AND reminders_disabled = FALSE;
