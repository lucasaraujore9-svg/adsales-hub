# 044 — Otimizador IA aplica sugestões no Meta de fato

**Tipo:** feature
**Severidade:** alto
**Bloco:** B (Ads)
**Dependências:** 040
**Esforço estimado:** M (12-20h)
**Status:** todo

## Contexto

Cron `ai_optimize` gera `ai_optimization_logs` com sugestões (pausar ad set, escalar orçamento, mudar público). Botão "Aprovar" existe na UI, mas:
- Não chama Meta API
- Apenas marca log como `applied` localmente
- Nenhuma mudança real na campanha do usuário

## Critérios de aceite

- [ ] Tipos de sugestão suportados: `pause_adset`, `increase_budget`, `decrease_budget`, `change_audience`, `pause_creative`
- [ ] Cada sugestão tem `meta_action` JSON com instruções concretas
- [ ] Botão "Aprovar e aplicar" chama Meta API real
- [ ] Antes de aplicar: snapshot do estado atual (rollback possível)
- [ ] Em sucesso: log `status='applied'`, `applied_at`, `result_metrics_id`
- [ ] Em erro: log `status='failed'`, `error`
- [ ] UI mostra "antes/depois" das métricas após X dias
- [ ] Auto-rollback se métrica piora 30% em 48h (modo cuidadoso opcional)

## Plan

1. Atualizar prompt do otimizador em `src/lib/ai/optimization.ts` para retornar JSON estruturado:
   ```ts
   {
     suggestions: [{
       type: 'pause_adset' | 'increase_budget' | ...,
       target: { adset_id: '...', campaign_id: '...' },
       params: { new_budget?: 100, new_audience?: {...} },
       rationale: "string em pt-BR",
       confidence: 0.85,
       expected_impact: "ROAS estimado +15%"
     }]
   }
   ```

2. Criar `src/lib/meta/apply-optimization.ts`:
   ```ts
   export async function applyOptimization(workspaceId, logId): Promise<ApplyResult> {
     const sb = createAdminSupabaseClient();
     const { data: log } = await sb.from('ai_optimization_logs')
       .select('*').eq('id', logId).single();
     if (!log || log.status !== 'pending') return { ok: false, error: 'invalid_state' };
     
     // Snapshot
     const snapshot = await fetchMetaState(log);
     await sb.from('ai_optimization_logs').update({ before_snapshot: snapshot }).eq('id', logId);
     
     try {
       const action = log.suggestion as Suggestion;
       switch (action.type) {
         case 'pause_adset':
           await updateAdSet(action.target.adset_id, { status: 'PAUSED' });
           break;
         case 'increase_budget':
           await updateAdSet(action.target.adset_id, { daily_budget: action.params.new_budget * 100 });
           break;
         // ...
       }
       
       await sb.from('ai_optimization_logs').update({
         status: 'applied',
         applied_at: new Date().toISOString(),
       }).eq('id', logId);
       return { ok: true };
     } catch (e) {
       await sb.from('ai_optimization_logs').update({
         status: 'failed',
         error: String(e),
       }).eq('id', logId);
       return { ok: false, error: String(e) };
     }
   }
   ```

3. Action `applyOptimizationAction(logId)` em `src/lib/actions/optimizations.ts`

4. UI em `/campanhas/otimizador`:
   - Cada sugestão tem botão "Aprovar" (modal de confirmação) e "Rejeitar"
   - Modal confirmação: mostra rationale + impacto esperado + risco
   - Após aplicar: card mostra "Aplicado em X" + "Ver resultado em 48h"
   - Se há `before_snapshot`, mostra botão "Reverter"

5. Cron task `ai_post_apply_check`:
   - 48h depois de aplicar, busca métricas atuais
   - Compara com snapshot
   - Se piorou 30%, marca `result_metrics` com warning
   - Se modo "auto_rollback" ativado em workspace_settings, reverte

## Arquivos afetados

- `supabase/migrations/00023_optimization_extras.sql` (campos de snapshot/result se faltar)
- `src/lib/meta/apply-optimization.ts` (novo)
- `src/lib/meta/rollback.ts` (novo)
- `src/lib/ai/optimization.ts` (prompt update)
- `src/lib/actions/optimizations.ts`
- `src/app/(main)/campanhas/otimizador/page.tsx`

## Como testar

1. Aguardar cron `ai_optimize` ou disparar manual
2. Sugestões aparecem em `/campanhas/otimizador`
3. Aprovar uma "pause_adset"
4. Verificar Meta Ads Manager → ad set pausado
5. `ai_optimization_logs.status='applied'`
6. Aguardar 48h (ou simular mudança de tempo)
7. Cron post-apply mede impacto

## Notas

- Não aplicar sugestões automaticamente sem aprovar (default)
- Confidence < 0.7 não deve nem aparecer (filtrar no cron)
- Rollback é importante para confiança do usuário
- Considerar "modo experimental" que aplica em 10% das campanhas
