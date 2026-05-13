-- ============================================================================
-- AdSales Hub — Functions & Triggers
-- Migration: 00004
--
-- Contents:
--   * set_updated_at() trigger function applied to every table with updated_at
--   * handle_new_auth_user() trigger on auth.users to auto-create public.users
--     and optionally a personal workspace on first sign-up
--   * check_plan_limit(p_workspace_id, p_resource) -> jsonb {allowed, current, limit}
--   * get_workspace_enabled_modules(p_workspace_id) -> text[] of module slugs
-- ============================================================================

-- ----------------------------------------------------------------------------
-- set_updated_at: generic trigger function keeping updated_at fresh
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.table_schema, c.table_name
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND c.column_name = 'updated_at'
      AND t.table_type = 'BASE TABLE'
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_set_updated_at ON %I.%I',
      r.table_schema, r.table_name
    );
    EXECUTE format(
      'CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I.%I ' ||
      'FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      r.table_schema, r.table_name
    );
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- handle_new_auth_user: auto-provision public.users on auth signup
--
-- When metadata contains workspace_id, user is added to that workspace (invited
-- flow). Otherwise, a new workspace named after the user is created and the
-- user is added as admin. This is the default signup flow.
-- ----------------------------------------------------------------------------

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

    INSERT INTO public.workspaces (name, slug, owner_user_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'workspace_name', v_name || ' workspace'),
      v_slug,
      NEW.id
    )
    RETURNING id INTO v_workspace_id;

    v_role := 'admin';
  END IF;

  INSERT INTO public.users (id, workspace_id, email, name, role, joined_at)
  VALUES (NEW.id, v_workspace_id, NEW.email, v_name, v_role, now())
  ON CONFLICT (id) DO NOTHING;

  -- Ensure workspaces.owner_user_id is set (in case it was created above)
  UPDATE public.workspaces
  SET owner_user_id = COALESCE(owner_user_id, NEW.id)
  WHERE id = v_workspace_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ----------------------------------------------------------------------------
-- get_workspace_enabled_modules(workspace_id) -> text[]
-- Returns array of module slugs currently enabled for the workspace.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_workspace_enabled_modules(p_workspace_id UUID)
RETURNS TEXT[]
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(m.slug ORDER BY m.slug), ARRAY[]::TEXT[])
  FROM public.workspace_modules wm
  JOIN public.modules m ON m.id = wm.module_id
  WHERE wm.workspace_id = p_workspace_id
    AND wm.enabled = true
    AND m.is_active = true;
$$;

-- ----------------------------------------------------------------------------
-- check_plan_limit(workspace_id, resource) -> jsonb {allowed, current, limit}
-- Consults usage_records for the current period and returns gating info.
-- A limit of 0 means "not tracked" -> allowed. A limit of -1 means "unlimited".
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_plan_limit(
  p_workspace_id UUID,
  p_resource TEXT
)
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current BIGINT;
  v_limit BIGINT;
  v_period_start DATE := date_trunc('month', now())::date;
BEGIN
  SELECT current_count, limit_count
    INTO v_current, v_limit
  FROM public.usage_records
  WHERE workspace_id = p_workspace_id
    AND resource = p_resource
    AND period_start = v_period_start
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'current', 0,
      'limit', 0,
      'tracked', false
    );
  END IF;

  IF v_limit = -1 THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'current', v_current,
      'limit', -1,
      'tracked', true,
      'unlimited', true
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_current < v_limit,
    'current', v_current,
    'limit', v_limit,
    'tracked', true
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- increment_usage(workspace_id, resource, amount) -> void
-- Atomically bumps current_count in usage_records. Row must exist.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.increment_usage(
  p_workspace_id UUID,
  p_resource TEXT,
  p_amount BIGINT DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_period_start DATE := date_trunc('month', now())::date;
  v_period_end DATE := (date_trunc('month', now()) + INTERVAL '1 month' - INTERVAL '1 day')::date;
BEGIN
  INSERT INTO public.usage_records (workspace_id, resource, current_count, limit_count, period_start, period_end)
  VALUES (p_workspace_id, p_resource, p_amount, 0, v_period_start, v_period_end)
  ON CONFLICT (workspace_id, resource, period_start)
  DO UPDATE SET
    current_count = public.usage_records.current_count + p_amount,
    updated_at = now();
END;
$$;

-- ============================================================================
-- End of functions (00004)
-- ============================================================================
