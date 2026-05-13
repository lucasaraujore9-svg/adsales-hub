-- ============================================================================
-- Credits system for AI media generation (image / video)
--
-- Plans without social media: workspace must purchase credit packs to use AI
-- creative. Plans with social media: monthly allowance + optional purchase.
--
-- Tables:
--   credit_pricing       — global cost per action kind (image=10, video=100, etc.)
--   workspace_credits    — current balance per workspace + monthly allowance
--   credit_transactions  — full audit trail (grant, spend, refund, purchase)
--
-- RPCs:
--   consume_credits(workspace_id, kind, ref_type, ref_id, meta) -> jsonb
--   refund_credits(transaction_id, reason) -> jsonb
--   grant_monthly_credits() -> jsonb (cron-driven)
--   purchase_credits(workspace_id, amount, stripe_session_id) -> jsonb
-- ============================================================================

-- ----------------------------------------------------------------------------
-- baskets: monthly credits included in plan (allowance)
-- ----------------------------------------------------------------------------
ALTER TABLE baskets
  ADD COLUMN IF NOT EXISTS monthly_credits INTEGER NOT NULL DEFAULT 0;

UPDATE baskets SET monthly_credits = 0    WHERE name = 'operacao';
UPDATE baskets SET monthly_credits = 300  WHERE name = 'crescimento';
UPDATE baskets SET monthly_credits = 1000 WHERE name = 'escala';
UPDATE baskets SET monthly_credits = 0    WHERE name = 'custom';

