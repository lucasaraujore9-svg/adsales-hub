# CLAUDE.md — AdSales Hub

> **Leia este arquivo INTEIRO antes de executar qualquer tarefa.**
> Documentacao detalhada esta em `/docs/`. Issues em `/issues/`. Consulte antes de implementar.

## O Que E Este Projeto

AdSales Hub e um SaaS que substitui agencias de marketing e integra um CRM de vendas completo. Combina trafego pago com IA (Meta Ads automatizado), marketing organico (social media, email marketing, landing pages) e pipeline de vendas — tudo num unico lugar. Sistema 100% focado em vendas, do marketing pago e organico ate o fechamento do negocio.

**Modelo de negocio:** SaaS por assinatura mensal, cobrado por empresa (workspace). Modelo modular por cestas: Operacao (R$290), Crescimento (R$690) e Escala (R$1.490), cada uma com combinacao de modulos (CRM incluso + Ads, Social, Mensagens, BI, Landing Pages, SDR IA, Contratos). Custom Builder permite montar cesta personalizada. Base R$190 + modulos + faixa de midia. Trial de 14 dias. Feature gating por modulo contratado.

**Publico:** PMEs que pagam agencia e querem internalizar, freelancers de trafego, agencias pequenas, empresarios que querem controlar trafego pago + vendas.

**O que NAO e:** Nao e uma agencia (nao tem humanos executando). Nao e um ERP (nao faz financeiro, estoque, NF). Nao e um CMS (nao hospeda sites — landing pages sao focadas em conversao). Nao gera certificados.

**Atores:**
- **Admin** — Acesso total, configuracoes, billing, usuarios
- **Gestor** — Dashboard, relatorios, metas, visao de equipe, aprovar campanhas
- **Vendedor** — Pipeline, contatos, atividades, comunicacao, seus negocios
- **Media Buyer** — Campanhas, criativos, publicos, otimizador, social media
- **Visualizador** — Acesso somente leitura a dashboards e relatorios

**6 Blocos do sistema:**
- **Bloco A** — CRM de Vendas (herda DM Hub completo: pipeline, contatos, empresas, atividades, automacoes, sequencias, templates, campos customizados, produtos, motivos de perda, duplicatas, prospeccao, analise de calls)
- **Bloco B** — Trafego Pago / Meta Ads com IA (campanhas, criativos com IA, publicos, otimizador, lead forms, Conversions API)
- **Bloco C** — Marketing / Conteudo (landing pages, formularios, email mkt, social media, geracao de criativos com IA)
- **Bloco D** — Analytics Unificado (cruza marketing + vendas + relatorios + IA + pergunte a IA)
- **Bloco E** — SDR + Agente de Voz IA (qualificacao automatica por telefone, fila de leads, agendamento de reuniao)
- **Bloco F** — Contratos e Assinatura Eletronica (propostas, contratos, e-signature, versionamento)

**Personalizacao de marca por workspace:**
- Cor de destaque (accent color) customizavel em TODO o sistema (sidebar, botoes, badges, graficos, toggles)
- Logo do workspace (sidebar, relatorios PDF, emails)
- Aplicado via CSS custom properties em runtime (sem rebuild)

**Fluxos criticos:**
1. Briefing em linguagem natural → IA gera campanha + criativos visuais → Preview → Publica via Meta API → Lead entra → Pipeline CRM → Venda
2. Post Social → Aprovacao → Agendamento → Publicacao Automatica → Metricas coletadas
3. Motor IA (ciclo 2 dias) → Analisa campanhas + CRM → Gera insights → Aplica otimizacoes
4. Dados multi-canal → Relatorio gerado em 3s → PDF white-label → Envio agendado ao cliente
5. Trial 14 dias → Checkout (Stripe) → Assinatura ativa → Feature gating por modulo
6. Lead entra → Agente de Voz IA liga e qualifica em 90s → Agenda reuniao → Vendedor notificado
7. Proposta aceita → Contrato gerado → Assinatura eletronica → Negocio fechado automaticamente

## Stack

- **Next.js 14+** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (PostgreSQL + Auth + Realtime + Storage + Edge Functions + RLS)
- **Claude API** (Anthropic) — geracao de campanhas, otimizacao, insights, relatorios, qualificacao por voz
- **OpenAI gpt-image-1** (DALL-E) — geracao de imagens para criativos (primario)
- **Image Model Fallback** — geracao de imagens alternativa (modelos abertos, mais barato)
- **Video Generator** — geracao de videos a partir de templates (motion graphics para ads)
- **Meta Marketing API v21+** — campanhas, ad sets, ads, lead forms, publicos
- **Meta Webhooks** (leadgen) — recebimento de leads em tempo real
- **Meta Conversions API** — server-side tracking
- **Stripe** — assinaturas, pagamentos, invoices, webhooks
- **Instagram Graph API, Facebook Pages API, LinkedIn API, TikTok API, YouTube Data API** — social media
- **Motor de voz IA (Voice Engine)** — telefonia IA (ligacoes inbound/outbound via API, transparente ao usuario)
- **Provedor DID BR** — numeros brasileiros (+55) via API (provisioning, SIP credentials, white-label, SMS)
- **Meta Cloud API** — WhatsApp Business
- **Resend** ou **SendGrid** — email transacional
- **Resend** (bulk) ou **Amazon SES** — email marketing
- **Puppeteer** ou **react-pdf** — geracao de PDFs white-label
- **pg_cron** + **Supabase Edge Functions** — jobs agendados
- **Vercel** (frontend + landing pages) + **Supabase Cloud** (backend)

