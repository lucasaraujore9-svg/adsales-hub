-- ============================================================================
-- AdSales Hub — Indexes for hot query paths
-- Migration: 00003
--
-- Naming convention: idx_<table>_<columns>
-- Only indexes that accelerate common queries are created. Unique constraints
-- already created in 00001 implicitly add their own indexes.
-- ============================================================================

-- Core / tenant lookups
CREATE INDEX idx_users_workspace_id ON users(workspace_id);
CREATE INDEX idx_users_email_lower ON users(workspace_id, lower(email));

-- CRM hot paths
CREATE INDEX idx_companies_workspace_id ON companies(workspace_id);
CREATE INDEX idx_contacts_workspace_id ON contacts(workspace_id);
CREATE INDEX idx_contacts_email_lower ON contacts(workspace_id, lower(email));
CREATE INDEX idx_contacts_phone ON contacts(workspace_id, phone);
CREATE INDEX idx_contacts_owner ON contacts(workspace_id, owner_user_id);
CREATE INDEX idx_contacts_company ON contacts(company_id);

CREATE INDEX idx_pipelines_workspace_id ON pipelines(workspace_id);
CREATE INDEX idx_pipeline_stages_pipeline ON pipeline_stages(pipeline_id, position);

CREATE INDEX idx_deals_workspace_id ON deals(workspace_id);
CREATE INDEX idx_deals_pipeline_stage ON deals(pipeline_id, stage_id, position);
CREATE INDEX idx_deals_status ON deals(workspace_id, status);
CREATE INDEX idx_deals_owner ON deals(workspace_id, owner_user_id);
CREATE INDEX idx_deals_contact ON deals(contact_id);
CREATE INDEX idx_deals_company ON deals(company_id);
CREATE INDEX idx_deals_expected_close ON deals(workspace_id, expected_close_date);

CREATE INDEX idx_activities_workspace_id ON activities(workspace_id);
CREATE INDEX idx_activities_due ON activities(workspace_id, due_date, completed);
CREATE INDEX idx_activities_deal ON activities(deal_id, due_date);
CREATE INDEX idx_activities_contact ON activities(contact_id);
CREATE INDEX idx_activities_user ON activities(user_id, due_date);

CREATE INDEX idx_notes_workspace_id ON notes(workspace_id);
CREATE INDEX idx_notes_deal ON notes(deal_id);
CREATE INDEX idx_notes_contact ON notes(contact_id);

CREATE INDEX idx_calls_workspace_id ON calls(workspace_id);
CREATE INDEX idx_calls_deal ON calls(deal_id, created_at DESC);
CREATE INDEX idx_calls_contact ON calls(contact_id);
CREATE INDEX idx_calls_user ON calls(user_id, created_at DESC);
CREATE INDEX idx_calls_provider ON calls(provider, provider_call_id);

CREATE INDEX idx_call_analyses_call ON call_analyses(call_id);

CREATE INDEX idx_tags_workspace_id ON tags(workspace_id);
CREATE INDEX idx_custom_fields_entity ON custom_fields(workspace_id, entity);
CREATE INDEX idx_custom_field_values_field_entity ON custom_field_values(custom_field_id, entity_id);

-- Templates & automations
CREATE INDEX idx_email_templates_workspace_id ON email_templates(workspace_id);
CREATE INDEX idx_whatsapp_templates_workspace_id ON whatsapp_templates(workspace_id);
CREATE INDEX idx_call_scripts_workspace_id ON call_scripts(workspace_id);
CREATE INDEX idx_sequences_workspace_id ON sequences(workspace_id);
CREATE INDEX idx_sequence_steps_sequence ON sequence_steps(sequence_id, position);
CREATE INDEX idx_automations_workspace_id ON automations(workspace_id);
CREATE INDEX idx_automations_active ON automations(workspace_id, is_active);
CREATE INDEX idx_automation_actions_automation ON automation_actions(automation_id, position);
CREATE INDEX idx_automation_logs_workspace_id ON automation_logs(workspace_id, executed_at DESC);