-- ----------------------------------------------------------------------------
-- credit_pricing: global cost catalog (admin-managed, seeded with defaults)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_pricing (
  kind TEXT PRIMARY KEY,
  cost INTEGER NOT NULL CHECK (cost >= 0),
  display_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO credit_pricing (kind, cost, display_name, description) VALUES
  ('image',         10,  'Imagem',          'Geracao de imagem para post (FLUX padrao)'),
  ('image_premium', 25,  'Imagem premium',  'Geracao de imagem com modelo premium'),
  ('video',         100, 'Video curto',     'Geracao de video de ate 6s'),
  ('video_premium', 250, 'Video premium',   'Geracao de video premium ou maior duracao')
ON CONFLICT (kind) DO NOTHING;

-- ----------------------------------------------------------------------------
-- workspace_credits: current balance + monthly allowance state
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_credits (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  monthly_allowance INTEGER NOT NULL DEFAULT 0,
  monthly_allowance_remaining INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  last_grant_period DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- credit_transactions: audit log of every change
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('grant', 'spend', 'refund', 'purchase', 'expire', 'adjust')),
  amount INTEGER NOT NULL,
  kind TEXT,
  reference_type TEXT,
  reference_id TEXT,
  refunded BOOLEAN NOT NULL DEFAULT false,
  refund_of UUID REFERENCES credit_transactions(id) ON DELETE SET NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_tx_workspace_created
  ON credit_transactions(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_tx_kind
  ON credit_transactions(kind, type);

-- Auto-create row on workspace insert
CREATE OR REPLACE FUNCTION public.bootstrap_workspace_credits()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.workspace_credits (workspace_id) VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_workspace_credits_bootstrap ON workspaces;
CREATE TRIGGER trg_workspace_credits_bootstrap
AFTER INSERT ON workspaces
FOR EACH ROW EXECUTE FUNCTION public.bootstrap_workspace_credits();

-- Backfill existing workspaces
INSERT INTO workspace_credits (workspace_id)
SELECT id FROM workspaces ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- consume_credits: atomic deduction with transaction record
--
-- Returns jsonb:
--   { ok: true,  charged, balance, transaction_id }
--   { ok: false, error: 'insufficient_credits' | 'unknown_kind' | 'inactive_kind',
--     required, balance }
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.consume_credits(
  p_workspace_id UUID,
  p_kind TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id TEXT DEFAULT NULL,
  p_meta JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cost INTEGER;
  v_active BOOLEAN;
  v_balance INTEGER;
  v_remaining INTEGER;
  v_tx_id UUID;
BEGIN
  SELECT cost, is_active INTO v_cost, v_active
  FROM credit_pricing WHERE kind = p_kind;

  IF v_cost IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unknown_kind');
  END IF;
  IF NOT v_active THEN
    RETURN jsonb_build_object('ok', false, 'error', 'inactive_kind');
  END IF;

  -- Lock the row to prevent concurrent overdraft
  SELECT balance, monthly_allowance_remaining INTO v_balance, v_remaining
  FROM workspace_credits WHERE workspace_id = p_workspace_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    INSERT INTO workspace_credits (workspace_id) VALUES (p_workspace_id);
    v_balance := 0;
    v_remaining := 0;
  END IF;

  IF v_balance < v_cost THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'insufficient_credits',
      'required', v_cost,
      'balance', v_balance
    );
  END IF;

  UPDATE workspace_credits SET
    balance = balance - v_cost,
    monthly_allowance_remaining = GREATEST(0, monthly_allowance_remaining - v_cost),
    total_spent = total_spent + v_cost,
    updated_at = now()
  WHERE workspace_id = p_workspace_id;

  INSERT INTO credit_transactions (
    workspace_id, type, amount, kind, reference_type, reference_id, meta
  ) VALUES (
    p_workspace_id, 'spend', -v_cost, p_kind, p_reference_type, p_reference_id, p_meta
  ) RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object(
    'ok', true,
    'charged', v_cost,
    'balance', v_balance - v_cost,
    'transaction_id', v_tx_id
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- refund_credits: reverse a spend transaction
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.refund_credits(
  p_transaction_id UUID,
  p_reason TEXT DEFAULT 'provider_failed'
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace UUID;
  v_amount INTEGER;
  v_already BOOLEAN;
  v_kind TEXT;
  v_refund_id UUID;
BEGIN
  SELECT workspace_id, amount, refunded, kind
  INTO v_workspace, v_amount, v_already, v_kind
  FROM credit_transactions WHERE id = p_transaction_id FOR UPDATE;

  IF v_workspace IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;
  IF v_already THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_refunded');
  END IF;
  IF v_amount >= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_a_spend');
  END IF;

  UPDATE workspace_credits SET
    balance = balance + (-v_amount),
    total_spent = GREATEST(0, total_spent - (-v_amount)),
    updated_at = now()
  WHERE workspace_id = v_workspace;

  UPDATE credit_transactions SET refunded = true WHERE id = p_transaction_id;

  INSERT INTO credit_transactions (
    workspace_id, type, amount, kind, refund_of, meta
  ) VALUES (
    v_workspace, 'refund', -v_amount, v_kind, p_transaction_id,
    jsonb_build_object('reason', p_reason)
  ) RETURNING id INTO v_refund_id;

  RETURN jsonb_build_object(
    'ok', true,
    'refunded', -v_amount,
    'refund_transaction_id', v_refund_id
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- purchase_credits: add credits from a Stripe one-time payment
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.purchase_credits(
  p_workspace_id UUID,
  p_amount INTEGER,
  p_reference_id TEXT DEFAULT NULL,
  p_meta JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx_id UUID;
  v_balance INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_amount');
  END IF;

  -- Idempotency: if a purchase tx with this reference_id exists, return success
  IF p_reference_id IS NOT NULL THEN
    SELECT id INTO v_tx_id FROM credit_transactions
    WHERE type = 'purchase' AND reference_id = p_reference_id
    LIMIT 1;
    IF v_tx_id IS NOT NULL THEN
      SELECT balance INTO v_balance FROM workspace_credits WHERE workspace_id = p_workspace_id;
      RETURN jsonb_build_object('ok', true, 'idempotent', true, 'balance', v_balance, 'transaction_id', v_tx_id);
    END IF;
  END IF;

  INSERT INTO workspace_credits (workspace_id, balance, total_purchased)
  VALUES (p_workspace_id, p_amount, p_amount)
  ON CONFLICT (workspace_id) DO UPDATE SET
    balance = workspace_credits.balance + p_amount,
    total_purchased = workspace_credits.total_purchased + p_amount,
    updated_at = now();

  INSERT INTO credit_transactions (
    workspace_id, type, amount, kind, reference_type, reference_id, meta
  ) VALUES (
    p_workspace_id, 'purchase', p_amount, 'topup', 'stripe_session', p_reference_id, p_meta
  ) RETURNING id INTO v_tx_id;

  SELECT balance INTO v_balance FROM workspace_credits WHERE workspace_id = p_workspace_id;
  RETURN jsonb_build_object('ok', true, 'balance', v_balance, 'transaction_id', v_tx_id);
END;
$$;

-- ----------------------------------------------------------------------------
-- grant_monthly_credits: grant the basket's monthly allowance to all workspaces
-- whose last_grant_period is < current month. Idempotent within a month.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.grant_monthly_credits()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period DATE := date_trunc('month', now())::date;
  v_granted INTEGER := 0;
  r RECORD;
BEGIN
  FOR r IN
    SELECT s.workspace_id, COALESCE(b.monthly_credits, 0) AS allowance
    FROM subscriptions s
    LEFT JOIN baskets b ON b.id = s.basket_id
    WHERE s.status IN ('active', 'trialing')
      AND COALESCE(b.monthly_credits, 0) > 0
  LOOP
    UPDATE workspace_credits SET
      balance = balance + r.allowance,
      monthly_allowance = r.allowance,
      monthly_allowance_remaining = r.allowance,
      last_grant_period = v_period,
      updated_at = now()
    WHERE workspace_id = r.workspace_id
      AND (last_grant_period IS NULL OR last_grant_period < v_period);

    IF FOUND THEN
      INSERT INTO credit_transactions (
        workspace_id, type, amount, kind, reference_type, reference_id, meta
      ) VALUES (
        r.workspace_id, 'grant', r.allowance, 'monthly_grant',
        'period', to_char(v_period, 'YYYY-MM-DD'),
        jsonb_build_object('period', v_period)
      );
      v_granted := v_granted + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('granted', v_granted, 'period', v_period);
END;
$$;

-- ----------------------------------------------------------------------------
-- RLS — workspace members read their own data, writes go through SECURITY DEFINER RPCs
-- ----------------------------------------------------------------------------
ALTER TABLE workspace_credits  ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_pricing      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS workspace_credits_read ON workspace_credits;
CREATE POLICY workspace_credits_read ON workspace_credits
  FOR SELECT USING (
    workspace_id IN (
      SELECT u.workspace_id FROM users u WHERE u.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS credit_transactions_read ON credit_transactions;
CREATE POLICY credit_transactions_read ON credit_transactions
  FOR SELECT USING (
    workspace_id IN (
      SELECT u.workspace_id FROM users u WHERE u.id = auth.uid()
    )
  );

-- Pricing is global, readable by all authenticated users
DROP POLICY IF EXISTS credit_pricing_read ON credit_pricing;
CREATE POLICY credit_pricing_read ON credit_pricing
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- pg_cron schedule: monthly grant on day 1 at 00:05 UTC
DO $$
BEGIN
  PERFORM cron.unschedule('credits_monthly_grant');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'credits_monthly_grant',
  '5 0 1 * *',
  $$SELECT public.grant_monthly_credits();$$
);
