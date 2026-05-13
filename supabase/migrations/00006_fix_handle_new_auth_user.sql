-- ============================================================================
-- AdSales Hub — Fix auth signup trigger
-- Migration: 00006
--
-- Fixes FK violation on workspaces.owner_user_id: the original trigger tried
-- to set owner_user_id on workspace creation, but public.users does not
-- exist yet at that moment (it is inserted right after). Solution: create
-- workspace with owner_user_id = NULL, insert user, then patch the owner.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id UUID;
  v_name TEXT;
  v_role TEXT;
  v_slug TEXT;
BEGIN
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  IF NEW.raw_user_meta_data ? 'workspace_id' THEN
    v_workspace_id := (NEW.raw_user_meta_data->>'workspace_id')::uuid;
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'vendedor');
  ELSE
    v_slug := regexp_replace(lower(split_part(NEW.email, '@', 1)), '[^a-z0-9]+', '-', 'g')
              || '-' || substr(replace(NEW.id::text, '-', ''), 1, 8);

    -- Create workspace without owner_user_id (set it after users row exists)
    INSERT INTO public.workspaces (name, slug)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'workspace_name', v_name || ' workspace'),
      v_slug
    )
    RETURNING id INTO v_workspace_id;

    v_role := 'admin';
  END IF;

  -- Now create the user profile (id matches auth.users.id)
  INSERT INTO public.users (id, workspace_id, email, name, role, joined_at)
  VALUES (NEW.id, v_workspace_id, NEW.email, v_name, v_role, now())
  ON CONFLICT (id) DO NOTHING;

  -- Finally set the workspace owner (the FK now resolves)
  UPDATE public.workspaces
  SET owner_user_id = COALESCE(owner_user_id, NEW.id)
  WHERE id = v_workspace_id;

  -- Auto-provision a workspace_branding row with defaults
  INSERT INTO public.workspace_branding (workspace_id, accent_color)
  VALUES (v_workspace_id, '#FF5E1A')
  ON CONFLICT (workspace_id) DO NOTHING;

  RETURN NEW;
END;
$$;