CREATE INDEX idx_goals_workspace_id ON goals(workspace_id);
CREATE INDEX idx_goals_period ON goals(workspace_id, period_start, period_end);

-- Integrations / webhooks / api keys
CREATE INDEX idx_integrations_workspace_id ON integrations(workspace_id);
CREATE INDEX idx_api_keys_workspace_id ON api_keys(workspace_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_webhooks_workspace_id ON webhooks(workspace_id);
CREATE INDEX idx_webhook_logs_workspace_id ON webhook_logs(workspace_id, created_at DESC);
CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id, created_at DESC);

-- Ads
CREATE INDEX idx_ad_accounts_workspace_id ON ad_accounts(workspace_id);
CREATE INDEX idx_ad_accounts_provider ON ad_accounts(workspace_id, provider);

CREATE INDEX idx_campaigns_workspace_id ON campaigns(workspace_id);
CREATE INDEX idx_campaigns_status ON campaigns(workspace_id, status);
CREATE INDEX idx_campaigns_ad_account ON campaigns(ad_account_id);
CREATE INDEX idx_campaigns_provider_id ON campaigns(provider_campaign_id);

CREATE INDEX idx_ad_sets_campaign ON ad_sets(campaign_id);
CREATE INDEX idx_ad_sets_workspace_id ON ad_sets(workspace_id);
CREATE INDEX idx_ad_sets_provider_id ON ad_sets(provider_ad_set_id);

CREATE INDEX idx_ads_ad_set ON ads(ad_set_id);
CREATE INDEX idx_ads_workspace_id ON ads(workspace_id);
CREATE INDEX idx_ads_status ON ads(workspace_id, status);
CREATE INDEX idx_ads_provider_id ON ads(provider_ad_id);

CREATE INDEX idx_ad_creatives_workspace_id ON ad_creatives(workspace_id);
CREATE INDEX idx_ad_creatives_tags ON ad_creatives USING GIN (tags);

CREATE INDEX idx_lead_forms_workspace_id ON lead_forms(workspace_id);
CREATE INDEX idx_lead_forms_campaign ON lead_forms(campaign_id);
CREATE INDEX idx_lead_forms_provider ON lead_forms(provider_form_id);

CREATE INDEX idx_audiences_workspace_id ON audiences(workspace_id);
CREATE INDEX idx_audience_syncs_audience ON audience_syncs(audience_id, created_at DESC);

CREATE INDEX idx_campaign_metrics_date ON campaign_metrics(campaign_id, date DESC);
CREATE INDEX idx_ad_set_metrics_date ON ad_set_metrics(ad_set_id, date DESC);
CREATE INDEX idx_ad_metrics_date ON ad_metrics(ad_id, date DESC);

CREATE INDEX idx_ai_optimization_logs_workspace_id ON ai_optimization_logs(workspace_id, created_at DESC);
CREATE INDEX idx_ai_optimization_logs_campaign ON ai_optimization_logs(campaign_id, status);

-- Landing pages / forms
CREATE INDEX idx_landing_pages_workspace_id ON landing_pages(workspace_id);
CREATE INDEX idx_landing_page_versions_page ON landing_page_versions(landing_page_id);
CREATE INDEX idx_forms_workspace_id ON forms(workspace_id);
CREATE INDEX idx_form_submissions_workspace_id ON form_submissions(workspace_id, created_at DESC);
CREATE INDEX idx_form_submissions_form ON form_submissions(form_id, created_at DESC);
CREATE INDEX idx_form_submissions_landing ON form_submissions(landing_page_id, created_at DESC);
CREATE INDEX idx_form_submissions_deal ON form_submissions(deal_id);

