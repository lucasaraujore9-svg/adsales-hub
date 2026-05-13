# AdSales Hub

SaaS que substitui agencia de marketing + CRM de vendas integrado. Cria campanhas Meta Ads com IA, gerencia trafego pago e organico, pipeline de vendas, social media, relatorios white-label e analise com IA. 100% focado em vendas.

## Setup

```bash
npm install
cp .env.example .env.local
# preencher variaveis (Supabase, Stripe, Meta, Claude, etc)
npx supabase db push
npx supabase db seed
stripe listen --forward-to localhost:3000/api/webhooks/stripe
npm run dev
```

## Workflow

SPEC -> BREAK -> PLAN -> EXECUTE. Leia `CLAUDE.md` antes de contribuir.

- Spec: `docs/SPEC.md`
- Issues: `issues/`
- Docs: `docs/references/`