## Workflow: SPEC -> BREAK -> PLAN -> EXECUTE

Este projeto segue um workflow estruturado. **NUNCA comece a codificar sem seguir estes passos.**

1. **SPEC** — Funcionalidades documentadas em `docs/SPEC.md`
2. **BREAK** — SPEC quebrada em issues individuais em `issues/`
3. **PLAN** — Antes de codar, use `/plan NNN` para ler a issue + docs e planejar
4. **EXECUTE** — Use `/execute NNN` para implementar

### Slash Commands

| Comando | O que faz |
|---------|-----------|
| `/setup` | Inicializar projeto (deps, db, seed) |
| `/plan NNN` | Revisar plano da issue (PLAN ja embutido em cada issue) |
| `/execute NNN` | Executar uma issue seguindo o Plan embutido |
| `/status` | Ver progresso |
| `/next` | Sugerir proxima issue |
| `/review NNN` | Revisar codigo |

### Ordem de Execucao

1. **Infra (020-029)**: fundacao — auth, db, middleware, clients, billing
2. **Protos (001-019)**: UI com dados hardcoded, design system
3. **Behaviors (030-055)**: conectar UIs a dados reais
4. **Integration (060-069)**: webhooks, cron, APIs externas
5. **Expansoes (070+)**: personalização de marca, criativos IA, SDR + voz IA, contratos/e-signature, Google/TikTok Ads

## Documentacao Essencial

| Arquivo | O que contem |
|---------|-------------|
| `docs/SPEC.md` | SPEC COMPLETA: paginas, componentes, comportamentos, modelo de dados |
| `docs/references/architecture.md` | Padroes de arquitetura, Supabase, RLS, billing, seguranca |
| `docs/references/design-system.md` | Design system v3: tokens CSS, primitivas, componentes, padroes visuais |
| `docs/references/workflow.md` | Workflow SPEC->BREAK->PLAN->EXECUTE detalhado |
| `docs/references/api-integrations.md` | Referencia completa de todas as APIs externas (motor de voz IA, provedor DID, Meta, Stripe, modelos LLM, modelos de imagem, Social, Supabase, email, WhatsApp) |
| `design/v3/` | **Fonte canonica do design system** — JSX de referencia (parts, hero, body, end) |
| `design/landing-pages/` | Landing pages HTML de referencia (tokens CSS completos) |
| `issues/` | Issues numeradas com tipo, deps, componentes, criterio de aceite |

## Design System (v3)

O projeto usa o design system v3 — Apple-inspired, premium, dark-first.
Fonte canonica: `design/v3/` (JSX) + `design/landing-pages/landing-page-v2.html` (tokens CSS).
Documentacao completa: `docs/references/design-system.md`.

**Regras visuais:**
- Fontes: **Inter** (sans), **JetBrains Mono** (mono), serif italic para destaques
- Accent: `#FF5E1A` (laranja) — nunca usar outra cor primaria
- Dark mode como padrao (`--bg: #0A0A0B`), light mode via `data-theme="light"`
- Tokens em CSS custom properties: `--bg`, `--bg-2`, `--panel`, `--ink`, `--ink-2..5`, `--line`, `--line-2..3`, `--accent`, `--good`, `--warn`, `--bad`
- Botoes: `borderRadius: 999` (pill). Cards: `borderRadius: 22-32px`
- Peso dominante: **500** (medium). Titulos grandes com tracking negativo
- Kickers: uppercase, letter-spacing `.14em`, dot accent laranja
- Cards destacados: fundo `var(--ink)` com texto `var(--bg)` (inversao)
- Primitivas: `BtnPrimary`, `BtnGhost`, `Kicker`, `SectionTitle`, `Logo`
- Icones: set customizado em `design/v3/parts.jsx` (Arrow, Check, X, Plus, Minus) + Lucide React como fallback

**Ao criar qualquer UI, SEMPRE consulte `docs/references/design-system.md` e os arquivos em `design/v3/`.**

## Estrutura de Pastas