-- Email marketing
CREATE INDEX idx_email_campaigns_workspace_id ON email_campaigns(workspace_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(workspace_id, status, scheduled_at);

-- Lead sources
CREATE INDEX idx_lead_sources_workspace_id ON lead_sources(workspace_id);
CREATE INDEX idx_lead_sources_deal ON lead_sources(deal_id);
CREATE INDEX idx_lead_sources_contact ON lead_sources(contact_id);
CREATE INDEX idx_lead_sources_campaign ON lead_sources(campaign_id);
CREATE INDEX idx_lead_sources_source_type ON lead_sources(workspace_id, source_type, captured_at DESC);

-- Social
CREATE INDEX idx_social_accounts_workspace_id ON social_accounts(workspace_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(workspace_id, platform);
CREATE INDEX idx_social_posts_workspace_id ON social_posts(workspace_id);
CREATE INDEX idx_social_posts_scheduled ON social_posts(workspace_id, scheduled_at, status);
CREATE INDEX idx_social_posts_status ON social_posts(workspace_id, status);
CREATE INDEX idx_social_posts_approval_token ON social_posts(approval_token);
CREATE INDEX idx_social_media_library_workspace_id ON social_media_library(workspace_id);
CREATE INDEX idx_social_media_library_tags ON social_media_library USING GIN (tags);

-- Analytics / reports / AI
CREATE INDEX idx_report_templates_workspace_id ON report_templates(workspace_id);
CREATE INDEX idx_reports_workspace_id ON reports(workspace_id);
CREATE INDEX idx_reports_period ON reports(workspace_id, period_end DESC);
CREATE INDEX idx_reports_share_token ON reports(share_token);
CREATE INDEX idx_report_schedules_workspace_id ON report_schedules(workspace_id);
CREATE INDEX idx_report_schedules_next ON report_schedules(is_active, next_send_at)
  WHERE is_active = true;

CREATE INDEX idx_ai_insights_workspace_id ON ai_insights(workspace_id);
CREATE INDEX idx_ai_insights_area_severity ON ai_insights(workspace_id, area, severity, created_at DESC);
CREATE INDEX idx_ai_insights_campaign ON ai_insights(campaign_id);
CREATE INDEX idx_ai_questions_workspace_id ON ai_questions(workspace_id, created_at DESC);

-- Billing
CREATE INDEX idx_subscriptions_workspace_id ON subscriptions(workspace_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status, current_period_end);
CREATE INDEX idx_workspace_modules_workspace_id ON workspace_modules(workspace_id);
CREATE INDEX idx_invoices_workspace_id ON invoices(workspace_id, created_at DESC);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_stripe_id ON invoices(stripe_invoice_id);
CREATE INDEX idx_usage_records_workspace_id ON usage_records(workspace_id, resource, period_start);

-- Expansion
CREATE INDEX idx_ai_creatives_workspace_id ON ai_creatives(workspace_id, created_at DESC);
CREATE INDEX idx_ai_creatives_campaign ON ai_creatives(campaign_id);
CREATE INDEX idx_ai_creatives_social_post ON ai_creatives(social_post_id);
CREATE INDEX idx_ai_creative_templates_category ON ai_creative_templates(category, is_active);

CREATE INDEX idx_sdr_calls_workspace_id ON sdr_calls(workspace_id, created_at DESC);
CREATE INDEX idx_sdr_calls_deal ON sdr_calls(deal_id);
CREATE INDEX idx_sdr_calls_voice_id ON sdr_calls(voice_call_id);
CREATE INDEX idx_sdr_queue_workspace_id ON sdr_queue(workspace_id);
CREATE INDEX idx_sdr_queue_next ON sdr_queue(status, next_attempt_at)
  WHERE status IN ('pending','in_progress');

CREATE INDEX idx_proposals_workspace_id ON proposals(workspace_id, created_at DESC);
CREATE INDEX idx_proposals_deal ON proposals(deal_id);
CREATE INDEX idx_proposals_share_token ON proposals(share_token);
CREATE INDEX idx_proposals_status ON proposals(workspace_id, status);

CREATE INDEX idx_contracts_workspace_id ON contracts(workspace_id, created_at DESC);
CREATE INDEX idx_contracts_deal ON contracts(deal_id);
CREATE INDEX idx_contracts_status ON contracts(workspace_id, status);
CREATE INDEX idx_contract_signatories_contract ON contract_signatories(contract_id);
CREATE INDEX idx_contract_signatories_email ON contract_signatories(email, status);

-- ============================================================================
-- End of indexes (00003)
-- ============================================================================
