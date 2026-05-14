# 090 — Cohort, churn rate, payback period, time-to-close

**Tipo:** feature
**Severidade:** alto
**Bloco:** D (Analytics)
**Dependências:** nenhuma
**Esforço estimado:** L (24-40h)
**Status:** todo

## Contexto

Analytics do AdSales Hub tem CAC/LTV/ROAS básicos, mas faltam métricas avançadas que dono de PME precisa para decisões reais:
- **Cohort analysis**: retenção por mês de cadastro
- **Churn rate**: % clientes que cancelaram
- **Payback period**: dias para recuperar CAC
- **Time-to-close**: dias do lead até venda
- **Sales velocity**: deals/semana
- **Pipeline stuck**: deals parados há > X dias

## Critérios de aceite

- [ ] Card "Churn rate" no dashboard analytics (% mês)
- [ ] Card "Payback period" (dias)
- [ ] Card "Time to close" médio (dias)
- [ ] Tabela de cohort: linhas = mês de cadastro, colunas = retention M+1, M+2, ..., M+12
- [ ] Card "Pipeline stuck": deals parados > 30d em mesma stage
- [ ] Filtros de período aplicam em todas as métricas
- [ ] Tooltips explicam cada métrica para leigo

## Plan

1. Criar `src/lib/queries/advanced-analytics.ts`:
   ```ts
   export async function calculateChurnRate(sb, workspaceId, period: 'month' | 'quarter') {
     // Customers ativos no início do período - cancelaram durante / ativos no início
   }
   
   export async function calculatePayback(sb, workspaceId, period) {
     // CAC médio / receita mensal média por cliente
   }
   
   export async function calculateTimeToClose(sb, workspaceId, period) {
     // Média de (closed_at - created_at) para deals won no período
     const { data } = await sb.from('deals')
       .select('created_at, closed_at')
       .eq('workspace_id', workspaceId)
       .eq('status', 'won')
       .not('closed_at', 'is', null)
       .gte('closed_at', period.start)
       .lte('closed_at', period.end);
     if (!data?.length) return null;
     const avgMs = data.reduce((s, d) => s + (new Date(d.closed_at).getTime() - new Date(d.created_at).getTime()), 0) / data.length;
     return avgMs / (1000 * 60 * 60 * 24); // dias
   }
   
   export async function getCohortRetention(sb, workspaceId, monthsBack = 12) {
     // Para cada mês N, identificar customers criados naquele mês
     // Para cada mês N+M, calcular % desses ainda ativos (sem cancelamento ou ainda com subscription)
     // Retorna matriz [{ cohort: '2024-01', m0: 100, m1: 85, m2: 80, ... }]
   }
   
   export async function getPipelineStuck(sb, workspaceId, thresholdDays = 30) {
     const cutoff = new Date(Date.now() - thresholdDays * 86400_000).toISOString();
     const { data } = await sb.from('deals')
       .select('id, title, stage_id, value, owner_user_id, stage_entered_at')
       .eq('workspace_id', workspaceId)
       .eq('status', 'open')
       .lte('stage_entered_at', cutoff);
     return data ?? [];
   }
   ```

2. Componente `src/components/analytics/cohort-table.tsx`:
   - Renderiza matriz com gradiente de cor (verde alto retention, vermelho baixo)
   - Tooltip por célula com valores absolutos

3. Cards de métricas em `/analytics/page.tsx`:
   - Adicionar "Churn", "Payback", "Time to close"
   - Cada card com tooltip explicativo

4. Seção "Pipeline stuck" com tabela de deals parados + botão "Ver" para cada

## Arquivos afetados

- `src/lib/queries/advanced-analytics.ts` (novo)
- `src/components/analytics/cohort-table.tsx` (novo)
- `src/components/analytics/metric-card-with-tooltip.tsx` (novo se não existe)
- `src/app/(main)/analytics/page.tsx`

## Como testar

1. Workspace com 6 meses de dados (deals, contacts, subscriptions)
2. Acessar `/analytics`
3. Cards mostram churn (ex: 5%/mês), payback (ex: 4 meses), time-to-close (ex: 12 dias)
4. Cohort table com 6 linhas (meses) e 6 colunas (M0-M5)
5. Pipeline stuck lista deals parados há 30+ dias

## Notas

- Performance: queries de cohort podem ser pesadas; cachear em `analytics_snapshots` table
- Considerar materializar via cron diário
- Tooltips precisam ser educativos para leigo
- Em fase futura: forecast (ML) e attribuição multi-touch
