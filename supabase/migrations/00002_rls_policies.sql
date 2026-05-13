-- ============================================================================
-- AdSales Hub — Row Level Security policies
-- Migration: 00002
--
-- Strategy:
--   * Helper: public.current_workspace_id() reads the authenticated user's
--     workspace from public.users (SECURITY DEFINER, STABLE so RLS checks can
--     reuse it cheaply).
--   * All tenant tables enable RLS and filter by workspace_id.
--   * Metric tables (campaign_metrics / ad_set_metrics / ad_metrics) inherit
--     workspace from the parent row via an EXISTS subquery.
--   * Global tables (modules, baskets, basket_modules, media_tiers) allow
--     SELECT to every authenticated user; writes restricted to service_role.
--   * Role-based write restrictions use a helper is_workspace_writer() that
--     returns true when the caller's role is in (admin, gestor, vendedor,
--     media_buyer). Visualizadores get SELECT only.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helper functions (placed in public so policies can reference them)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_workspace_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_writer()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role IN ('admin','gestor','vendedor','media_buyer')
  );
$$;

-- ----------------------------------------------------------------------------
-- Global tables: readable by any authenticated user, writable only via service
-- ----------------------------------------------------------------------------

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY modules_select_auth ON modules FOR SELECT TO authenticated USING (true);

ALTER TABLE baskets ENABLE ROW LEVEL SECURITY;
CREATE POLICY baskets_select_auth ON baskets FOR SELECT TO authenticated USING (true);

ALTER TABLE basket_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY basket_modules_select_auth ON basket_modules FOR SELECT TO authenticated USING (true);

ALTER TABLE media_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY media_tiers_select_auth ON media_tiers FOR SELECT TO authenticated USING (true);

-- ----------------------------------------------------------------------------
-- Core: workspaces + users
-- ----------------------------------------------------------------------------

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY workspaces_select_self ON workspaces FOR SELECT TO authenticated
  USING (id = public.current_workspace_id());
CREATE POLICY workspaces_update_admin ON workspaces FOR UPDATE TO authenticated
  USING (id = public.current_workspace_id() AND public.is_workspace_admin())
  WITH CHECK (id = public.current_workspace_id());

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_select_same_workspace ON users FOR SELECT TO authenticated
  USING (workspace_id = public.current_workspace_id());
CREATE POLICY users_update_self ON users FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND workspace_id = public.current_workspace_id());
CREATE POLICY users_admin_write ON users FOR ALL TO authenticated
  USING (workspace_id = public.current_workspace_id() AND public.is_workspace_admin())
  WITH CHECK (workspace_id = public.current_workspace_id() AND public.is_workspace_admin());

-- ----------------------------------------------------------------------------
-- Macro: apply tenant policy to every workspace_id-scoped table
--   SELECT: any authenticated member of the workspace
--   INSERT/UPDATE/DELETE: workspace writers
-- ----------------------------------------------------------------------------

DO $$
DECLARE
  t TEXT;
  tenant_tables TEXT[] := ARRAY[
    'companies','contacts','pipelines','deals',
    'loss_reasons','products','activities','notes','calls','call_analyses',
    'tags','custom_fields','custom_field_values',
    'email_templates','whatsapp_templates','call_scripts',
    'sequences','automations','automation_logs','goals',
    'integrations','api_keys','webhooks','webhook_logs',
    'ad_accounts','campaigns','ad_sets','ad_creatives','ads',
    'lead_forms','audiences','audience_syncs','ai_optimization_logs',
    'landing_pages','landing_page_versions','forms','form_submissions',
    'email_campaigns','lead_sources',
    'social_accounts','social_posts','social_media_library',
    'report_templates','reports','report_schedules',
    'ai_insights','ai_questions',
    'subscriptions','workspace_modules','invoices','usage_records',
    'workspace_branding','ai_creatives','ai_creative_templates',
    'sdr_configs','sdr_calls','sdr_queue',
    'proposal_templates','proposals','contract_templates','contracts',
    'contract_signatories'
  ];
BEGIN
  FOREACH t IN ARRAY tenant_tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format($f$
      CREATE POLICY %1$I_select ON %1$I FOR SELECT TO authenticated
        USING (workspace_id = public.current_workspace_id())
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY %1$I_insert ON %1$I FOR INSERT TO authenticated
        WITH CHECK (workspace_id = public.current_workspace_id() AND public.is_workspace_writer())
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY %1$I_update ON %1$I FOR UPDATE TO authenticated
        USING (workspace_id = public.current_workspace_id() AND public.is_workspace_writer())
        WITH CHECK (workspace_id = public.current_workspace_id())
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY %1$I_delete ON %1$I FOR DELETE TO authenticated
        USING (workspace_id = public.current_workspace_id() AND public.is_workspace_writer())
    $f$, t);
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- pipeline_stages: no direct workspace_id — inherits from pipelines
-- ----------------------------------------------------------------------------

ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY pipeline_stages_select ON pipeline_stages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM pipelines p
    WHERE p.id = pipeline_stages.pipeline_id
      AND p.workspace_id = public.current_workspace_id()
  ));

CREATE POLICY pipeline_stages_write ON pipeline_stages FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM pipelines p
    WHERE p.id = pipeline_stages.pipeline_id
      AND p.workspace_id = public.current_workspace_id()
      AND public.is_workspace_writer()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM pipelines p
    WHERE p.id = pipeline_stages.pipeline_id
      AND p.workspace_id = public.current_workspace_id()
  ));

