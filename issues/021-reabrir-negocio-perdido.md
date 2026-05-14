# 021 — Reabrir negócio perdido

**Tipo:** feature
**Severidade:** médio
**Bloco:** A (CRM)
**Dependências:** nenhuma
**Esforço estimado:** XS (1-2h)
**Status:** todo

## Contexto

Não há ação para reverter um deal de `status='lost'` para `status='open'`. Cliente que voltou a se interessar não tem como ser reaproveitado — vendedor cria deal duplicado.

## Critérios de aceite

- [ ] Deal com status `lost` mostra botão "Reabrir negócio"
- [ ] Confirmação modal antes de reabrir (issue 005)
- [ ] Action atualiza status para `open`, limpa `closed_at`, `lost_reason_id`, `lost_reason_notes`
- [ ] Volta para o estágio em que estava antes (campo `stage_before_lost` ou último não-lost)
- [ ] Cria entrada em audit log: "reabriu negócio"
- [ ] Atualiza UI imediatamente

## Plan

1. Em [src/lib/actions/deals.ts](../src/lib/actions/deals.ts) adicionar:
   ```ts
   export async function reopenDeal(dealId: string): Promise<ActionResult> {
     const session = await requireWorkspaceContext();
     const sb = await createServerSupabaseClient();
     
     // Pegar último estágio antes de perder, via audit log
     const { data: lastStageEvent } = await sb
       .from('deal_audit_log')
       .select('old_value')
       .eq('deal_id', dealId)
       .eq('event_type', 'stage_changed')
       .order('created_at', { ascending: false })
       .limit(1)
       .maybeSingle();
     
     const stageId = lastStageEvent?.old_value as string | undefined;
     
     const updates: Record<string, unknown> = {
       status: 'open',
       closed_at: null,
       lost_reason_id: null,
       lost_reason_notes: null,
     };
     if (stageId) updates.stage_id = stageId;
     
     const { error } = await sb
       .from('deals')
       .update(updates)
       .eq('id', dealId)
       .eq('workspace_id', session.workspaceId);
     
     if (error) return { ok: false, error: friendlyError(error, 'crud') };
     revalidatePath(`/negocios/${dealId}`);
     revalidatePath('/pipeline');
     return { ok: true };
   }
   ```

2. Em [src/components/deals/deal-detail-header.tsx](../src/components/deals/deal-detail-header.tsx) ou similar:
   - Adicionar condição: se `deal.status === 'lost'` → mostrar botão "Reabrir"
   - Esconder botões de "ganho/perdido" para deal lost
   - Click chama `reopenDeal()` com confirmação

## Arquivos afetados

- `src/lib/actions/deals.ts`
- `src/components/deals/deal-detail-header.tsx`

## Como testar

1. Marcar um deal como perdido (escolher motivo)
2. Voltar para `/negocios/[id]` → vê banner "Negócio perdido"
3. Botão "Reabrir negócio" aparece
4. Click → modal de confirmação
5. Confirmar → deal volta para `open`, motivo limpo
6. Aparece de volta no pipeline kanban
7. Histórico (issue 020) mostra "status_changed: lost → open"

## Notas

- Se `deal_audit_log` ainda não existe (issue 020 não feita), usar campo `stage_id` atual ou primeiro estágio do pipeline como fallback
- Considerar adicionar campo `reopened_count` para tracking
