-- ============================================================================
-- AdSales Hub — Seed data
-- Populates global catalogs (modules, baskets, media_tiers) and a demo
-- workspace with a trial subscription, admin user stub, pipeline and a handful
-- of mock records useful for proto pages.
--
-- IDs are deterministic so dev environments stay stable across resets.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Modules catalog (global)
-- ----------------------------------------------------------------------------

INSERT INTO modules (id, slug, display_name, description, price_monthly, is_required, is_active) VALUES
  ('11111111-1111-4111-8111-100000000001','crm','CRM de Vendas','Pipeline, contatos, atividades, automacoes, sequencias.',    0, true,  true),
  ('11111111-1111-4111-8111-100000000002','ads','Trafego Pago com IA','Meta Ads automatizado, criativos IA, otimizador.',     19000, false, true),
  ('11111111-1111-4111-8111-100000000003','social','Social Media','Calendario, agendamento, aprovacao, multi-rede.',          14000, false, true),
  ('11111111-1111-4111-8111-100000000004','msg','Mensagens','WhatsApp, email, SMS integrados ao CRM.',                        18000, false, true),
  ('11111111-1111-4111-8111-100000000005','sdr','SDR + Agente de Voz IA','Qualificacao automatica por telefone.',             22000, false, true),
  ('11111111-1111-4111-8111-100000000006','bi','BI / Analytics','Relatorios white-label, funil, CAC, ROAS.',                   16000, false, true),
  ('11111111-1111-4111-8111-100000000007','site','Landing Pages','Builder + A/B test + dominio custom.',                       9000, false, true),
  ('11111111-1111-4111-8111-100000000008','sign','Contratos / E-signature','Propostas, contratos, assinatura eletronica.',   11000, false, true)
ON CONFLICT (slug) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description  = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  is_required  = EXCLUDED.is_required,
  is_active    = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- Baskets (global)
-- ----------------------------------------------------------------------------

INSERT INTO baskets (id, name, display_name, price_monthly, max_users, max_media_monthly, module_ids, is_featured, trial_days) VALUES
  ('22222222-2222-4222-8222-100000000001','operacao','Operacao',    29000,    3,   600, '["crm","ads","site"]'::jsonb,                                      false, 14),
  ('22222222-2222-4222-8222-100000000002','crescimento','Crescimento', 69000, 8,  2000, '["crm","ads","social","msg","bi"]'::jsonb,                          true,  14),
  ('22222222-2222-4222-8222-100000000003','escala','Escala',        149000, NULL, 8000, '["crm","ads","social","msg","sdr","bi","site","sign"]'::jsonb,     false, 14),
  ('22222222-2222-4222-8222-100000000004','custom','Custom Builder', 19000, NULL,  600, '["crm"]'::jsonb,                                                   false, 14)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  price_monthly = EXCLUDED.price_monthly,
  max_users = EXCLUDED.max_users,
  max_media_monthly = EXCLUDED.max_media_monthly,
  module_ids = EXCLUDED.module_ids,
  is_featured = EXCLUDED.is_featured,
  trial_days = EXCLUDED.trial_days;

-- Wire baskets to modules via basket_modules junction
INSERT INTO basket_modules (basket_id, module_id)
SELECT b.id, m.id
FROM baskets b
CROSS JOIN LATERAL jsonb_array_elements_text(b.module_ids) slug
JOIN modules m ON m.slug = slug.value
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Media tiers (global) — fee tacked onto subscription based on monthly ad spend
-- ----------------------------------------------------------------------------

INSERT INTO media_tiers (id, max_monthly, fee_monthly, label, is_active) VALUES
  ('33333333-3333-4333-8333-100000000001',   600,     0, 'Ate R$600/mes',  true),
  ('33333333-3333-4333-8333-100000000002',  2000,  8000, 'Ate R$2.000/mes',true),
  ('33333333-3333-4333-8333-100000000003',  8000, 22000, 'Ate R$8.000/mes',true),
  ('33333333-3333-4333-8333-100000000004',999999, 48000, 'Acima de R$8.000/mes', true)
ON CONFLICT (id) DO UPDATE SET
  max_monthly = EXCLUDED.max_monthly,
  fee_monthly = EXCLUDED.fee_monthly,
  label = EXCLUDED.label,
  is_active = EXCLUDED.is_active;