```
design/
  v3/                              # Design system oficial (JSX de referencia)
    parts.jsx                      # Primitivas UI
    hero.jsx                       # Nav + Hero + UnifiedMock
    body.jsx                       # Problem + ModulesSection
    end.jsx                        # Pricing + FAQ + CTA + Footer
    app.jsx                        # Root layout
  landing-pages/                   # HTML com tokens CSS completos
  src/                             # V1 (referencia historica)
  v2/                              # V2 (referencia historica)
src/
  app/
    (auth)/                    # Login, registro, esqueci senha
      login/
      register/
      forgot-password/
    (main)/                    # Layout principal com sidebar
      dashboard/
      pipeline/
      negocios/[id]/
      contatos/
      atividades/
      campanhas/               # Bloco B — Meta Ads
        nova/
        [id]/
        performance/
        publicos/
        criativos/
          gerar/               # Gerador de criativos com IA
        otimizador/
      marketing/               # Bloco C
        landing-pages/
        formularios/
        emails/
      social/                  # Social Media
        calendario/
        posts/
        aprovacao/
        contas/
        midia/
      analytics/               # Bloco D
      relatorios/
      analise/
      ligacoes/
      metas/
      prospeccao/
        sdr-ia/                # Bloco E — Painel SDR IA
      automacoes/
      analise-calls/
      configuracoes/
        perfil/
        billing/
        empresa/
        usuarios/
        campos/
        importar/
        produtos/
        motivos-perda/
        duplicatas/
        sequencias/
        email-templates/
        whatsapp-templates/
        scripts-ligacao/
        meta-ads/
        pixel/
        ia/
        dominio/
        white-label/
        marca/                 # Accent color + logo do workspace
        social/
        relatorios/
        ia-ciclo/
        sdr-ia/                # Config do agente de voz
        contratos/             # Templates de proposta e contrato
        whatsapp/
        gmail/
        telefone/
        calendario/
        integracoes/
        api/
        webhooks/
    api/                       # API Routes
  components/
    ui/                        # shadcn/ui
    shared/
    dashboard/
    pipeline/
    negocios/
    contatos/
    atividades/
    campanhas/
    marketing/
    social/
    analytics/
    relatorios/
    analise/
    billing/
    sdr/                       # SDR + Agente de Voz IA
    contratos/                 # Propostas + Contratos + E-signature
    marca/                     # Personalizacao de marca (color picker, logo upload)
  lib/
    supabase.ts
    auth.ts
    crypto.ts
    utils.ts
    branding.ts                # Resolver accent color + logo do workspace
    meta-ads/                  # Meta Marketing API client
    ai/                        # Claude API (campanhas, otimizacao, insights, qualificacao)
    ai-creative/               # Geracao de criativos com IA (imagens + videos)
    social/                    # Social media API clients
    whatsapp/
    telephony/                 # Motor de voz IA + DID provider (ligacoes IA inbound/outbound)
    email/
    pdf/
    stripe/                    # Stripe client (billing, subscriptions)
    contracts/                 # Propostas, contratos, assinatura eletronica
    feature-gate.ts            # Feature gating por modulo
  hooks/
  types/
  middleware.ts                # Auth guard + workspace + plan check
docs/
  SPEC.md
  references/
    architecture.md
    design-system.md
    workflow.md
issues/
public/
supabase/
  migrations/
  seed.sql
```

## Padroes de Codigo

- TypeScript strict (sem `any`)
- Componentes: PascalCase, um por arquivo
- API Routes: validar TODOS inputs com Zod
- Erros: try/catch tipado, nunca engolir
- Segredos: NUNCA expor no client; criptografar tokens no banco
- Webhooks: logar TUDO, retornar 200 imediato, processar async
- Imports: alias `@/*`

## Multi-Tenancy

- Todas as tabelas possuem `workspace_id`
- Row Level Security (RLS) ativo em TODAS as tabelas
- Politica padrao: `auth.uid()` resolve usuario → workspace_id → filtra registros
- Cada workspace conecta sua propria conta Meta Ads
- Subdominio ou dominio customizado (landing pages + white-label)

## Feature Gating (SaaS)

- Middleware verifica plano do workspace antes de renderizar modulos
- `lib/feature-gate.ts` exporta funcoes: `canAccess(workspace, feature)`, `getLimit(workspace, resource)`, `checkUsage(workspace, resource)`
- Modulos bloqueados: tela de upsell com botao upgrade
- Limites excedidos: alerta + bloqueio suave

## Integracoes API

| API | Base URL | Auth | Cuidados |
|-----|---------|------|----------|
| Supabase | `SUPABASE_URL` | anon key + service role | Service role so no servidor |
| Claude | `https://api.anthropic.com` | `ANTHROPIC_API_KEY` | Rate limit, cache |
| Meta Ads | `https://graph.facebook.com/v21.0` | OAuth token | Token criptografado, 60d refresh |
| Meta Leads | Webhook | Verify token | Retornar 200 imediato |
| Meta Pixel | Conversions API | System token | Server-side only |
| Stripe | `https://api.stripe.com` | `STRIPE_SECRET_KEY` | Webhook signature verification |
| WhatsApp | `https://graph.facebook.com/v21.0` | `WHATSAPP_TOKEN` | Token criptografado |
| Instagram Graph | `https://graph.facebook.com/v21.0` | OAuth | Token refresh auto |
| Motor de voz IA | `VOICE_ENGINE_BASE_URL` | API key (Bearer) | Server URL webhooks, end-of-call report |
| Provedor DID BR | `DID_PROVIDER_BASE_URL` | TOKEN (query param) | Numeros BR (+55), SIP credentials pro motor de voz, SMS |
| Resend | `https://api.resend.com` | API key | Rate limits |

## Variaveis de Ambiente

Ver `.env.example`. Nunca commitar `.env.local`.
