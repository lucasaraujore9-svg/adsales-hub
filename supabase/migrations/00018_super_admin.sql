-- ============================================================================
-- Super Admin: master plan + unlimited credits + system-wide control
--
-- 1. Adds is_super_admin flag to users
-- 2. Adds 'master' basket (full access, no charge)
-- 3. Adds workspace_credits.unlimited flag
-- 4. Updates consume_credits to bypass deduction when unlimited
-- 5. Promotes admin@adsaleshub.7iegroup.com.br to super admin with master plan
-- ============================================================================

-- Super admin flag
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_super_admin
  ON users(is_super_admin) WHERE is_super_admin = true;

-- Unlimited credits flag
ALTER TABLE workspace_credits
  ADD COLUMN IF NOT EXISTS unlimited BOOLEAN NOT NULL DEFAULT false;

-- Allow 'master' as a basket name
ALTER TABLE baskets DROP CONSTRAINT IF EXISTS baskets_name_check;
ALTER TABLE baskets ADD CONSTRAINT baskets_name_check
  CHECK (name IN ('operacao','crescimento','escala','custom','master'));

-- Master basket (all modules, no charge)
INSERT INTO baskets (name, display_name, price_monthly, max_users, max_media_monthly, monthly_credits, is_active, trial_days)
VALUES ('master', 'Master (Super Admin)', 0, NULL, 999999999, 0, true, 0)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  price_monthly = EXCLUDED.price_monthly,
  max_media_monthly = EXCLUDED.max_media_monthly,
  is_active = true;

-- Link master basket to all modules
INSERT INTO basket_modules (basket_id, module_id)
SELECT b.id, m.id
FROM baskets b CROSS JOIN modules m
WHERE b.name = 'master'
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- consume_credits with unlimited bypass
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
  v_unlimited BOOLEAN;
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

  SELECT balance, monthly_allowance_remaining, unlimited
  INTO v_balance, v_remaining, v_unlimited
  FROM workspace_credits WHERE workspace_id = p_workspace_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    INSERT INTO workspace_credits (workspace_id) VALUES (p_workspace_id);
    v_balance := 0;
    v_remaining := 0;
    v_unlimited := false;
  END IF;

  -- Unlimited bypass: log a 0-cost transaction for audit; balance untouched
  IF v_unlimited THEN
    INSERT INTO credit_transactions (
      workspace_id, type, amount, kind, reference_type, reference_id, meta
    ) VALUES (
      p_workspace_id, 'spend', 0, p_kind, p_reference_type, p_reference_id,
      p_meta || jsonb_build_object('unlimited', true)
    ) RETURNING id INTO v_tx_id;

    RETURN jsonb_build_object(
      'ok', true,
      'charged', 0,
      'balance', v_balance,
      'transaction_id', v_tx_id,
      'unlimited', true
    );
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
-- Promote admin@adsaleshub.7iegroup.com.br to super admin with master plan
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_user_id UUID;
  v_workspace_id UUID;
  v_master_basket UUID;
BEGIN
  SELECT id, workspace_id INTO v_user_id, v_workspace_id
  FROM users WHERE email = 'admin@adsaleshub.7iegroup.com.br'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE '[super_admin] User admin@adsaleshub.7iegroup.com.br not found — skipping promotion (run after first signup)';
    RETURN;
  END IF;

  -- Promote
  UPDATE users SET
    is_super_admin = true,
    role = 'admin'
  WHERE id = v_user_id;

  -- Master basket
  SELECT id INTO v_master_basket FROM baskets WHERE name = 'master';

  -- Activate every module for this workspace
  INSERT INTO workspace_modules (workspace_id, module_id, enabled)
  SELECT v_workspace_id, m.id, true
  FROM modules m
  WHERE m.is_active = true
  ON CONFLICT (workspace_id, module_id) DO UPDATE SET enabled = true;

  -- Master subscription, no trial, 100-year period
  INSERT INTO subscriptions (
    workspace_id, basket_id, status, trial_end,
    current_period_start, current_period_end
  ) VALUES (
    v_workspace_id, v_master_basket, 'active', NULL,
    now(), now() + INTERVAL '100 years'
  )
  ON CONFLICT (workspace_id) DO UPDATE SET
    basket_id = v_master_basket,
    status = 'active',
    trial_end = NULL,
    current_period_end = now() + INTERVAL '100 years',
    cancel_at_period_end = false;

  -- Unlimited credits
  INSERT INTO workspace_credits (workspace_id, unlimited)
  VALUES (v_workspace_id, true)
  ON CONFLICT (workspace_id) DO UPDATE SET unlimited = true;

  RAISE NOTICE '[super_admin] Promoted user % in workspace % to master/unlimited',
    v_user_id, v_workspace_id;
END $$;

-- ----------------------------------------------------------------------------
-- RLS: super admin can read all workspaces, users, etc. via dedicated policies
-- (kept narrow — only adding SELECT, never write — writes go through the app)
-- ----------------------------------------------------------------------------

DROP POLICY IF EXISTS users_super_admin_read_all ON users;
CREATE POLICY users_super_admin_read_all ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

DROP POLICY IF EXISTS workspaces_super_admin_read_all ON workspaces;
CREATE POLICY workspaces_super_admin_read_all ON workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

DROP POLICY IF EXISTS workspace_credits_super_admin_read ON workspace_credits;
CREATE POLICY workspace_credits_super_admin_read ON workspace_credits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

DROP POLICY IF EXISTS subscriptions_super_admin_read ON subscriptions;
CREATE POLICY subscriptions_super_admin_read ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

DROP POLICY IF EXISTS credit_transactions_super_admin_read ON credit_transactions;
CREATE POLICY credit_transactions_super_admin_read ON credit_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() AND u.is_super_admin = true
    )
  );

-- ----------------------------------------------------------------------------
-- Helper: is_super_admin(user_id)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_super_admin(p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_super_admin FROM users WHERE id = p_user_id), false);
$$;
