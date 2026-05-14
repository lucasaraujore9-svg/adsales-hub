# 075 — Pricing matrix comparativa visual

**Tipo:** feature (UX)
**Severidade:** alto
**Bloco:** Billing
**Dependências:** nenhuma
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

[src/app/(main)/upgrade/page.tsx](../src/app/(main)/upgrade/page.tsx) lista 3 cestas com preço mas sem matriz comparativa de features. Usuário leigo:
- Não sabe qual cesta tem Meta Ads
- Não sabe diferença entre Crescimento e Escala
- Compra plano errado

## Critérios de aceite

- [ ] Tabela com linhas = features, colunas = planos
- [ ] Cada célula: ✓ incluso, ✗ não incluso, "+R$ X" se add-on
- [ ] Features agrupadas por categoria: CRM, Marketing, Ads, Voz IA, Contratos, Limites
- [ ] Plano "Recomendado" destacado visualmente
- [ ] Toggle mensal/anual (com desconto anual)
- [ ] Mobile: scroll horizontal ou cards empilhados com toggle
- [ ] Botão "Selecionar plano" em cada coluna
- [ ] Custom Builder visível como alternativa

## Plan

1. Definir estrutura de planos em `src/lib/billing/plans.ts`:
   ```ts
   export type Feature = {
     id: string;
     label: string;
     category: 'crm' | 'marketing' | 'ads' | 'voice' | 'contracts' | 'limits';
     plans: Record<string, boolean | string | number>; // { operacao: true, crescimento: true, escala: true }
     hint?: string;
   };
   
   export const PLANS = [
     { id: 'operacao', name: 'Operação', monthly: 290, yearly: 232, recommended: false },
     { id: 'crescimento', name: 'Crescimento', monthly: 690, yearly: 552, recommended: true },
     { id: 'escala', name: 'Escala', monthly: 1490, yearly: 1192, recommended: false },
   ];
   
   export const FEATURES: Feature[] = [
     // CRM (todos têm)
     { id: 'pipeline', label: 'Pipeline visual', category: 'crm', plans: { operacao: true, crescimento: true, escala: true } },
     { id: 'contacts', label: 'Contatos ilimitados', category: 'crm', plans: { operacao: true, crescimento: true, escala: true } },
     { id: 'activities', label: 'Atividades + automações', category: 'crm', plans: { operacao: true, crescimento: true, escala: true } },
     // Marketing
     { id: 'landing_pages', label: 'Landing pages', category: 'marketing', plans: { operacao: '3 LPs', crescimento: '20 LPs', escala: 'Ilimitado' } },
     { id: 'forms', label: 'Formulários', category: 'marketing', plans: { operacao: true, crescimento: true, escala: true } },
     { id: 'email_marketing', label: 'Email marketing', category: 'marketing', plans: { operacao: '500/mês', crescimento: '5k/mês', escala: '50k/mês' } },
     { id: 'social_media', label: 'Social media (calendário + posts)', category: 'marketing', plans: { operacao: false, crescimento: true, escala: true } },
     // Ads
     { id: 'meta_ads', label: 'Meta Ads + IA generativa', category: 'ads', plans: { operacao: false, crescimento: true, escala: true } },
     { id: 'media_tier', label: 'Faixa de mídia inclusa', category: 'ads', plans: { operacao: 'até R$ 600/mês', crescimento: 'até R$ 5k/mês', escala: 'até R$ 30k/mês' } },
     { id: 'optimizer', label: 'Otimizador IA', category: 'ads', plans: { operacao: false, crescimento: true, escala: true } },
     { id: 'creative_gen', label: 'Geração de criativos IA', category: 'ads', plans: { operacao: false, crescimento: '20/mês', escala: '200/mês' } },
     // Voice IA
     { id: 'sdr_voice', label: 'SDR + Agente de Voz IA', category: 'voice', plans: { operacao: false, crescimento: false, escala: true } },
     { id: 'call_minutes', label: 'Minutos de IA inclusos', category: 'voice', plans: { operacao: '-', crescimento: '-', escala: '500 min/mês' } },
     // Contracts
     { id: 'contracts', label: 'Contratos + assinatura', category: 'contracts', plans: { operacao: false, crescimento: true, escala: true } },
     // Limits
     { id: 'users', label: 'Usuários', category: 'limits', plans: { operacao: 3, crescimento: 10, escala: 'Ilimitado' } },
     { id: 'workspaces', label: 'Workspaces', category: 'limits', plans: { operacao: 1, crescimento: 1, escala: 3 } },
   ];
   ```

2. Criar componente `src/components/billing/pricing-matrix.tsx`:
   - Header: 3 colunas de planos + 1 inicial vazia
   - Para cada categoria: header + linhas de features
   - Render célula: ✓ verde se true, "—" se false, valor literal se string/number
   - Sticky header em mobile
   - Toggle mensal/anual no topo

3. Em [src/app/(main)/upgrade/page.tsx](../src/app/(main)/upgrade/page.tsx):
   - Substituir cards atuais por `<PricingMatrix />`
   - Manter Custom Builder como seção abaixo

## Arquivos afetados

- `src/lib/billing/plans.ts` (novo)
- `src/components/billing/pricing-matrix.tsx` (novo)
- `src/app/(main)/upgrade/page.tsx`
- `src/app/page.tsx` (se LP usa mesma matriz, reusar)

## Como testar

1. Acessar `/upgrade`
2. Ver matriz: linhas claras com features, cores para sim/não
3. Toggle mensal/anual: preços mudam
4. Mobile: scroll horizontal funciona
5. Click "Escolher Crescimento" → vai para checkout
6. Seção Custom Builder visível abaixo

## Notas

- Conferir preços e features com o produto/CLAUDE.md
- Atualizar Política e LP pública para refletir mesma matriz (consistência)
- Em fase futura: tooltip detalhado por feature
