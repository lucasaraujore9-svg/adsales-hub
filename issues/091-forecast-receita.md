# 091 — Forecast de receita 30/60/90 dias

**Tipo:** feature
**Severidade:** alto
**Bloco:** D (Analytics)
**Dependências:** nenhuma
**Esforço estimado:** M (10-16h)
**Status:** todo

## Contexto

Vendedores e gerentes não têm visão de quanto vão fechar nos próximos 30/60/90 dias. Forecast é métrica básica de SaaS B2B.

## Critérios de aceite

- [ ] Card "Forecast 30 dias" no dashboard
- [ ] Cálculo: soma `deal.value × stage.probability` para deals open
- [ ] Filtro por owner (vendedor vê só dele, gerente vê todos)
- [ ] Quebra por estágio: "R$ 100k em proposta", "R$ 50k em negociação"
- [ ] Tendência semanal (últimas 4 semanas vs próximas 4)
- [ ] Confidence range (low/best/high baseado em variação histórica)

## Plan

1. Verificar/adicionar coluna `pipeline_stages.probability INT` (0-100)
2. Função `calculateForecast(sb, workspaceId, ownerId?, periodDays = 30)`:
   ```ts
   const { data: deals } = await sb.from('deals')
     .select('value, stage_id, expected_close_at')
     .eq('workspace_id', workspaceId)
     .eq('status', 'open')
     .lte('expected_close_at', addDays(new Date(), periodDays).toISOString())
     .matchOptional(ownerId ? { owner_user_id: ownerId } : {});
   const { data: stages } = await sb.from('pipeline_stages').select('id, probability');
   const stageMap = new Map(stages.map(s => [s.id, s.probability ?? 50]));
   
   let weighted = 0;
   const byStage: Record<string, number> = {};
   for (const d of deals ?? []) {
     const prob = stageMap.get(d.stage_id) ?? 50;
     const w = (Number(d.value) * prob) / 100;
     weighted += w;
     byStage[d.stage_id] = (byStage[d.stage_id] ?? 0) + w;
   }
   return { weighted, byStage };
   ```

3. Componente `<ForecastCard period={30} />`:
   - Valor principal (weighted)
   - Quebra por estágio (mini barras)
   - Tendência vs período anterior
   - Tooltip "Como calculamos: somatório (valor × probabilidade) dos deals em aberto"

4. Em `/analytics/page.tsx`: adicionar 3 cards 30d/60d/90d

## Arquivos afetados

- `supabase/migrations/00030_stage_probability.sql` (se faltar)
- `src/lib/queries/forecast.ts` (novo)
- `src/components/analytics/forecast-card.tsx` (novo)
- `src/app/(main)/analytics/page.tsx`
- `src/app/(main)/dashboard/page.tsx` (card simples)

## Como testar

1. Pipeline com estágios: Lead (10%), Proposta (50%), Negociação (75%), Fechamento (90%)
2. 5 deals abertos, valores variados
3. Card mostra weighted forecast
4. Mudar probability de um estágio → forecast atualiza

## Notas

- Probabilities devem ser calibradas com win rate histórico (futuro)
- Considerar machine learning em fase 2 (regressão sobre features do deal)
- Forecast nunca é certeza; deixar claro no UI
