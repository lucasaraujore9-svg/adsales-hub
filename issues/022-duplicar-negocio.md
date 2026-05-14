# 022 — Duplicar negócio

**Tipo:** feature
**Severidade:** médio
**Bloco:** A (CRM)
**Dependências:** nenhuma
**Esforço estimado:** S (3-4h)
**Status:** todo

## Contexto

Não há ação para duplicar deal. Casos comuns:
- Cliente quer comprar produto adicional → criar deal idêntico com produto diferente
- Renovação de contrato → mesmo cliente, mesmas condições
- Negócio split (mesma oportunidade, vários produtos cobrados separados)

Hoje vendedor recria do zero — perde 5 minutos cada vez.

## Critérios de aceite

- [ ] Botão "Duplicar" no menu de ações do deal
- [ ] Modal pergunta: nome do novo deal, manter contato? manter produtos? manter atividades pendentes? manter notas?
- [ ] Cria novo deal com `status='open'`, mesmo `pipeline_id`, primeiro estágio
- [ ] Copia campos: title (com sufixo "(cópia)"), value, contact_id, company_id, owner_user_id, source
- [ ] Não copia: closed_at, won/lost data, audit log
- [ ] Opcionalmente copia produtos relacionados (`deal_products` se existir)
- [ ] Redireciona para o novo deal após criar
- [ ] Audit log marca "duplicated_from: <deal_id_origem>"

## Plan

1. Em [src/lib/actions/deals.ts](../src/lib/actions/deals.ts):
   ```ts
   const duplicateOptionsSchema = z.object({
     dealId: z.string().uuid(),
     newTitle: z.string().min(1).optional(),
     copyContact: z.boolean().default(true),
     copyProducts: z.boolean().default(true),
     copyNotes: z.boolean().default(false),
   });
   
   export async function duplicateDeal(input: unknown): Promise<ActionResult<{ id: string }>> {
     const parsed = duplicateOptionsSchema.parse(input);
     const session = await requireWorkspaceContext();
     const sb = await createServerSupabaseClient();
     
     const { data: orig } = await sb
       .from('deals')
       .select('*')
       .eq('id', parsed.dealId)
       .eq('workspace_id', session.workspaceId)
       .single();
     if (!orig) return { ok: false, error: "Negócio não encontrado" };
     
     // Buscar primeiro estágio do pipeline
     const { data: firstStage } = await sb
       .from('pipeline_stages')
       .select('id')
       .eq('pipeline_id', orig.pipeline_id)
       .order('order_index', { ascending: true })
       .limit(1)
       .single();
     
     const { data: newDeal, error } = await sb
       .from('deals')
       .insert({
         workspace_id: session.workspaceId,
         pipeline_id: orig.pipeline_id,
         stage_id: firstStage?.id ?? orig.stage_id,
         title: parsed.newTitle ?? `${orig.title} (cópia)`,
         value: orig.value,
         currency: orig.currency,
         contact_id: parsed.copyContact ? orig.contact_id : null,
         company_id: parsed.copyContact ? orig.company_id : null,
         owner_user_id: orig.owner_user_id,
         source: orig.source,
         status: 'open',
         metadata: { duplicated_from: orig.id, duplicated_at: new Date().toISOString() },
       })
       .select('id')
       .single();
     
     if (error || !newDeal) return { ok: false, error: friendlyError(error, 'crud') };
     
     // Copiar produtos se solicitado
     if (parsed.copyProducts) {
       const { data: products } = await sb
         .from('deal_products')
         .select('product_id, quantity, unit_price')
         .eq('deal_id', orig.id);
       if (products && products.length > 0) {
         await sb.from('deal_products').insert(
           products.map(p => ({ ...p, deal_id: newDeal.id, workspace_id: session.workspaceId }))
         );
       }
     }
     
     // Copiar notas se solicitado
     if (parsed.copyNotes) {
       const { data: notes } = await sb
         .from('notes')
         .select('content, type')
         .eq('deal_id', orig.id);
       if (notes && notes.length > 0) {
         await sb.from('notes').insert(
           notes.map(n => ({ ...n, deal_id: newDeal.id, workspace_id: session.workspaceId, author_user_id: session.userId }))
         );
       }
     }
     
     revalidatePath('/pipeline');
     return { ok: true, data: { id: newDeal.id } };
   }
   ```

2. Criar `src/components/deals/duplicate-deal-button.tsx`:
   - Modal com checkboxes (copiar contato, produtos, notas)
   - Input "Nome do novo negócio"
   - Botão "Duplicar"
   - On success: redireciona para `/negocios/[novo_id]` + toast

3. Adicionar botão no menu de ações do deal em [src/components/deals/deal-detail-header.tsx](../src/components/deals/deal-detail-header.tsx)

## Arquivos afetados

- `src/lib/actions/deals.ts`
- `src/components/deals/duplicate-deal-button.tsx` (novo)
- `src/components/deals/deal-detail-header.tsx`

## Como testar

1. Abrir deal com produtos vinculados e notas
2. Click "Duplicar"
3. Modal: marcar copiar produtos, desmarcar notas
4. Submit → vai para novo deal
5. Verificar produtos copiados, notas vazias
6. Histórico do novo deal mostra `duplicated_from`
7. Verificar pipeline mostra ambos os deals

## Notas

- Verificar se tabela `deal_products` existe (alguns sistemas usam outro nome)
- Atividades pendentes geralmente NÃO devem ser copiadas (relacionadas ao tempo)
- Considerar adicionar opção "duplicar como filho" para split (futuro)
