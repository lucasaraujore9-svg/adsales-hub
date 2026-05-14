# 025 — Merge automático de contatos duplicados

**Tipo:** feature
**Severidade:** alto
**Bloco:** A (CRM)
**Dependências:** nenhuma
**Esforço estimado:** M (10-16h)
**Status:** todo

## Contexto

Em [src/app/(main)/configuracoes/duplicatas/page.tsx](../src/app/(main)/configuracoes/duplicatas/page.tsx) o sistema mostra grupos de contatos duplicados (por email/phone), mas o botão "mesclar" não existe. Comentário no código: "merge automatico chega na proxima iteracao".

Resultado: workspace acumula duplicatas, vendedor liga 2x para mesmo lead, dados ficam fragmentados.

## Critérios de aceite

- [ ] Para cada grupo duplicado, botão "Mesclar"
- [ ] Modal mostra side-by-side os contatos com seus dados
- [ ] Para cada campo divergente, usuário escolhe qual valor manter (radio button)
- [ ] Merge consolida em UM contato (o mais antigo, ou o que tem mais dados)
- [ ] Outros contatos são "soft deleted" (status='merged_into' + ref ao principal)
- [ ] Deals dos contatos secundários são reapontados pro principal
- [ ] Atividades, notas, ligações também transferidas
- [ ] Histórico de merge salvo (auditável)
- [ ] Não pode ser desfeito (irreversível) — confirmação dupla

## Plan

1. Migração `supabase/migrations/00017_contact_merge.sql`:
   ```sql
   ALTER TABLE contacts
     ADD COLUMN IF NOT EXISTS merged_into_contact_id UUID REFERENCES contacts(id),
     ADD COLUMN IF NOT EXISTS merged_at TIMESTAMPTZ,
     ADD COLUMN IF NOT EXISTS merged_by_user_id UUID REFERENCES profiles(id);
   
   CREATE TABLE IF NOT EXISTS contact_merge_log (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     workspace_id UUID NOT NULL REFERENCES workspaces(id),
     primary_contact_id UUID NOT NULL REFERENCES contacts(id),
     merged_contact_ids UUID[] NOT NULL,
     field_choices JSONB NOT NULL,
     transferred_counts JSONB,
     actor_user_id UUID REFERENCES profiles(id),
     created_at TIMESTAMPTZ DEFAULT now()
   );
   
   -- Filtro padrão: ignorar contatos já merged em queries
   -- (atualizar listings a usar WHERE merged_into_contact_id IS NULL)
   ```

2. Criar `src/lib/actions/contact-merge.ts`:
   ```ts
   const mergeSchema = z.object({
     primaryId: z.string().uuid(),
     secondaryIds: z.array(z.string().uuid()).min(1).max(10),
     fieldChoices: z.record(z.string(), z.unknown()), // { name: 'value', email: 'value', ... }
   });
   
   export async function mergeContacts(input: unknown): Promise<ActionResult> {
     const parsed = mergeSchema.parse(input);
     const session = await requireWorkspaceContext();
     await requireRole(['admin', 'gestor']);
     const sb = await createServerSupabaseClient();
     
     // 1. Atualizar primary com fieldChoices
     await sb.from('contacts')
       .update(parsed.fieldChoices)
       .eq('id', parsed.primaryId)
       .eq('workspace_id', session.workspaceId);
     
     // 2. Reapontar deals
     const dealsCount = await sb.from('deals')
       .update({ contact_id: parsed.primaryId })
       .in('contact_id', parsed.secondaryIds)
       .eq('workspace_id', session.workspaceId)
       .select('id', { count: 'exact', head: true });
     
     // 3. Reapontar atividades, notas, calls, conversations
     await sb.from('activities').update({ contact_id: parsed.primaryId }).in('contact_id', parsed.secondaryIds);
     await sb.from('notes').update({ contact_id: parsed.primaryId }).in('contact_id', parsed.secondaryIds);
     await sb.from('calls').update({ contact_id: parsed.primaryId }).in('contact_id', parsed.secondaryIds);
     // (conversations table se tiver contact_id)
     
     // 4. Marcar secundários como merged
     await sb.from('contacts')
       .update({
         merged_into_contact_id: parsed.primaryId,
         merged_at: new Date().toISOString(),
         merged_by_user_id: session.userId,
       })
       .in('id', parsed.secondaryIds);
     
     // 5. Log auditável
     await sb.from('contact_merge_log').insert({
       workspace_id: session.workspaceId,
       primary_contact_id: parsed.primaryId,
       merged_contact_ids: parsed.secondaryIds,
       field_choices: parsed.fieldChoices,
       transferred_counts: { deals: dealsCount.count ?? 0 },
       actor_user_id: session.userId,
     });
     
     revalidatePath('/configuracoes/duplicatas');
     revalidatePath('/contatos');
     return { ok: true };
   }
   ```

3. Atualizar queries de listagem de contatos para filtrar `merged_into_contact_id IS NULL`:
   - `src/lib/queries/contacts.ts`
   - `src/app/api/v1/contacts/route.ts`
   - Páginas que usam direto

4. Criar `src/components/contacts/merge-modal.tsx`:
   - Recebe `contacts: Contact[]` (grupo duplicado)
   - Renderiza tabela: linhas = campos, colunas = contatos
   - Para cada linha, radio para escolher qual valor manter
   - Pré-selecionar valor mais "completo" (não-null, mais longo)
   - Botão "Mesclar 3 contatos em 1"
   - Confirmação dupla: "Esta ação é irreversível"

5. Atualizar [src/app/(main)/configuracoes/duplicatas/page.tsx](../src/app/(main)/configuracoes/duplicatas/page.tsx):
   - Botão "Mesclar" em cada grupo
   - Click abre `<MergeModal contacts={groupContacts} />`

## Arquivos afetados

- `supabase/migrations/00017_contact_merge.sql` (novo)
- `src/lib/actions/contact-merge.ts` (novo)
- `src/lib/queries/contacts.ts` (filtro merged)
- `src/components/contacts/merge-modal.tsx` (novo)
- `src/app/(main)/configuracoes/duplicatas/page.tsx`
- `src/app/api/v1/contacts/route.ts` (filtro)

## Como testar

1. Criar 2 contatos manualmente com mesmo email
2. Acessar `/configuracoes/duplicatas` → vê grupo
3. Click "Mesclar" → modal mostra ambos lado a lado
4. Para campos divergentes, escolher qual manter
5. Confirmar 2x → toast "Contatos mesclados"
6. Listar contatos → só 1 aparece
7. Deals/atividades/notas do contato secundário agora apontam para o primary
8. `SELECT * FROM contact_merge_log` mostra entrada
9. Acessar contato mesclado direto pela URL → 404 ou mensagem "Este contato foi mesclado em outro"

## Notas

- Cuidado com FK constraints: ON DELETE CASCADE pode apagar dados antes de transferir
- Soft delete (status flag) é mais seguro que hard delete
- Considerar permitir "desmesclar" em até X dias (futuro complexo)
- Performance: ao listar duplicatas, filtrar `WHERE merged_into_contact_id IS NULL`
