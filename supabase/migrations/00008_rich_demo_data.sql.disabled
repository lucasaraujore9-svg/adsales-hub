-- ============================================================================
-- AdSales Hub — Rich demo data
-- Migration: 00008
--
-- Idempotent seed extension with more realistic volume so the behavior wiring
-- lights up with live data: more deals, ad sets + ads + metrics, social posts
-- with engagement, emails, landing pages, audiences, reports, insights,
-- invoices and usage.
-- ============================================================================

-- Demo workspace id reused everywhere
-- 99999999-9999-4999-8999-100000000001

-- ----------------------------------------------------------------------------
-- Extra deals, rotate through stages for realistic pipeline volume
-- ----------------------------------------------------------------------------

INSERT INTO deals (id, workspace_id, pipeline_id, stage_id, contact_id, company_id, title, value, currency, status, position, expected_close_date, source, stage_entered_at)
SELECT
  md5('d_seed_' || g)::uuid,
  '99999999-9999-4999-8999-100000000001'::uuid,
  'aaaaaaaa-aaaa-4aaa-8aaa-100000000001'::uuid,
  CASE g % 4
    WHEN 0 THEN 'aaaaaaaa-aaaa-4aaa-8aaa-200000000001'::uuid -- qualificacao
    WHEN 1 THEN 'aaaaaaaa-aaaa-4aaa-8aaa-200000000002'::uuid -- proposta
    WHEN 2 THEN 'aaaaaaaa-aaaa-4aaa-8aaa-200000000003'::uuid -- negociacao
    ELSE        'aaaaaaaa-aaaa-4aaa-8aaa-200000000004'::uuid -- fechamento
  END,
  CASE g % 10
    WHEN 0 THEN 'dddddddd-dddd-4ddd-8ddd-100000000001'::uuid
    WHEN 1 THEN 'dddddddd-dddd-4ddd-8ddd-100000000002'::uuid
    WHEN 2 THEN 'dddddddd-dddd-4ddd-8ddd-100000000003'::uuid
    WHEN 3 THEN 'dddddddd-dddd-4ddd-8ddd-100000000004'::uuid
    WHEN 4 THEN 'dddddddd-dddd-4ddd-8ddd-100000000005'::uuid
    WHEN 5 THEN 'dddddddd-dddd-4ddd-8ddd-100000000006'::uuid
    WHEN 6 THEN 'dddddddd-dddd-4ddd-8ddd-100000000007'::uuid
    WHEN 7 THEN 'dddddddd-dddd-4ddd-8ddd-100000000008'::uuid
    WHEN 8 THEN 'dddddddd-dddd-4ddd-8ddd-100000000009'::uuid
    ELSE        'dddddddd-dddd-4ddd-8ddd-100000000010'::uuid
  END,
  CASE g % 3
    WHEN 0 THEN 'cccccccc-cccc-4ccc-8ccc-100000000001'::uuid
    WHEN 1 THEN 'cccccccc-cccc-4ccc-8ccc-100000000002'::uuid
    ELSE        'cccccccc-cccc-4ccc-8ccc-100000000003'::uuid
  END,
  'Proposta ' || g || ' — ' || CASE g % 4 WHEN 0 THEN 'Plano Anual' WHEN 1 THEN 'Implantacao' WHEN 2 THEN 'POC 3m' ELSE 'Expansao' END,
  (5000 + (g * 1237) % 60000)::numeric(12,2),
  'BRL', 'open', g,
  (CURRENT_DATE + ((g * 7) % 60))::date,
  CASE g % 6
    WHEN 0 THEN 'meta_ads' WHEN 1 THEN 'organic' WHEN 2 THEN 'referral'
    WHEN 3 THEN 'website' WHEN 4 THEN 'prospecting' ELSE 'meta_ads'
  END,
  now() - (g || ' days')::interval
FROM generate_series(1, 18) g
ON CONFLICT (id) DO NOTHING;

-- Tag some as won / lost to get historical data
UPDATE deals SET status = 'won', closed_at = now() - INTERVAL '5 days'
WHERE id IN (
  md5('d_seed_1')::uuid, md5('d_seed_5')::uuid, md5('d_seed_9')::uuid,
  md5('d_seed_13')::uuid, md5('d_seed_17')::uuid
) AND status = 'open';

