-- ============================================================================
-- Pending credit purchases — links a payment-gateway charge to a workspace
-- and the credit pack it bought. When the gateway webhook confirms payment,
-- the application calls public.purchase_credits() with reference_id = the
-- gateway payment id (idempotent).
-- ============================================================================

CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  pack_id TEXT NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'BRL',
  gateway TEXT NOT NULL CHECK (gateway IN ('asaas', 'mercadopago', 'stripe', 'manual')),
  gateway_payment_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'expired', 'cancelled', 'refunded', 'failed')),
  invoice_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (gateway, gateway_payment_id)
);

CREATE INDEX IF NOT EXISTS idx_credit_purchases_workspace
  ON credit_purchases(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status
  ON credit_purchases(status);

ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS credit_purchases_read ON credit_purchases;
CREATE POLICY credit_purchases_read ON credit_purchases
  FOR SELECT USING (
    workspace_id IN (
      SELECT u.workspace_id FROM users u WHERE u.id = auth.uid()
    )
  );
