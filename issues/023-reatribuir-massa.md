# 023 — Reatribuir negócios em massa

**Tipo:** feature
**Severidade:** alto
**Bloco:** A (CRM)
**Dependências:** nenhuma
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

Quando vendedor sai da empresa ou muda de equipe, gerente precisa reatribuir 50+ deals para outro vendedor. Hoje só dá para fazer 1 a 1 — inviável.

## Critérios de aceite

- [ ] Tabela do pipeline e de negócios suporta seleção múltipla (checkbox)
- [ ] Botão "Ações em massa" aparece quando 1+ selecionado
- [ ] Ações disponíveis: "Reatribuir vendedor", "Mover para estágio", "Adicionar tag", "Excluir" (admin)
- [ ] Modal de "Reatribuir" pede novo vendedor (autocomplete)
- [ ] Confirmação mostra quantidade de deals afetados
- [ ] Loading state durante a operação
- [ ] Toast de sucesso com contagem ("50 deals reatribuídos para João")
- [ ] Cada mudança gera entrada em audit log (issue 020)

## Plan

1. Adicionar action em [src/lib/actions/deals.ts](../src/lib/actions/deals.ts):
   ```ts
   const bulkReassignSchema = z.object({
     dealIds: z.array(z.string().uuid()).min(1).max(500),
     newOwnerId: z.string().uuid(),
   });
   
   export async function bulkReassignDeals(input: unknown): Promise<ActionResult<{ count: number }>> {
     const parsed = bulkReassignSchema.parse(input);
     const session = await requireWorkspaceContext();
     await requireRole(['admin', 'gestor']);
     const sb = await createServerSupabaseClient();
     
     // Verificar que owner novo pertence ao workspace
     const { data: newOwner } = await sb
       .from('workspace_members')
       .select('user_id')
       .eq('workspace_id', session.workspaceId)
       .eq('user_id', parsed.newOwnerId)
       .single();
     if (!newOwner) return { ok: false, error: "Vendedor inválido" };
     
     const { data, error } = await sb
       .from('deals')
       .update({ owner_user_id: parsed.newOwnerId })
       .in('id', parsed.dealIds)
       .eq('workspace_id', session.workspaceId)
       .select('id');
     
     if (error) return { ok: false, error: friendlyError(error, 'crud') };
     revalidatePath('/pipeline');
     return { ok: true, data: { count: data?.length ?? 0 } };
   }
   
   export async function bulkMoveStage(input) { /* similar */ }
   export async function bulkDeleteDeals(input) { /* admin only */ }
   ```

2. Atualizar componente de tabela/kanban para suportar seleção múltipla:
   - Em `/pipeline` na visão tabela: adicionar coluna de checkbox
   - Estado `selectedIds: Set<string>` no client
   - Header tem checkbox "selecionar todos visíveis"

3. Criar `src/components/deals/bulk-actions-toolbar.tsx`:
   - Barra fixa no rodapé (estilo Gmail) que aparece quando `selectedIds.size > 0`
   - Mostra contagem: "5 selecionados"
   - Dropdown com ações: Reatribuir, Mover, Tag, Excluir
   - Cada ação abre modal específico

4. Modal `<ReassignModal>` com autocomplete de membros do workspace

5. No kanban, suportar shift-click para selecionar range (extra)

## Arquivos afetados

- `src/lib/actions/deals.ts` (3 actions novas)
- `src/components/pipeline/deals-table.tsx` (checkbox)
- `src/components/pipeline/kanban-board.tsx` (select mode)
- `src/components/deals/bulk-actions-toolbar.tsx` (novo)
- `src/components/deals/reassign-modal.tsx` (novo)

## Como testar

1. Login como admin
2. Em `/pipeline`, mudar para visão tabela
3. Selecionar 5 deals via checkbox
4. Toolbar aparece embaixo: "5 selecionados"
5. Click "Reatribuir" → modal
6. Escolher outro vendedor
7. Confirmar → toast "5 deals reatribuídos"
8. Recarregar → deals têm novo owner
9. Histórico de cada deal mostra mudança de owner

## Notas

- Limitar a 500 por chamada (já no schema)
- Vendedor (role 'vendedor') NÃO deve ter acesso a essa ação (só admin/gestor)
- Considerar paginação: se selecionar "todos visíveis" + paginar, atualizar contador
- Em fase futura: importar lista CSV de deal_ids para reatribuir