UPDATE deals SET status = 'lost', stage_id = 'aaaaaaaa-aaaa-4aaa-8aaa-200000000005'::uuid,
  loss_reason_id = 'bbbbbbbb-bbbb-4bbb-8bbb-100000000001'::uuid,
  closed_at = now() - INTERVAL '8 days'
WHERE id IN (md5('d_seed_3')::uuid, md5('d_seed_11')::uuid) AND status = 'open';

-- ----------------------------------------------------------------------------
-- Lead sources for deals (so origin chips work correctly)
-- ----------------------------------------------------------------------------

INSERT INTO lead_sources (workspace_id, deal_id, contact_id, source_type, utm_source, utm_medium, utm_campaign, cost, captured_at)
SELECT
  '99999999-9999-4999-8999-100000000001'::uuid,
  d.id, d.contact_id,
  d.source::text,
  CASE d.source WHEN 'meta_ads' THEN 'facebook' WHEN 'google_ads' THEN 'google' ELSE 'website' END,
  CASE WHEN d.source LIKE '%_ads' THEN 'cpc' ELSE 'organic' END,
  CASE d.source WHEN 'meta_ads' THEN 'lead-gen-q2' WHEN 'google_ads' THEN 'brand-pt-br' ELSE 'seo' END,
  CASE WHEN d.source = 'meta_ads' THEN 35 WHEN d.source = 'google_ads' THEN 55 ELSE 0 END,
  d.created_at
FROM deals d
WHERE d.workspace_id = '99999999-9999-4999-8999-100000000001'::uuid
  AND NOT EXISTS (SELECT 1 FROM lead_sources ls WHERE ls.deal_id = d.id)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- More activities spread across last 14 days and upcoming 14 days
-- ----------------------------------------------------------------------------

INSERT INTO activities (id, workspace_id, deal_id, contact_id, user_id, type, title, due_date, completed)
SELECT
  md5('a_seed_' || g)::uuid,
  '99999999-9999-4999-8999-100000000001'::uuid,
  (SELECT id FROM deals WHERE workspace_id = '99999999-9999-4999-8999-100000000001'::uuid ORDER BY (g * 13) % 23 LIMIT 1),
  (SELECT contact_id FROM deals WHERE workspace_id = '99999999-9999-4999-8999-100000000001'::uuid ORDER BY (g * 17) % 19 LIMIT 1),
  (SELECT id FROM users WHERE workspace_id = '99999999-9999-4999-8999-100000000001'::uuid ORDER BY (g * 7) % 3 LIMIT 1),
  CASE g % 6
    WHEN 0 THEN 'call' WHEN 1 THEN 'email' WHEN 2 THEN 'whatsapp'
    WHEN 3 THEN 'meeting' WHEN 4 THEN 'task' ELSE 'note'
  END,
  CASE g % 6
    WHEN 0 THEN 'Ligacao de follow-up' WHEN 1 THEN 'Enviar proposta'
    WHEN 2 THEN 'WhatsApp de confirmacao' WHEN 3 THEN 'Reuniao de demo'
    WHEN 4 THEN 'Atualizar CRM' ELSE 'Registrar call'
  END,
  now() + ((g % 20 - 7) || ' days')::interval + ((g * 37) % 12 || ' hours')::interval,
  (g % 3 = 0)
FROM generate_series(1, 40) g
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Ad sets + ads + metrics for the two seed campaigns
-- ----------------------------------------------------------------------------

