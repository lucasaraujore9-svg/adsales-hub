-- ============================================================================
-- Demo workspace bootstrap (added for local dev parity)
-- Production already has this row; locally we create it before subsequent
-- migrations that reference '99999999-9999-4999-8999-100000000001'.
-- ============================================================================
INSERT INTO public.workspaces (id, name, slug, timezone, locale, currency)
VALUES (
  '99999999-9999-4999-8999-100000000001'::uuid,
  'Demo Workspace',
  'demo',
  'America/Sao_Paulo',
  'pt-BR',
  'BRL'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- AdSales Hub — Rich demo seed helper
-- Migration: 00007
--
-- Adds a helper function adopt_user_into_demo(email) that:
--   1. moves the given auth user into the demo workspace (id fixed in seed)
--   2. removes their auto-provisioned workspace (if empty)
--   3. gives admin role
--
-- Useful during development so you can log in with any email and see the rich
-- seeded data without re-running the seed.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.adopt_user_into_demo(p_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_auth_user_id UUID;
  v_current_workspace UUID;
  v_demo_workspace UUID := '99999999-9999-4999-8999-100000000001'::uuid;
BEGIN
  -- find the auth user
  SELECT id INTO v_auth_user_id FROM auth.users WHERE email = p_email LIMIT 1;
  IF v_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'auth user % not found', p_email;
  END IF;

  -- current workspace of that user
  SELECT workspace_id INTO v_current_workspace FROM public.users WHERE id = v_auth_user_id;

  -- upsert user into demo workspace
  INSERT INTO public.users (id, workspace_id, email, name, role, joined_at)
  VALUES (v_auth_user_id, v_demo_workspace, p_email, p_email, 'admin', now())
  ON CONFLICT (id)
  DO UPDATE SET workspace_id = EXCLUDED.workspace_id, role = 'admin';

  -- drop their empty workspace if we are moving them
  IF v_current_workspace IS NOT NULL AND v_current_workspace <> v_demo_workspace THEN
    -- keep it only if it has other users
    IF (SELECT count(*) FROM public.users WHERE workspace_id = v_current_workspace) = 0 THEN
      DELETE FROM public.workspaces WHERE id = v_current_workspace;
    END IF;
  END IF;

  RETURN v_demo_workspace;
END;
$$;
