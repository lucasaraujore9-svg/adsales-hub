# 027 — `goals.achieved` atualiza automaticamente

**Tipo:** feature
**Severidade:** alto
**Bloco:** A (CRM)
**Dependências:** nenhuma
**Esforço estimado:** M (10-16h)
**Status:** todo

## Contexto

Tabela `goals` tem campos `target` e `achieved`. Hoje `achieved` é estático — vendedor cria meta de R$ 50k e tem que **atualizar manualmente** o valor conforme fecha negócios. Inviável.

Cada métrica suportada (revenue, deals_won, deals_created, activities, calls, meetings, leads, cpl, roas, spend) deveria ser calculada do banco em tempo real ou snapshot frequente.

## Critérios de aceite

- [ ] Coluna `achieved` deixa de ser editável manualmente (computed)
- [ ] Função `recalculateGoalAchievement(goalId)` busca dados reais
- [ ] Cron task `goals_recalc` recalcula todos os goals ativos a cada 15 min
- [ ] Action manual "Recalcular agora" no UI da meta
- [ ] Triggers: ao fechar deal (won), ao criar atividade/call, recalcula goals afetados
- [ ] UI mostra timestamp da última atualização
- [ ] Alerta enviado quando atinge 50%, 80%, 100% (toast/notification)

## Plan

1. Criar `src/lib/goals/recalculate.ts`:
   ```ts
   export async function recalculateGoal(sb, goalId: string): Promise<number> {
     const { data: goal } = await sb.from('goals')
       .select('*').eq('id', goalId).single();
     if (!goal) return 0;
     
     const start = goal.period_start;
     const end = goal.period_end;
     const ws = goal.workspace_id;
     
     let where: Record<string, unknown> = { workspace_id: ws };
     if (goal.scope === 'user') where.owner_user_id = goal.user_id;
     // (scope='team' = filtrar usuários do team; 'workspace' = sem filtro)
     
     let achieved = 0;
     switch (goal.metric) {
       case 'revenue': {
         const { data } = await sb.from('deals')
           .select('value')
           .match(where)
           .eq('status', 'won')
           .gte('closed_at', start).lte('closed_at', end);
         achieved = (data ?? []).reduce((s, d: any) => s + Number(d.value || 0), 0);
         break;
       }
       case 'deals_won': {
         const { count } = await sb.from('deals')
           .select('id', { count: 'exact', head: true })
           .match(where)
           .eq('status', 'won')
           .gte('closed_at', start).lte('closed_at', end);
         achieved = count ?? 0;
         break;
       }
       case 'deals_created': {
         const { count } = await sb.from('deals').select('id', { count: 'exact', head: true })
           .match(where).gte('created_at', start).lte('created_at', end);
         achieved = count ?? 0;
         break;
       }
       case 'activities': {
         const { count } = await sb.from('activities').select('id', { count: 'exact', head: true })
           .match(where).eq('completed', true).gte('completed_at', start).lte('completed_at', end);
         achieved = count ?? 0;
         break;
       }
       case 'calls': {
         const { count } = await sb.from('calls').select('id', { count: 'exact', head: true })
           .match(where).gte('started_at', start).lte('started_at', end);
         achieved = count ?? 0;
         break;
       }
       case 'meetings': {
         const { count } = await sb.from('activities').select('id', { count: 'exact', head: true })
           .match(where).eq('type', 'meeting').eq('completed', true).gte('completed_at', start).lte('completed_at', end);
         achieved = count ?? 0;
         break;
       }
       case 'leads': {
         const { count } = await sb.from('contacts').select('id', { count: 'exact', head: true })
           .match(where).gte('created_at', start).lte('created_at', end);
         achieved = count ?? 0;
         break;
       }
       // cpl, roas, spend: agregar de campaign_metrics
     }
     
     await sb.from('goals')
       .update({ achieved, last_calculated_at: new Date().toISOString() })
       .eq('id', goalId);
     return achieved;
   }
   
   export async function recalculateAllActiveGoals(admin) {
     const today = new Date().toISOString();
     const { data: goals } = await admin.from('goals')
       .select('id')
       .lte('period_start', today)
       .gte('period_end', today);
     for (const g of goals ?? []) {
       try { await recalculateGoal(admin, g.id); } catch (e) { console.error('[goal-recalc]', g.id, e); }
     }
   }
   ```

2. Migração para adicionar `last_calculated_at TIMESTAMPTZ` em `goals` se não existe.

3. Adicionar task no cron [src/app/api/cron/run/route.ts](../src/app/api/cron/run/route.ts):
   ```ts
   if (task === 'goals_recalc' || task === 'all') {
     await recalculateAllActiveGoals(admin);
   }
   ```

4. Trigger event-based: em `dispatchWebhook` ou direto nas actions de:
   - `deals.won` → recalcula goals com metric='revenue', 'deals_won'
   - `deals.created` → metric='deals_created', 'leads' (se contact_id é novo)
   - `activity.completed` → 'activities', 'meetings'
   - `call.completed` → 'calls'
   
   Função helper:
   ```ts
   export async function triggerGoalRecalc(workspaceId, metrics: string[]) {
     const sb = createAdminSupabaseClient();
     const { data } = await sb.from('goals')
       .select('id')
       .eq('workspace_id', workspaceId)
       .in('metric', metrics)
       .lte('period_start', new Date().toISOString())
       .gte('period_end', new Date().toISOString());
     for (const g of data ?? []) await recalculateGoal(sb, g.id);
   }
   ```

5. Em UI `/metas`:
   - Remover input "achieved" do form (read-only)
   - Mostrar "Atualizado há X minutos"
   - Botão "Recalcular" que chama action `recalcGoalAction(goalId)`
   - Quando achieved/target atinge 50%/80%/100%, criar entrada em `notifications` (issue futura)

## Arquivos afetados

- `supabase/migrations/00019_goals_calculated.sql` (novo)
- `src/lib/goals/recalculate.ts` (novo)
- `src/lib/actions/sales.ts` (action manual + triggers)
- `src/app/api/cron/run/route.ts` (task)
- `src/app/(main)/metas/page.tsx`
- `src/components/sales/goal-form.tsx` (remove input achieved)

## Como testar

1. Criar meta "Receita do mês = R$ 50.000"
2. Marcar deal de R$ 10.000 como ganho
3. Aguardar cron OU click "Recalcular" → achieved = 10000
4. Atinge 50% (R$ 25k): notificação
5. Atinge 100%: notificação grande
6. Verificar `goals.last_calculated_at` atualiza

## Notas

- Cron a cada 15 min é suficiente para feedback ao vendedor
- Triggers event-based dão sensação de tempo real
- Se workspace tem 100s de goals, recalcular pode ser pesado: limitar a goals ativos no período atual
- `recalculateGoal` é idempotente — pode ser chamada N vezes