INSERT INTO ad_sets (id, workspace_id, campaign_id, provider_ad_set_id, name, status, daily_budget, targeting, placements) VALUES
  (md5('as_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'f1f1f1f1-f1f1-4f1f-8f1f-100000000001'::uuid, 'adset_lead_1', 'CEO/CFO SaaS BR',             'active', 25.00, '{"age_min":30,"age_max":55,"genders":["all"]}'::jsonb, '["feed_facebook","feed_instagram"]'::jsonb),
  (md5('as_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'f1f1f1f1-f1f1-4f1f-8f1f-100000000001'::uuid, 'adset_lead_2', 'Lookalike 1% Clientes',       'active', 15.00, '{"age_min":25,"age_max":60,"genders":["all"]}'::jsonb, '["feed_instagram","reels_instagram"]'::jsonb),
  (md5('as_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'f1f1f1f1-f1f1-4f1f-8f1f-100000000001'::uuid, 'adset_lead_3', 'Gestores Mkt PMEs',           'paused', 10.00, '{"age_min":28,"age_max":50,"genders":["all"]}'::jsonb, '["stories_instagram"]'::jsonb),
  (md5('as_4')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'f1f1f1f1-f1f1-4f1f-8f1f-100000000002'::uuid, 'adset_rt_1',   'Visitantes 30d',              'active', 20.00, '{"custom_audiences":["ws_visitors_30"]}'::jsonb,       '["feed_facebook","feed_instagram"]'::jsonb),
  (md5('as_5')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'f1f1f1f1-f1f1-4f1f-8f1f-100000000002'::uuid, 'adset_rt_2',   'Cart abandoners',             'active', 10.00, '{"custom_audiences":["cart_abandon"]}'::jsonb,         '["feed_instagram"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO ad_creatives (id, workspace_id, name, type, file_url, thumbnail_url, tags) VALUES
  (md5('cr_a')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Hero Ana apresentando',   'image', '', '', ARRAY['hero','autoridade']),
  (md5('cr_b')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Reel demo 30s',            'video', '', '', ARRAY['reel','demo']),
  (md5('cr_c')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Carrossel 3 dores',        'carousel','', '', ARRAY['carrossel','dor']),
  (md5('cr_d')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Story UGC depoimento',     'video', '', '', ARRAY['story','ugc']),
  (md5('cr_e')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Banner Awareness v2',      'image', '', '', ARRAY['awareness']),
  (md5('cr_f')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Promo Black Friday',       'image', '', '', ARRAY['promo'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO ads (id, workspace_id, ad_set_id, provider_ad_id, creative_id, name, status, headline, primary_text, cta) VALUES
  (md5('ad_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, md5('as_1')::uuid, 'ad_meta_1', md5('cr_a')::uuid, 'Hero — Camp Lead',  'active', 'Substitua sua agencia por IA', 'Trafego pago + CRM integrado. Trial 14 dias.', 'SAIBA_MAIS'),
  (md5('ad_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, md5('as_1')::uuid, 'ad_meta_2', md5('cr_c')::uuid, 'Carrossel — 3 dores','active', 'R$0 em agencia, +60% leads',    'IA roda suas campanhas Meta 24/7.',            'CADASTRE_SE'),
  (md5('ad_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, md5('as_2')::uuid, 'ad_meta_3', md5('cr_b')::uuid, 'Reel — Lookalike',  'active', 'Demo em 30 segundos',            'Veja como trocamos a agencia num SaaS BR.',    'SAIBA_MAIS'),
  (md5('ad_4')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, md5('as_4')::uuid, 'ad_meta_4', md5('cr_d')::uuid, 'Story — Retarget',  'active', 'Nao perca seu trial',            'Restam 7 dias para testar tudo.',               'COMPRE_AGORA'),
  (md5('ad_5')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, md5('as_5')::uuid, 'ad_meta_5', md5('cr_a')::uuid, 'Hero — Cart',       'active', 'Acabe o cadastro em 30s',        'Finalize seu trial agora.',                     'COMPRE_AGORA')
ON CONFLICT (id) DO NOTHING;

-- Ad set + ad metrics for the last 14 days (both campaigns)
INSERT INTO ad_set_metrics (ad_set_id, date, impressions, reach, clicks, ctr, leads, cpl, spend, roas, frequency)
SELECT
  a.id,
  (CURRENT_DATE - d),
  (40000 + (random()*20000)::int)::bigint,
  (25000 + (random()*15000)::int)::bigint,
  (800 + (random()*600)::int)::bigint,
  round((random()*0.03 + 0.015)::numeric, 4),
  (15 + (random()*10)::int),
  round((random()*15 + 8)::numeric, 2),
  round((a.daily_budget::numeric + (random()*40))::numeric, 2),
  round((random()*3 + 1)::numeric, 4),
  round((random()*1.5 + 1)::numeric, 4)
FROM ad_sets a, generate_series(0, 13) d
WHERE a.workspace_id = '99999999-9999-4999-8999-100000000001'::uuid
ON CONFLICT (ad_set_id, date, hour) DO NOTHING;

INSERT INTO ad_metrics (ad_id, date, impressions, reach, clicks, ctr, leads, cpl, spend, roas, frequency)
SELECT
  ad.id,
  (CURRENT_DATE - d),
  (10000 + (random()*8000)::int)::bigint,
  (6000 + (random()*5000)::int)::bigint,
  (200 + (random()*200)::int)::bigint,
  round((random()*0.05 + 0.015)::numeric, 4),
  (5 + (random()*8)::int),
  round((random()*15 + 8)::numeric, 2),
  round((random()*50 + 15)::numeric, 2),
  round((random()*3 + 1)::numeric, 4),
  round((random()*1.5 + 1)::numeric, 4)
FROM ads ad, generate_series(0, 13) d
WHERE ad.workspace_id = '99999999-9999-4999-8999-100000000001'::uuid
ON CONFLICT (ad_id, date, hour) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Audiences
-- ----------------------------------------------------------------------------

INSERT INTO audiences (id, workspace_id, provider_audience_id, name, type, config, size_estimate) VALUES
  (md5('aud_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'cust_aud_1', 'Clientes ativos (customer file)', 'custom',      '{}'::jsonb,  8432),
  (md5('aud_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'lal_1_br',   'Lookalike 1% Clientes SaaS BR',   'lookalike',   '{"origin":"cust_aud_1","country":"BR","ratio":0.01}'::jsonb, 2100000),
  (md5('aud_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'rt_30',      'Visitantes do site ultimos 30d',  'retargeting', '{"source":"pixel"}'::jsonb, 42800),
  (md5('aud_4')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'saved_mkt',  'Gestores de Marketing BR',        'saved',       '{"interests":["marketing","b2b"]}'::jsonb, 820000),
  (md5('aud_5')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'cart_abn',   'Cart abandoners',                  'retargeting', '{"event":"InitiateCheckout"}'::jsonb, 5640)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Lead form (1) + form submissions
-- ----------------------------------------------------------------------------

INSERT INTO lead_forms (id, workspace_id, campaign_id, provider_form_id, name, headline, description, fields, thank_you_message) VALUES
  (md5('lf_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'f1f1f1f1-f1f1-4f1f-8f1f-100000000001'::uuid, 'form_meta_1', 'Trial 14 dias — AdSales Hub', 'Comece gratis hoje', 'Zero cartao, zero burocracia.',
    '[{"key":"name","label":"Nome","type":"text","required":true},{"key":"email","label":"Email","type":"email","required":true},{"key":"whatsapp","label":"WhatsApp","type":"phone","required":true}]'::jsonb,
    'Obrigado! Em instantes voce recebera o acesso por email.')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Landing pages + forms + submissions
-- ----------------------------------------------------------------------------

INSERT INTO landing_pages (id, workspace_id, name, slug, template_id, content, domain, published, published_at, meta_pixel_id) VALUES
  (md5('lp_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Lead Gen SaaS PMEs',    'saas-pmes',  NULL, '{}'::jsonb, 'lp.adsaleshub.com.br',      true,  now() - INTERVAL '6 days',  'px_123'),
  (md5('lp_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Trial 14 dias',         'trial-14',   NULL, '{}'::jsonb, 'adsaleshub.com.br',          true,  now() - INTERVAL '3 days',  'px_123'),
  (md5('lp_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Webinar Escala IA',     'webinar-ia', NULL, '{}'::jsonb, 'eventos.adsaleshub.com.br',  true,  now() - INTERVAL '12 days', 'px_123'),
  (md5('lp_4')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'E-book Meta Ads 2026',  'ebook-meta', NULL, '{}'::jsonb, 'lp.adsaleshub.com.br',       false, NULL,                         NULL),
  (md5('lp_5')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Promo Black Friday',    'bf-2026',    NULL, '{}'::jsonb, 'lp.adsaleshub.com.br',       false, NULL,                         NULL)
ON CONFLICT (workspace_id, slug) DO NOTHING;

INSERT INTO forms (id, workspace_id, name, slug, fields, thank_you_message, is_active) VALUES
  (md5('fm_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Formulario Principal Home', 'home-form',   '[{"key":"name","label":"Nome","type":"text","required":true},{"key":"email","label":"Email","type":"email","required":true},{"key":"whatsapp","label":"WhatsApp","type":"phone","required":true},{"key":"company","label":"Empresa","type":"text","required":false},{"key":"message","label":"Mensagem","type":"text","required":false}]'::jsonb, 'Obrigado, retornaremos em breve!', true),
  (md5('fm_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Pop-up Exit Intent',        'exit-intent', '[{"key":"name","label":"Nome","type":"text","required":true},{"key":"email","label":"Email","type":"email","required":true},{"key":"goal","label":"Principal objetivo","type":"select","required":true,"options":["Reduzir CPL","Mais leads","Escalar vendas"]}]'::jsonb, 'Enviado!', true),
  (md5('fm_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Webinar Escala IA — Inscricao','webinar-inscricao','[{"key":"name","label":"Nome","type":"text","required":true},{"key":"email","label":"Email","type":"email","required":true},{"key":"phone","label":"Telefone","type":"phone","required":true},{"key":"role","label":"Cargo","type":"text","required":false}]'::jsonb, 'Voce esta inscrito!', true)
ON CONFLICT (workspace_id, slug) DO NOTHING;

INSERT INTO form_submissions (workspace_id, form_id, landing_page_id, data, utm_source, utm_medium, utm_campaign, deal_id, contact_id, created_at)
SELECT
  '99999999-9999-4999-8999-100000000001'::uuid,
  md5('fm_1')::uuid,
  md5('lp_1')::uuid,
  jsonb_build_object('name','Lead '||g, 'email','lead'||g||'@exemplo.com','whatsapp','+551199'||lpad(g::text, 6, '0')),
  'facebook','cpc','lead-gen-q2',
  (SELECT id FROM deals WHERE workspace_id='99999999-9999-4999-8999-100000000001'::uuid ORDER BY random() LIMIT 1),
  (SELECT id FROM contacts WHERE workspace_id='99999999-9999-4999-8999-100000000001'::uuid ORDER BY random() LIMIT 1),
  now() - ((g * 7) || ' hours')::interval
FROM generate_series(1, 32) g
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Email campaigns + metrics
-- ----------------------------------------------------------------------------

INSERT INTO email_campaigns (id, workspace_id, name, subject, from_name, from_email, content, status, sent_at) VALUES
  (md5('ec_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Newsletter Q2 #4',          'Como escalamos R$0 -> R$120k em 60 dias', 'Lucas (AdSales)','news@adsaleshub.com.br','<p>Conteudo...</p>','sent',     now() - INTERVAL '4 days'),
  (md5('ec_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Welcome Flow — Dia 1',      'Bem-vindo ao AdSales Hub',                 'Lucas (AdSales)','welcome@adsaleshub.com.br','<p>...</p>','sent',   now() - INTERVAL '10 days'),
  (md5('ec_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Black Friday Teaser',        'Vem ai: 50% off no primeiro trimestre',   'Lucas (AdSales)','promo@adsaleshub.com.br','<p>...</p>','scheduled',NULL),
  (md5('ec_4')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Reativacao — 60d sem login', 'Voltamos? Tem novidade te esperando',      'Lucas (AdSales)','reengage@adsaleshub.com.br','<p>...</p>','draft', NULL)
ON CONFLICT (id) DO NOTHING;

UPDATE email_campaigns SET scheduled_at = now() + INTERVAL '6 days' WHERE id = md5('ec_3')::uuid AND scheduled_at IS NULL;

INSERT INTO email_campaign_metrics (email_campaign_id, sent, delivered, opened, clicked, unsubscribed, bounced, open_rate, click_rate) VALUES
  (md5('ec_1')::uuid, 4280, 4235, 1692, 384, 12, 45, 39.95, 9.07),
  (md5('ec_2')::uuid, 1250, 1240, 892,  312, 4,  10, 71.94, 25.16)
ON CONFLICT (email_campaign_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Social accounts + posts + metrics
-- ----------------------------------------------------------------------------

INSERT INTO social_accounts (id, workspace_id, platform, account_name, account_id, profile_url, status) VALUES
  (md5('sa_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'instagram', '@adsaleshub',   'ig_123', 'https://instagram.com/adsaleshub',   'active'),
  (md5('sa_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'facebook',  'AdSales Hub',   'fb_123', 'https://facebook.com/adsaleshub',    'active'),
  (md5('sa_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'linkedin',  'AdSales Hub',   'li_123', 'https://linkedin.com/company/adsaleshub','active'),
  (md5('sa_4')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'tiktok',    '@adsaleshub',   'tk_123', 'https://tiktok.com/@adsaleshub',      'active'),
  (md5('sa_5')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'youtube',   'AdSales Hub',   'yt_123', 'https://youtube.com/@adsaleshub',     'expired')
ON CONFLICT (workspace_id, platform, account_id) DO NOTHING;

INSERT INTO social_posts (id, workspace_id, created_by_user_id, content_text, hashtags, platforms, status, published_at, scheduled_at) VALUES
  (md5('sp_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, '99999999-9999-4999-8999-200000000001'::uuid, 'A diferenca entre uma agencia e um sistema que pensa por voce? A IA nao tira ferias. Rodamos R$180k em 30 dias, 100% automatizado.', ARRAY['#MetaAds','#CRM','#GrowthMarketing','#IA'], '["instagram","linkedin"]'::jsonb, 'published',       now() - INTERVAL '3 days', NULL),
  (md5('sp_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, '99999999-9999-4999-8999-200000000001'::uuid, 'Briefing em texto -> IA gera 4 ad_sets, 12 ads, 2 lead forms, copy + criativos visuais em 2 minutos.',                                ARRAY['#AIMarketing','#Automation'],            '["instagram","facebook","tiktok"]'::jsonb, 'scheduled',  NULL, now() + INTERVAL '2 days'),
  (md5('sp_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, '99999999-9999-4999-8999-200000000001'::uuid, 'Acabei de descobrir uma feature. Quando uma campanha da CPL 3x acima da media, a IA DESATIVA sozinha.',                             ARRAY['#Produto','#Automation'],                '["instagram","linkedin","facebook"]'::jsonb, 'pending_approval', NULL, NULL),
  (md5('sp_4')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, '99999999-9999-4999-8999-200000000001'::uuid, 'Case de cliente: +412 leads em 18 dias com R$4.5k investidos. CPL R$10.92. Full funnel automatizado.',                               ARRAY['#Case','#ROI'],                          '["instagram","linkedin"]'::jsonb, 'draft',           NULL, NULL),
  (md5('sp_5')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, '99999999-9999-4999-8999-200000000001'::uuid, 'Quer rodar trafego pago sem agencia? Testamos em 30+ contas e o CPL cai em media 40%.',                                              ARRAY['#Growth'],                                '["instagram","tiktok"]'::jsonb, 'idea',              NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO social_post_metrics (social_post_id, platform, provider_post_id, impressions, reach, likes, comments, shares, saves, engagement_rate) VALUES
  (md5('sp_1')::uuid, 'instagram', 'ig_post_1', 8400, 5400, 312, 38, 54, 82, 5.8),
  (md5('sp_1')::uuid, 'linkedin',  'li_post_1', 4000, 2800, 120, 10, 28, 42, 5.6)
ON CONFLICT (social_post_id, platform) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Reports + schedules + AI insights + AI questions
-- ----------------------------------------------------------------------------

INSERT INTO report_templates (id, workspace_id, name, description, type, sections, is_default) VALUES
  (md5('rt_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Executivo mensal',     'Visao geral + conquistas + proximos passos',          'unified', '["overview","campaigns","sales","forecast","recommendations","appendix"]'::jsonb, true),
  (md5('rt_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Performance Meta Ads', 'Campanhas, publicos, criativos, otimizacoes da IA',   'traffic', '["summary","spend","metrics","top_creatives","audiences","ai_suggestions","appendix"]'::jsonb, false),
  (md5('rt_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Cliente white-label',   'PDF branded com logo + cores do cliente',             'client',  '["cover","summary","metrics","campaigns","insights","next_steps","contact"]'::jsonb, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO reports (id, workspace_id, template_id, name, type, period_start, period_end, status, pdf_url, created_at) VALUES
  (md5('r_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, md5('rt_3')::uuid, 'Acme Corp — Marco 2026',  'client',  CURRENT_DATE - 60, CURRENT_DATE - 30, 'sent',       'https://demo/pdf/r1.pdf', now() - INTERVAL '3 days'),
  (md5('r_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, md5('rt_2')::uuid, 'Performance Meta Q1',     'traffic', CURRENT_DATE - 90, CURRENT_DATE,      'ready',      'https://demo/pdf/r2.pdf', now() - INTERVAL '1 day'),
  (md5('r_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, md5('rt_1')::uuid, 'Executivo — Abril 2026',  'unified', CURRENT_DATE - 30, CURRENT_DATE,      'generating', NULL,                       now() - INTERVAL '5 minutes')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ai_insights (id, workspace_id, area, type, title, description, severity, suggested_action, created_at) VALUES
  (md5('ins_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'unified', 'correlation', 'Leads de Lookalike 1% convertem 3.2x mais', 'Nos ultimos 30 dias, leads dessa audiencia fecharam a 14.2% vs 4.4% da media geral.', 'opportunity', 'Realocar 40% do budget de awareness para essa audiencia.', now() - INTERVAL '12 hours'),
  (md5('ins_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'traffic', 'anomaly',     'CPL Awareness +180% em 5 dias',              'De R$ 26 para R$ 72. Frequencia 4.2x. Fadiga de audiencia.',                         'critical',    'Pausar ads com freq > 3.5 e criar 3 novos criativos.',    now() - INTERVAL '6 hours'),
  (md5('ins_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'sales',   'trend',       'Conversao SQL->Proposta +12pp no mes',        'De 47% para 59%. Coincide com novo script de qualificacao.',                          'info',         NULL,                                                       now() - INTERVAL '1 day'),
  (md5('ins_4')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'social',  'recommendation','Reels UGC geram 3x mais engajamento',       'Reels 9x16 com depoimentos reais: eng rate 7.2% vs 2.1% feed 1x1.',                   'opportunity', 'Aumentar producao para 2 reels UGC por semana.',          now() - INTERVAL '2 days'),
  (md5('ins_5')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'unified', 'forecast',    '+38% leads em abril mantendo budget',         'Com base no crescimento dos ultimos 4 meses e sazonalidade Q2: ~1040 leads vs 750.',  'info',         NULL,                                                       now() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ai_questions (id, workspace_id, question, answer, created_at) VALUES
  (md5('q_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Qual publico tem melhor ROAS?',                                 'Lookalike 1% Clientes SaaS BR com 4.4x, seguido de Visitantes 30d com 5.2x.',                    now() - INTERVAL '2 hours'),
  (md5('q_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Qual vendedor tem maior conv SQL?',                             'Carla Mendes lidera com 13.4%, seguida de Ana Julia com 11.8%.',                                  now() - INTERVAL '1 day'),
  (md5('q_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'Quanto gastamos em Meta Ads mes passado?',                      'R$ 18.247,53 distribuidos entre 5 campanhas. ROAS consolidado: 3.8x.',                           now() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- AI optimization logs
-- ----------------------------------------------------------------------------

INSERT INTO ai_optimization_logs (id, workspace_id, campaign_id, type, action, details, status, created_at) VALUES
  (md5('opt_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'f1f1f1f1-f1f1-4f1f-8f1f-100000000001'::uuid, 'suggestion','increase_budget',  '{"target":"Lookalike 1%","delta_pct":30,"rationale":"CPL 30% abaixo da media"}'::jsonb, 'pending', now() - INTERVAL '3 hours'),
  (md5('opt_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'f1f1f1f1-f1f1-4f1f-8f1f-100000000002'::uuid, 'auto_action','pause_ad',        '{"target":"Creative Hero v4","frequency":4.2}'::jsonb, 'pending', now() - INTERVAL '5 hours'),
  (md5('opt_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'f1f1f1f1-f1f1-4f1f-8f1f-100000000001'::uuid, 'suggestion','new_creative',    '{"target":"Lookalike 1%","reason":"CTR decrescente"}'::jsonb, 'pending', now() - INTERVAL '8 hours'),
  (md5('opt_4')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'f1f1f1f1-f1f1-4f1f-8f1f-100000000002'::uuid, 'suggestion','adjust_audience', '{"target":"Awareness","filter":"CEO/CFO 30-55"}'::jsonb, 'approved', now() - INTERVAL '2 days'),
  (md5('opt_5')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, 'f1f1f1f1-f1f1-4f1f-8f1f-100000000002'::uuid, 'auto_action','decrease_budget', '{"target":"Awareness","delta_pct":-50}'::jsonb, 'applied', now() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Invoices (historical)
-- ----------------------------------------------------------------------------

INSERT INTO invoices (id, workspace_id, subscription_id, stripe_invoice_id, number, amount, currency, status, payment_method, pdf_url, due_date, paid_at, created_at) VALUES
  (md5('inv_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, '99999999-9999-4999-8999-300000000001'::uuid, 'in_demo_1', 'INV-2026-0042', 1490.00, 'BRL', 'paid', 'credit_card', 'https://demo/inv/1.pdf', CURRENT_DATE - 30,  now() - INTERVAL '30 days', now() - INTERVAL '30 days'),
  (md5('inv_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, '99999999-9999-4999-8999-300000000001'::uuid, 'in_demo_2', 'INV-2026-0039', 1490.00, 'BRL', 'paid', 'credit_card', 'https://demo/inv/2.pdf', CURRENT_DATE - 60,  now() - INTERVAL '60 days', now() - INTERVAL '60 days'),
  (md5('inv_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, '99999999-9999-4999-8999-300000000001'::uuid, 'in_demo_3', 'INV-2026-0035', 1490.00, 'BRL', 'paid', 'pix',         'https://demo/inv/3.pdf', CURRENT_DATE - 90,  now() - INTERVAL '90 days', now() - INTERVAL '90 days'),
  (md5('inv_4')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, '99999999-9999-4999-8999-300000000001'::uuid, 'in_demo_4', 'INV-2026-0031', 690.00,  'BRL', 'paid', 'credit_card', 'https://demo/inv/4.pdf', CURRENT_DATE - 120, now() - INTERVAL '120 days', now() - INTERVAL '120 days')
ON CONFLICT (stripe_invoice_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Updated usage with realistic numbers
-- ----------------------------------------------------------------------------

UPDATE usage_records SET current_count = 4    WHERE workspace_id = '99999999-9999-4999-8999-100000000001'::uuid AND resource = 'users';
UPDATE usage_records SET current_count = 5    WHERE workspace_id = '99999999-9999-4999-8999-100000000001'::uuid AND resource = 'landing_pages';
UPDATE usage_records SET current_count = 5530 WHERE workspace_id = '99999999-9999-4999-8999-100000000001'::uuid AND resource = 'emails_sent';
UPDATE usage_records SET current_count = 48   WHERE workspace_id = '99999999-9999-4999-8999-100000000001'::uuid AND resource = 'ai_generations';

-- ----------------------------------------------------------------------------
-- Goals
-- ----------------------------------------------------------------------------

INSERT INTO goals (id, workspace_id, owner_user_id, scope, metric, target, achieved, period_type, period_start, period_end) VALUES
  (md5('goal_1')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, '99999999-9999-4999-8999-200000000001'::uuid, 'user', 'revenue',  180000, 148800, 'monthly', date_trunc('month', now())::date, (date_trunc('month', now()) + INTERVAL '1 month' - INTERVAL '1 day')::date),
  (md5('goal_2')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, NULL,                                             'workspace', 'deals_won', 60, 58, 'monthly', date_trunc('month', now())::date, (date_trunc('month', now()) + INTERVAL '1 month' - INTERVAL '1 day')::date),
  (md5('goal_3')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, NULL,                                             'workspace', 'roas',      4.0, 4.2, 'monthly', date_trunc('month', now())::date, (date_trunc('month', now()) + INTERVAL '1 month' - INTERVAL '1 day')::date),
  (md5('goal_4')::uuid, '99999999-9999-4999-8999-100000000001'::uuid, NULL,                                             'workspace', 'cpl',       12.0, 10.92,'monthly', date_trunc('month', now())::date, (date_trunc('month', now()) + INTERVAL '1 month' - INTERVAL '1 day')::date)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Workspace branding defaults
-- ----------------------------------------------------------------------------

INSERT INTO workspace_branding (workspace_id, accent_color)
VALUES ('99999999-9999-4999-8999-100000000001'::uuid, '#FF5E1A')
ON CONFLICT (workspace_id) DO NOTHING;
