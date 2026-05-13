-- ============================================================================
-- Fix: super_admin RLS policies on `users` cause infinite recursion because
-- the EXISTS subquery itself goes through RLS on `users`. Switch to the
-- SECURITY DEFINER helper public.is_super_admin(uuid), which bypasses RLS.
--
-- Also clean up an orphan workspace "AdSales Hub" created by an aborted
-- onboarding flow where the proxy errored out before linking the owner.
-- ============================================================================

DROP POLICY IF EXISTS users_super_admin_read_all ON users;
CREATE POLICY users_super_admin_read_all ON users
  FOR SELECT USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS workspaces_super_admin_read_all ON workspaces;
CREATE POLICY workspaces_super_admin_read_all ON workspaces
  FOR SELECT USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS workspace_credits_super_admin_read ON workspace_credits;
CREATE POLICY workspace_credits_super_admin_read ON workspace_credits
  FOR SELECT USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS subscriptions_super_admin_read ON subscriptions;
CREATE POLICY subscriptions_super_admin_read ON subscriptions
  FOR SELECT USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS credit_transactions_super_admin_read ON credit_transactions;
CREATE POLICY credit_transactions_super_admin_read ON credit_transactions
  FOR SELECT USING (public.is_super_admin(auth.uid()));

-- Clean up orphan workspaces (no owner_user_id and no users linked)
DELETE FROM workspaces w
WHERE w.owner_user_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.workspace_id = w.id);
