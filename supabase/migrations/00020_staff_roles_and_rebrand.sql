-- ============================================================================
-- Internal staff roles + rebrand of Demo Workspace as the AdSales Hub itself
--
-- staff_role distinguishes internal AdSales Hub employees from tenant users.
-- Values:
--   support           — read-only access to all customer data for triage
--   customer_success  — support + can grant credits, change customer plans
--   sales             — read-only + can create demo accounts
--   engineering       — full read + ops actions (cron, jobs, integrations)
--   admin             — equivalent to is_super_admin (kept separate for clarity)
--
-- A user can have BOTH a workspace role (admin/gestor/vendedor...) and a
-- staff_role. workspace role gates what they do inside their tenant; staff_role
-- gates what they do across the system via /super-admin.
-- ============================================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS staff_role TEXT
  CHECK (staff_role IN ('support','customer_success','sales','engineering','admin'));

CREATE INDEX IF NOT EXISTS idx_users_staff_role
  ON users(staff_role) WHERE staff_role IS NOT NULL;

-- Helper that returns true if the user is any kind of internal staff
CREATE OR REPLACE FUNCTION public.is_internal_staff(p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = p_user_id
      AND (is_super_admin = true OR staff_role IS NOT NULL)
  );
$$;

-- Wider RLS read for internal staff (mirrors super_admin but more permissive scope)
DROP POLICY IF EXISTS users_internal_staff_read_all ON users;
CREATE POLICY users_internal_staff_read_all ON users
  FOR SELECT USING (public.is_internal_staff(auth.uid()));

DROP POLICY IF EXISTS workspaces_internal_staff_read_all ON workspaces;
CREATE POLICY workspaces_internal_staff_read_all ON workspaces
  FOR SELECT USING (public.is_internal_staff(auth.uid()));

DROP POLICY IF EXISTS workspace_credits_internal_staff_read ON workspace_credits;
CREATE POLICY workspace_credits_internal_staff_read ON workspace_credits
  FOR SELECT USING (public.is_internal_staff(auth.uid()));

DROP POLICY IF EXISTS subscriptions_internal_staff_read ON subscriptions;
CREATE POLICY subscriptions_internal_staff_read ON subscriptions
  FOR SELECT USING (public.is_internal_staff(auth.uid()));

DROP POLICY IF EXISTS credit_transactions_internal_staff_read ON credit_transactions;
CREATE POLICY credit_transactions_internal_staff_read ON credit_transactions
  FOR SELECT USING (public.is_internal_staff(auth.uid()));

-- ----------------------------------------------------------------------------
-- Rebrand the Demo Workspace as the AdSales Hub's own selling/operations space
-- ----------------------------------------------------------------------------
UPDATE workspaces SET
  name = 'AdSales Hub',
  slug = 'adsaleshub',
  domain = COALESCE(domain, 'adsaleshub.7iegroup.com.br'),
  updated_at = now()
WHERE id = '99999999-9999-4999-8999-100000000001'
  AND slug = 'demo';

-- Anyone in this workspace whose role is admin gets staff_role='admin' if not set
UPDATE users SET staff_role = 'admin'
WHERE workspace_id = '99999999-9999-4999-8999-100000000001'
  AND role = 'admin'
  AND staff_role IS NULL
  AND is_super_admin = true;