-- ============================================================================
-- Demo workspace + admin user + subscription (Escala trial 14d)
-- ============================================================================
-- NOTE: The user row here is a *stub* for dev-only — id does NOT match an
-- auth.users row. When you sign in for real, the handle_new_auth_user trigger
-- creates a fresh workspace + user. To tie the demo workspace to a real auth
-- user, update users.id manually after creating the auth account, or keep this
-- demo data untouched and use the sign-up flow to generate your real workspace.
-- ============================================================================

-- Demo workspace
INSERT INTO workspaces (id, name, slug, timezone, locale, currency, settings) VALUES
  ('99999999-9999-4999-8999-100000000001','Demo Workspace','demo','America/Sao_Paulo','pt-BR','BRL',
   '{"onboarding_completed": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Demo admin user stub (id is a real UUID; replace with auth.uid() later)
INSERT INTO users (id, workspace_id, email, name, role, joined_at) VALUES
  ('99999999-9999-4999-8999-200000000001',
   '99999999-9999-4999-8999-100000000001',
   'admin@demo.adsales.local','Admin Demo','admin', now())
ON CONFLICT (id) DO NOTHING;

UPDATE workspaces SET owner_user_id = '99999999-9999-4999-8999-200000000001'
WHERE id = '99999999-9999-4999-8999-100000000001' AND owner_user_id IS NULL;

-- Workspace branding (defaults)
INSERT INTO workspace_branding (workspace_id, accent_color) VALUES
  ('99999999-9999-4999-8999-100000000001','#FF5E1A')
ON CONFLICT (workspace_id) DO NOTHING;

-- Trial subscription on Escala (all 8 modules)
INSERT INTO subscriptions (
  id, workspace_id, basket_id, media_tier_id, status,
  current_period_start, current_period_end, trial_end
) VALUES (
  '99999999-9999-4999-8999-300000000001',
  '99999999-9999-4999-8999-100000000001',
  '22222222-2222-4222-8222-100000000003',
  '33333333-3333-4333-8333-100000000001',
  'trialing',
  now(), now() + INTERVAL '14 days', now() + INTERVAL '14 days'
) ON CONFLICT (workspace_id) DO NOTHING;

-- Grant all 8 modules to demo workspace
INSERT INTO workspace_modules (workspace_id, module_id, source, enabled)
SELECT '99999999-9999-4999-8999-100000000001', m.id, 'basket', true
FROM modules m
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Default pipeline with 5 stages
-- ----------------------------------------------------------------------------

INSERT INTO pipelines (id, workspace_id, name, description, is_default, position) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-100000000001',
   '99999999-9999-4999-8999-100000000001',
   'Pipeline Padrao','Funil de vendas principal', true, 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO pipeline_stages (id, pipeline_id, name, position, probability, color, is_won, is_lost, rotting_days) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-200000000001','aaaaaaaa-aaaa-4aaa-8aaa-100000000001','Qualificacao',0,10, '#6366F1', false, false, 14),
  ('aaaaaaaa-aaaa-4aaa-8aaa-200000000002','aaaaaaaa-aaaa-4aaa-8aaa-100000000001','Proposta',    1,40, '#F59E0B', false, false, 21),
  ('aaaaaaaa-aaaa-4aaa-8aaa-200000000003','aaaaaaaa-aaaa-4aaa-8aaa-100000000001','Negociacao',  2,70, '#FF5E1A', false, false, 14),
  ('aaaaaaaa-aaaa-4aaa-8aaa-200000000004','aaaaaaaa-aaaa-4aaa-8aaa-100000000001','Fechamento', 3,90, '#10B981', true,  false, 7),
  ('aaaaaaaa-aaaa-4aaa-8aaa-200000000005','aaaaaaaa-aaaa-4aaa-8aaa-100000000001','Perdido',     4, 0, '#EF4444', false, true,  NULL)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Loss reasons
-- ----------------------------------------------------------------------------

INSERT INTO loss_reasons (id, workspace_id, name, is_active) VALUES
  ('bbbbbbbb-bbbb-4bbb-8bbb-100000000001','99999999-9999-4999-8999-100000000001','Preco alto',      true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-100000000002','99999999-9999-4999-8999-100000000001','Concorrencia',    true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-100000000003','99999999-9999-4999-8999-100000000001','Timing ruim',     true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-100000000004','99999999-9999-4999-8999-100000000001','Nao respondeu',  true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-100000000005','99999999-9999-4999-8999-100000000001','Sem orcamento',   true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Mock companies + contacts + deals for proto views
-- ----------------------------------------------------------------------------

INSERT INTO companies (id, workspace_id, name, website, industry) VALUES
  ('cccccccc-cccc-4ccc-8ccc-100000000001','99999999-9999-4999-8999-100000000001','Acme Corp',         'acme.com.br',     'SaaS'),
  ('cccccccc-cccc-4ccc-8ccc-100000000002','99999999-9999-4999-8999-100000000001','Globex Industries', 'globex.com.br',   'Industria'),
  ('cccccccc-cccc-4ccc-8ccc-100000000003','99999999-9999-4999-8999-100000000001','Initech',            'initech.com.br', 'Tech')
ON CONFLICT (id) DO NOTHING;

INSERT INTO contacts (id, workspace_id, company_id, name, email, phone, whatsapp, position, lifecycle_stage, source) VALUES
  ('dddddddd-dddd-4ddd-8ddd-100000000001','99999999-9999-4999-8999-100000000001','cccccccc-cccc-4ccc-8ccc-100000000001','Joao Silva',      'joao@acme.com.br',   '+5511900000001','+5511900000001','CEO',           'sql',        'meta_ads'),
  ('dddddddd-dddd-4ddd-8ddd-100000000002','99999999-9999-4999-8999-100000000001','cccccccc-cccc-4ccc-8ccc-100000000001','Maria Santos',   'maria@acme.com.br',  '+5511900000002','+5511900000002','CFO',           'mql',        'meta_ads'),
  ('dddddddd-dddd-4ddd-8ddd-100000000003','99999999-9999-4999-8999-100000000001','cccccccc-cccc-4ccc-8ccc-100000000002','Pedro Souza',    'pedro@globex.com.br','+5511900000003','+5511900000003','Diretor',       'sql',        'organic'),
  ('dddddddd-dddd-4ddd-8ddd-100000000004','99999999-9999-4999-8999-100000000001','cccccccc-cccc-4ccc-8ccc-100000000002','Ana Costa',       'ana@globex.com.br', '+5511900000004','+5511900000004','Gerente',       'opportunity','referral'),
  ('dddddddd-dddd-4ddd-8ddd-100000000005','99999999-9999-4999-8999-100000000001','cccccccc-cccc-4ccc-8ccc-100000000003','Lucas Pereira',  'lucas@initech.com.br','+5511900000005','+5511900000005','Founder',       'lead',       'meta_ads'),
  ('dddddddd-dddd-4ddd-8ddd-100000000006','99999999-9999-4999-8999-100000000001','cccccccc-cccc-4ccc-8ccc-100000000003','Julia Rocha',    'julia@initech.com.br','+5511900000006','+5511900000006','CTO',           'mql',        'prospecting'),
  ('dddddddd-dddd-4ddd-8ddd-100000000007','99999999-9999-4999-8999-100000000001',NULL,                                   'Carlos Mendes', 'carlos@gmail.com',    '+5511900000007','+5511900000007','Autonomo',      'lead',       'organic'),
  ('dddddddd-dddd-4ddd-8ddd-100000000008','99999999-9999-4999-8999-100000000001',NULL,                                   'Fernanda Lima', 'fernanda@gmail.com',  '+5511900000008','+5511900000008','Consultora',    'sql',        'referral'),
  ('dddddddd-dddd-4ddd-8ddd-100000000009','99999999-9999-4999-8999-100000000001',NULL,                                   'Roberto Alves', 'roberto@gmail.com',   '+5511900000009','+5511900000009','Empresario',    'lead',       'meta_ads'),
  ('dddddddd-dddd-4ddd-8ddd-100000000010','99999999-9999-4999-8999-100000000001',NULL,                                   'Beatriz Nunes', 'beatriz@gmail.com',   '+5511900000010','+5511900000010','Analista',      'mql',        'website')
ON CONFLICT (id) DO NOTHING;

INSERT INTO deals (id, workspace_id, pipeline_id, stage_id, contact_id, company_id, title, value, currency, status, position, expected_close_date, source) VALUES
  ('eeeeeeee-eeee-4eee-8eee-100000000001','99999999-9999-4999-8999-100000000001','aaaaaaaa-aaaa-4aaa-8aaa-100000000001','aaaaaaaa-aaaa-4aaa-8aaa-200000000002','dddddddd-dddd-4ddd-8ddd-100000000001','cccccccc-cccc-4ccc-8ccc-100000000001','Acme — Plano Anual',           24000.00,'BRL','open',0,(CURRENT_DATE + 30),'meta_ads'),
  ('eeeeeeee-eeee-4eee-8eee-100000000002','99999999-9999-4999-8999-100000000001','aaaaaaaa-aaaa-4aaa-8aaa-100000000001','aaaaaaaa-aaaa-4aaa-8aaa-200000000003','dddddddd-dddd-4ddd-8ddd-100000000003','cccccccc-cccc-4ccc-8ccc-100000000002','Globex — Implantacao',         58000.00,'BRL','open',0,(CURRENT_DATE + 45),'organic'),
  ('eeeeeeee-eeee-4eee-8eee-100000000003','99999999-9999-4999-8999-100000000001','aaaaaaaa-aaaa-4aaa-8aaa-100000000001','aaaaaaaa-aaaa-4aaa-8aaa-200000000001','dddddddd-dddd-4ddd-8ddd-100000000005','cccccccc-cccc-4ccc-8ccc-100000000003','Initech — POC 3 meses',         9000.00,'BRL','open',0,(CURRENT_DATE + 14),'meta_ads'),
  ('eeeeeeee-eeee-4eee-8eee-100000000004','99999999-9999-4999-8999-100000000001','aaaaaaaa-aaaa-4aaa-8aaa-100000000001','aaaaaaaa-aaaa-4aaa-8aaa-200000000004','dddddddd-dddd-4ddd-8ddd-100000000004','cccccccc-cccc-4ccc-8ccc-100000000002','Globex — Expansao',            32000.00,'BRL','won', 0, CURRENT_DATE,'referral'),
  ('eeeeeeee-eeee-4eee-8eee-100000000005','99999999-9999-4999-8999-100000000001','aaaaaaaa-aaaa-4aaa-8aaa-100000000001','aaaaaaaa-aaaa-4aaa-8aaa-200000000002','dddddddd-dddd-4ddd-8ddd-100000000008',NULL,                                   'Fernanda — Consultoria',       7500.00, 'BRL','open',1,(CURRENT_DATE + 10),'referral')
ON CONFLICT (id) DO NOTHING;

UPDATE deals SET closed_at = now() WHERE id = 'eeeeeeee-eeee-4eee-8eee-100000000004' AND closed_at IS NULL;

-- ----------------------------------------------------------------------------
-- Lead sources (origem dos negocios)
-- ----------------------------------------------------------------------------

INSERT INTO lead_sources (workspace_id, deal_id, contact_id, source_type, utm_source, utm_medium, utm_campaign, cost, captured_at) VALUES
  ('99999999-9999-4999-8999-100000000001','eeeeeeee-eeee-4eee-8eee-100000000001','dddddddd-dddd-4ddd-8ddd-100000000001','meta_ads','facebook','cpc','acme-lead-gen', 42.50, now() - INTERVAL '10 days'),
  ('99999999-9999-4999-8999-100000000001','eeeeeeee-eeee-4eee-8eee-100000000002','dddddddd-dddd-4ddd-8ddd-100000000003','organic','google',    'organic','seo',              0.00, now() - INTERVAL '6 days'),
  ('99999999-9999-4999-8999-100000000001','eeeeeeee-eeee-4eee-8eee-100000000003','dddddddd-dddd-4ddd-8ddd-100000000005','meta_ads','instagram','cpc','initech-retarget', 18.20,now() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Activities
-- ----------------------------------------------------------------------------

INSERT INTO activities (workspace_id, deal_id, contact_id, user_id, type, title, due_date, completed) VALUES
  ('99999999-9999-4999-8999-100000000001','eeeeeeee-eeee-4eee-8eee-100000000001','dddddddd-dddd-4ddd-8ddd-100000000001','99999999-9999-4999-8999-200000000001','call',    'Ligar para Joao',          now() + INTERVAL '2 days',  false),
  ('99999999-9999-4999-8999-100000000001','eeeeeeee-eeee-4eee-8eee-100000000002','dddddddd-dddd-4ddd-8ddd-100000000003','99999999-9999-4999-8999-200000000001','meeting','Reuniao de apresentacao',  now() + INTERVAL '1 day',   false),
  ('99999999-9999-4999-8999-100000000001','eeeeeeee-eeee-4eee-8eee-100000000003','dddddddd-dddd-4ddd-8ddd-100000000005','99999999-9999-4999-8999-200000000001','email',   'Enviar proposta Initech',  now() - INTERVAL '1 day',   true)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Demo Meta Ads account + sample campaign with metrics
-- ----------------------------------------------------------------------------

INSERT INTO ad_accounts (id, workspace_id, provider, provider_account_id, name, currency, timezone, status) VALUES
  ('ffffffff-ffff-4fff-8fff-100000000001','99999999-9999-4999-8999-100000000001','meta','act_demo_000001','Conta Demo Meta','BRL','America/Sao_Paulo','active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO campaigns (id, workspace_id, ad_account_id, name, objective, status, daily_budget, start_date) VALUES
  ('f1f1f1f1-f1f1-4f1f-8f1f-100000000001','99999999-9999-4999-8999-100000000001','ffffffff-ffff-4fff-8fff-100000000001','Campanha Lead Gen — Demo','lead_gen','active', 50.00, CURRENT_DATE - 14),
  ('f1f1f1f1-f1f1-4f1f-8f1f-100000000002','99999999-9999-4999-8999-100000000001','ffffffff-ffff-4fff-8fff-100000000001','Campanha Retarget — Demo','conversions','paused', 30.00, CURRENT_DATE - 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO campaign_metrics (campaign_id, date, impressions, reach, clicks, ctr, leads, cpl, spend, roas)
SELECT
  'f1f1f1f1-f1f1-4f1f-8f1f-100000000001',
  (CURRENT_DATE - d),
  (random()*5000 + 2000)::bigint,
  (random()*3000 + 1200)::bigint,
  (random()*200 + 50)::bigint,
  round((random()*0.05 + 0.01)::numeric, 4),
  (random()*15 + 2)::int,
  round((random()*30 + 15)::numeric, 2),
  round((random()*200 + 80)::numeric, 2),
  round((random()*4 + 1)::numeric, 4)
FROM generate_series(0, 13) d
ON CONFLICT (campaign_id, date, hour) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Seed usage records (monthly period) so feature-gate shows sane defaults
-- ----------------------------------------------------------------------------

INSERT INTO usage_records (workspace_id, resource, current_count, limit_count, period_start, period_end)
VALUES
  ('99999999-9999-4999-8999-100000000001','users',          1, -1,   date_trunc('month', now())::date, (date_trunc('month', now()) + INTERVAL '1 month' - INTERVAL '1 day')::date),
  ('99999999-9999-4999-8999-100000000001','ad_accounts',    1, -1,   date_trunc('month', now())::date, (date_trunc('month', now()) + INTERVAL '1 month' - INTERVAL '1 day')::date),
  ('99999999-9999-4999-8999-100000000001','campaigns',      2, -1,   date_trunc('month', now())::date, (date_trunc('month', now()) + INTERVAL '1 month' - INTERVAL '1 day')::date),
  ('99999999-9999-4999-8999-100000000001','landing_pages',  0,  50,  date_trunc('month', now())::date, (date_trunc('month', now()) + INTERVAL '1 month' - INTERVAL '1 day')::date),
  ('99999999-9999-4999-8999-100000000001','emails_sent',    0,  20000, date_trunc('month', now())::date, (date_trunc('month', now()) + INTERVAL '1 month' - INTERVAL '1 day')::date),
  ('99999999-9999-4999-8999-100000000001','ai_generations', 0,  100, date_trunc('month', now())::date, (date_trunc('month', now()) + INTERVAL '1 month' - INTERVAL '1 day')::date)
ON CONFLICT (workspace_id, resource, period_start) DO NOTHING;

-- ============================================================================
-- End of seed
-- ============================================================================
