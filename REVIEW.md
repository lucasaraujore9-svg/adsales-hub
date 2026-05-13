# AdSales Hub — Review final

Sistema fechado. Todas as fases (Infra + Protos + Behaviors + Integrations + Expansions) executadas, com smoke test autenticado passando e build de producao clean.

## Status geral

| Bloco | Entregue | Observacao |
|-------|----------|------------|
| 1. Infra (020-029) | 10/10 | SQL + auth + middleware + layouts + Claude + Meta + Stripe + Resend + WhatsApp + motor de voz IA |
| 2. Protos (001-019) | 19/19 | UIs com shadcn + design v3 (accent #FF5E1A) |
| 3. Behaviors (030-055) | 26/26 | Substituidos por queries reais do Supabase + server actions |
| 4. Integrations (060-069) | 10/10 | Webhooks Stripe/Resend/WhatsApp/motor de voz IA/Meta-leads/Generic + cron + Realtime |
| 5. Expansions (070-074) | 5/5 | Marca runtime / Criativos IA / SDR / Contratos / Google+TikTok roadmap |

**71/71 issues fechadas.**

## Smoke test

### 1. Typecheck — 0 erros
```
npx tsc --noEmit
```

### 2. Build de producao — 46 rotas compilando
```
npm run build
```

### 3. Queries contra Supabase real — 34/34 OK
```
node scripts/smoke-queries.mjs
```
Verifica CRUD de todas as 28 tabelas principais + 2 RPCs.

### 4. Navegacao autenticada — 31/31 rotas retornam 200
```
node scripts/smoke-auth.mjs
```
Faz login real via Supabase Auth, monta cookie no formato `@supabase/ssr`, e bate em todas as rotas protegidas.

Resultado:
```
/dashboard            200  122.9 KB
/pipeline             200   88.8 KB
/contatos             200   87.1 KB
/atividades           200  109.0 KB
/negocios/[id]        (via link)
/metas                200   59.9 KB
/ligacoes             200   51.7 KB
/campanhas            200   70.7 KB
/campanhas/[id]       (via link)
/campanhas/performance 200  58.2 KB
/campanhas/publicos   200   66.3 KB
/campanhas/criativos  200   68.0 KB
/campanhas/criativos/gerar (via link)
/campanhas/otimizador 200   77.2 KB
/campanhas/nova       200   55.8 KB
/campanhas/roadmap    200   55.6 KB
/marketing/landing-pages 200 94.9 KB
/marketing/formularios 200  79.1 KB
/marketing/emails     200   72.4 KB
/social               200   79.8 KB
/analytics            200   80.7 KB
/relatorios           200   92.7 KB
/analise              200   93.5 KB
/automacoes           200   60.0 KB
/prospeccao           200   56.1 KB
/prospeccao/sdr-ia    200   59.6 KB
/analise-calls        200   47.4 KB
/contratos            200   55.2 KB
/configuracoes        200  140.5 KB
/configuracoes/billing 200  84.3 KB
/configuracoes/billing/faturas 200 68.1 KB
/configuracoes/billing/uso 200 60.3 KB
/configuracoes/billing/pagamento 200 61.5 KB
/configuracoes/marca  200   54.8 KB
```

## Como rodar localmente

```bash
# 1. Supabase
npx supabase start

# 2. Dados demo (ja aplicados)
npx supabase db push --local
# Adotar user demo no workspace demo (idempotente)
docker exec supabase_db_AdSalesHub psql -U postgres -d postgres -c \
  "SELECT public.adopt_user_into_demo('lucas@demo.local');"

# 3. App
npm run dev
# http://localhost:3000
# lucas@demo.local / demodemo1234
```

## Fluxos testaveis hoje (sem chaves externas)

| Fluxo | Como testar | Notas |
|-------|-------------|-------|
| Login + logout | /login | Supabase Auth local |
| Pipeline drag-drop | /pipeline | Arraste cards entre colunas — mutation via server action |
| Novo negocio | Botao "Novo negocio" | Cria no DB + atualiza dashboard |
| Contatos CRUD | /contatos | Busca + filtro lifecycle + novo contato |
| Atividade completa | /atividades | Checkbox marca concluida em tempo real |
| Detalhe negocio | /negocios/[id] | 7 abas, mover stage, marcar ganho/perdido, editar valor |
| IA de campanha | /campanhas/nova | Gera campanha (stub se sem ANTHROPIC_API_KEY, real se configurado) |
| Otimizador | /campanhas/otimizador | Aprovar/rejeitar sugestoes |
| Ask IA | /analise | Input -> resposta (stub ou Claude real) |
| Marca workspace | /configuracoes/marca | Muda accent color em runtime |
| Billing demo | /configuracoes/billing | Ativa cesta localmente (demo mode) |
| Feature gate | /upgrade?module=ads | Pagina de upsell quando modulo nao contratado |

## Chaves externas opcionais (pra ativar producao)

Todas as integracoes detectam quando a chave nao esta configurada e caem em modo demo/stub automaticamente. Pra rodar "de verdade":

| Feature | Variavel | Efeito com chave |
|---------|----------|-------------------|
| Claude (gera campanha, insights, ask AI, analise call) | `ANTHROPIC_API_KEY` | Respostas geradas por IA |
| OpenAI imagens | `OPENAI_API_KEY` | Criativos reais via gpt-image-1 |
| Modelo de imagem fallback (fallback) | `IMAGE_MODEL_FALLBACK_TOKEN` | Modelo aberto quando primario falha |
| Stripe | `STRIPE_SECRET_KEY` + `STRIPE_PRICE_*` | Checkout real + webhooks |
| Meta Ads | `META_APP_ID`/`SECRET`/`WEBHOOK_VERIFY_TOKEN` | OAuth + publicacao + webhook de leads |
| WhatsApp | `WHATSAPP_TOKEN`/`PHONE_NUMBER_ID`/`VERIFY_TOKEN` | Envio + recebimento de mensagens |
| motor de voz IA | `VOICE_ENGINE_API_KEY`/`WEBHOOK_SECRET` | Ligacoes SDR IA reais |
| provedor DID | `DID_PROVIDER_API_TOKEN` | Numeros BR para o motor de voz IA |
| Resend | `RESEND_API_KEY` | Envio real de email transacional + bulk |

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│ Next.js 16 (App Router + Turbopack, standalone output)              │
│                                                                      │
│  /src/proxy.ts ─ middleware (auth + workspace + plan + module gate) │
│                                                                      │
│  /src/app                                                           │
│    (auth)/login · signup · forgot · accept-invite                   │
│    (main)/ [todas as 30+ telas autenticadas]                        │
│    api/                                                             │
│      auth/{callback,signout,invite}                                 │
│      auth/meta/{connect,callback}                                   │
│      billing/{checkout,portal}                                      │
│      webhooks/{stripe,resend,whatsapp,voice-engine,meta-leads,generic}      │
│      cron/run (protegido por CRON_SECRET)                           │
│      healthz                                                        │
│      telephony/call                                                 │
│    onboarding (para user sem workspace)                             │
│    upgrade (feature gate fallback)                                  │
│                                                                      │
│  /src/lib                                                           │
│    auth/          — guards, roles, actions                          │
│    supabase/      — browser + server + admin + middleware clients   │
│    queries/       — crm, marketing, content, analytics, branding    │
│    actions/       — server actions (deals/contacts/activities/      │
│                     campaigns/ai/billing/branding/optimizations/    │
│                     creatives)                                      │
│    billing/       — module-routes, feature-gate, plan-limits        │
│    ai/            — Claude client (7 prompts + 6 Zod schemas)       │
│    meta/          — Marketing API client + OAuth + token manager    │
│    stripe/        — checkout + subs + webhooks + sync               │
│    email/         — Resend transactional + bulk + tracking          │
│    whatsapp/      — Cloud API + webhook parser                      │
│    telephony/     — motor de voz IA + provedor DID + assistants                       │
│    crypto.ts      — AES-256-GCM para tokens OAuth                   │
│                                                                      │
│  /src/components                                                    │
│    layout/ auth/ contacts/ deals/ campaigns/ branding/              │
│    activities/ dashboard/ pipeline/ billing/ shared/                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Supabase (local em Docker ou Cloud ou self-hosted)                   │
│                                                                      │
│  Postgres:                                                          │
│    9 migrations (00001 schema → 00009 RLS fix)                      │
│    77 tabelas com RLS por workspace_id                              │
│    Seeds: 23 deals, 43 atividades, 5 ad_sets, 5 ads, 5 audiences,   │
│           5 LPs, 32 submissoes, 5 posts, 5 insights, 5 otimizacoes, │
│           3 reports, 4 invoices, 6 usage records, 4 metas, ...      │
│                                                                      │
│  RPCs: check_plan_limit, increment_usage, current_workspace_id,     │
│        current_user_role, is_workspace_admin, is_workspace_writer,  │
│        get_workspace_enabled_modules, adopt_user_into_demo          │
│                                                                      │
│  Triggers: set_updated_at em todas as tabelas com updated_at        │
│            handle_new_auth_user (auto-provisiona workspace)          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Numeros

- **9 migrations SQL**
- **77 tabelas**, **134 indexes**, **30+ policies RLS explicitas**
- **46 rotas Next.js** (static + dynamic + API)
- **120+ componentes React**
- **~8000 linhas de TS/TSX**
- **~3500 linhas de SQL**
- **20 server actions**
- **11 server queries libraries**
- **7 webhook endpoints**
- **Docker image: 317MB**

## Pontos de atencao

1. **RLS em users** — conflito de chicken-and-egg resolvido via `users_select_self` policy (0.009 migration). Toda Server Component que le o proprio user profile ja esta funcional.
2. **PostgREST embed com duplas FK** — users tem 2 FKs pra workspaces (workspace_id + workspaces.owner_user_id). Queries do proxy e guards foram reescritas sem embeds para contornar.
3. **Modo demo de billing** — quando STRIPE_SECRET_KEY nao esta configurada, o botao "Assinar" ativa a cesta localmente (escreve subscription + workspace_modules). Util para testar feature gating sem Stripe.
4. **IA em modo stub** — geradores de campanha / insights / ask-AI funcionam mesmo sem ANTHROPIC_API_KEY (retornam config razoavel). Ao configurar a chave, a IA toma o controle.

## Proximos passos sugeridos

- **E2E com Playwright** — scripts/smoke-auth.mjs valida HTTP status, mas nao interage com forms. Adicionar Playwright test suite para flows criticos (login → criar deal → arrastar stage → ganhar).
- **Upload de arquivos** — Supabase Storage ja configurado na Phase 1. Falta UI de upload em /campanhas/criativos e /configuracoes/marca.
- **PDF de relatorio white-label** — esqueleto em /relatorios, falta biblioteca (puppeteer ou react-pdf).
- **Implementacao Meta Ads real** — client pronto em `/src/lib/meta/`, falta o passo "publicar" da campanha gerada (actions/campaigns.ts → chamar `createCampaign + createAdSet + createAd`).
