-- ============================================================================
-- AdSales Hub — Fix users RLS self select
-- Migration: 00009
--
-- The original policy `users_select_same_workspace` filtered by
-- workspace_id = current_workspace_id(). But current_workspace_id() itself
-- queries public.users, which needs to see our own row first. Chicken and
-- egg: result was always null, so the proxy redirected authenticated users
-- to /onboarding even when they had a workspace.
--
-- Fix: add a permissive "self-select" policy that lets every authenticated
-- user see their own row. The existing "same workspace" policy remains to
-- grant visibility of the other members.
-- ============================================================================

DROP POLICY IF EXISTS users_select_self ON users;
CREATE POLICY users_select_self ON users FOR SELECT TO authenticated
  USING (id = auth.uid());
