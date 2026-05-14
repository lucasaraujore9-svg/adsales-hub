-- Idempotência para webhooks de pagamento e outros providers que podem
-- reenviar o mesmo evento (Stripe, Mercado Pago, Asaas, etc.).
-- A combinação (provider, event_id) é única — segunda inserção falha,
-- e o handler usa essa falha para responder 200 sem reprocessar.

CREATE TABLE IF NOT EXISTS webhook_events_processed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE (provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_eventid
  ON webhook_events_processed (provider, event_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at
  ON webhook_events_processed (processed_at DESC);

-- Service role tem acesso total via bypass de RLS.
-- Workspace members podem visualizar apenas eventos do próprio workspace
-- (útil para suporte/debug).
ALTER TABLE webhook_events_processed ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "webhook_events_workspace_select"
  ON webhook_events_processed;
CREATE POLICY "webhook_events_workspace_select"
  ON webhook_events_processed
  FOR SELECT
  USING (
    workspace_id IS NOT NULL
    AND workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  );
