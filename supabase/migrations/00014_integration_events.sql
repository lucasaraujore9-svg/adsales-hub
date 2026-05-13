-- Audit log for OAuth/Integration events that arrive without a workspace context.
-- Used by Meta deauthorize/delete-data endpoints (signed by Meta, not the user)
-- and by Google/TikTok equivalents.

CREATE TABLE integration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('meta', 'google', 'tiktok', 'linkedin', 'whatsapp')),
  event_type TEXT NOT NULL,
  payload JSONB,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL
);

CREATE INDEX integration_events_provider_event_idx
  ON integration_events (provider, event_type, received_at DESC);

-- Lookup index for delete-data status endpoint (Meta returns a confirmation_code
-- in the payload that the FB UI then checks via /api/auth/meta/data-deletion-status?id=...)
CREATE INDEX integration_events_confirmation_code_idx
  ON integration_events ((payload->>'confirmation_code'))
  WHERE payload ? 'confirmation_code';

-- RLS: only service role writes/reads (no user-facing access).
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY integration_events_service_role_all
  ON integration_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