-- ----------------------------------------------------------------------------
-- deal_tags: PK-only junction; inherits from deals
-- ----------------------------------------------------------------------------

ALTER TABLE deal_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY deal_tags_select ON deal_tags FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM deals d
    WHERE d.id = deal_tags.deal_id
      AND d.workspace_id = public.current_workspace_id()
  ));

CREATE POLICY deal_tags_write ON deal_tags FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM deals d
    WHERE d.id = deal_tags.deal_id
      AND d.workspace_id = public.current_workspace_id()
      AND public.is_workspace_writer()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM deals d
    WHERE d.id = deal_tags.deal_id
      AND d.workspace_id = public.current_workspace_id()
  ));

-- ----------------------------------------------------------------------------
-- sequence_steps / automation_actions: inherit from parent
-- ----------------------------------------------------------------------------

ALTER TABLE sequence_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY sequence_steps_select ON sequence_steps FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM sequences s
    WHERE s.id = sequence_steps.sequence_id
      AND s.workspace_id = public.current_workspace_id()
  ));

CREATE POLICY sequence_steps_write ON sequence_steps FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM sequences s
    WHERE s.id = sequence_steps.sequence_id
      AND s.workspace_id = public.current_workspace_id()
      AND public.is_workspace_writer()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM sequences s
    WHERE s.id = sequence_steps.sequence_id
      AND s.workspace_id = public.current_workspace_id()
  ));

ALTER TABLE automation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY automation_actions_select ON automation_actions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM automations a
    WHERE a.id = automation_actions.automation_id
      AND a.workspace_id = public.current_workspace_id()
  ));

CREATE POLICY automation_actions_write ON automation_actions FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM automations a
    WHERE a.id = automation_actions.automation_id
      AND a.workspace_id = public.current_workspace_id()
      AND public.is_workspace_writer()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM automations a
    WHERE a.id = automation_actions.automation_id
      AND a.workspace_id = public.current_workspace_id()
  ));

-- ----------------------------------------------------------------------------
-- Metrics tables: inherit from parent entity (no workspace_id column)
-- ----------------------------------------------------------------------------

ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY campaign_metrics_select ON campaign_metrics FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM campaigns c
    WHERE c.id = campaign_metrics.campaign_id
      AND c.workspace_id = public.current_workspace_id()
  ));

CREATE POLICY campaign_metrics_write ON campaign_metrics FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM campaigns c
    WHERE c.id = campaign_metrics.campaign_id
      AND c.workspace_id = public.current_workspace_id()
      AND public.is_workspace_writer()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM campaigns c
    WHERE c.id = campaign_metrics.campaign_id
      AND c.workspace_id = public.current_workspace_id()
  ));

ALTER TABLE ad_set_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY ad_set_metrics_select ON ad_set_metrics FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM ad_sets s
    WHERE s.id = ad_set_metrics.ad_set_id
      AND s.workspace_id = public.current_workspace_id()
  ));

CREATE POLICY ad_set_metrics_write ON ad_set_metrics FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM ad_sets s
    WHERE s.id = ad_set_metrics.ad_set_id
      AND s.workspace_id = public.current_workspace_id()
      AND public.is_workspace_writer()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM ad_sets s
    WHERE s.id = ad_set_metrics.ad_set_id
      AND s.workspace_id = public.current_workspace_id()
  ));

ALTER TABLE ad_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY ad_metrics_select ON ad_metrics FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM ads a
    WHERE a.id = ad_metrics.ad_id
      AND a.workspace_id = public.current_workspace_id()
  ));

CREATE POLICY ad_metrics_write ON ad_metrics FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM ads a
    WHERE a.id = ad_metrics.ad_id
      AND a.workspace_id = public.current_workspace_id()
      AND public.is_workspace_writer()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM ads a
    WHERE a.id = ad_metrics.ad_id
      AND a.workspace_id = public.current_workspace_id()
  ));

ALTER TABLE email_campaign_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_campaign_metrics_select ON email_campaign_metrics FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM email_campaigns e
    WHERE e.id = email_campaign_metrics.email_campaign_id
      AND e.workspace_id = public.current_workspace_id()
  ));

CREATE POLICY email_campaign_metrics_write ON email_campaign_metrics FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM email_campaigns e
    WHERE e.id = email_campaign_metrics.email_campaign_id
      AND e.workspace_id = public.current_workspace_id()
      AND public.is_workspace_writer()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM email_campaigns e
    WHERE e.id = email_campaign_metrics.email_campaign_id
      AND e.workspace_id = public.current_workspace_id()
  ));

ALTER TABLE social_post_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY social_post_metrics_select ON social_post_metrics FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM social_posts p
    WHERE p.id = social_post_metrics.social_post_id
      AND p.workspace_id = public.current_workspace_id()
  ));

CREATE POLICY social_post_metrics_write ON social_post_metrics FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM social_posts p
    WHERE p.id = social_post_metrics.social_post_id
      AND p.workspace_id = public.current_workspace_id()
      AND public.is_workspace_writer()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM social_posts p
    WHERE p.id = social_post_metrics.social_post_id
      AND p.workspace_id = public.current_workspace_id()
  ));

-- ============================================================================
-- End RLS migration (00002)
-- ============================================================================
