# 026 — Auto-vincular conversa do inbox a deal/contato existente

**Tipo:** feature
**Severidade:** alto
**Bloco:** A (CRM)
**Dependências:** nenhuma
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

Tabela `conversations` não tem colunas `contact_id` ou `deal_id`. Quando WhatsApp recebe mensagem de um número, o sistema:
1. Cria conversation isolada
2. Não vincula automaticamente ao contato existente que tem aquele phone
3. Vendedor tem que vincular manualmente

Resultado: histórico fragmentado, mesmo cliente vira "novo" cada vez.

## Critérios de aceite

- [ ] Tabela `conversations` ganha `contact_id`, `company_id`, `deal_id` (todos nullable)
- [ ] Ao ingerir mensagem inbound: tenta auto-vincular por phone/email/whatsapp
- [ ] Se múltiplos contatos com mesmo phone: vincula ao mais recente que teve atividade
- [ ] Se nenhum contato existe: deixa NULL (vendedor cria depois)
- [ ] Tela de conversa mostra contato/deal vinculado com link clicável
- [ ] Botão "Vincular contato" e "Vincular negócio" para casos não-auto
- [ ] Botão "Criar contato a partir desta conversa"

## Plan

1. Migração `supabase/migrations/00018_conversation_links.sql`:
   ```sql
   ALTER TABLE conversations
     ADD COLUMN IF NOT EXISTS contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
     ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
     ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES deals(id) ON DELETE SET NULL;
   
   CREATE INDEX idx_conversations_contact ON conversations(contact_id);
   CREATE INDEX idx_conversations_deal ON conversations(deal_id);
   ```

2. Atualizar [src/lib/inbox/ingest.ts](../src/lib/inbox/ingest.ts):
   ```ts
   // Após findOrCreate da conversation, antes de retornar
   if (!conversation.contact_id && (incoming.from_phone || incoming.from_email)) {
     const contactId = await tryFindContact(sb, workspaceId, {
       phone: incoming.from_phone,
       whatsapp: incoming.channel === 'whatsapp_cloud' ? incoming.from_phone : undefined,
       email: incoming.from_email,
     });
     if (contactId) {
       await sb.from('conversations')
         .update({ contact_id: contactId })
         .eq('id', conversation.id);
       conversation.contact_id = contactId;
     }
   }
   ```

3. Função `tryFindContact`:
   ```ts
   async function tryFindContact(sb, workspaceId, ids: { phone?: string; whatsapp?: string; email?: string }): Promise<string | null> {
     const filters: string[] = [];
     if (ids.phone) filters.push(`phone.eq.${normalize(ids.phone)}`);
     if (ids.whatsapp) filters.push(`whatsapp.eq.${normalize(ids.whatsapp)}`);
     if (ids.email) filters.push(`email.eq.${ids.email.toLowerCase()}`);
     if (filters.length === 0) return null;
     
     const { data } = await sb.from('contacts')
       .select('id, last_activity_at')
       .eq('workspace_id', workspaceId)
       .is('merged_into_contact_id', null) // não pegar mesclados
       .or(filters.join(','))
       .order('last_activity_at', { ascending: false, nullsFirst: false })
       .limit(1);
     return data?.[0]?.id ?? null;
   }
   ```

4. Em `src/app/(main)/inbox/[id]/page.tsx`:
   - Mostrar `<ContactBadge contactId={conv.contact_id} />` se vinculado
   - Mostrar botão "Vincular contato" se não → modal de busca de contato
   - Botão "Criar contato": pré-preenche com phone/email da conversa

5. Action `linkConversationToContact(conversationId, contactId)` em `src/lib/actions/inbox.ts`

6. Action `createContactFromConversation(conversationId)` que:
   - Cria contato com phone/email/name da conversa
   - Vincula imediatamente

## Arquivos afetados

- `supabase/migrations/00018_conversation_links.sql` (novo)
- `src/lib/inbox/ingest.ts`
- `src/lib/actions/inbox.ts` (link/create)
- `src/app/(main)/inbox/[id]/page.tsx`
- `src/components/inbox/contact-link-badge.tsx` (novo)

## Como testar

1. Aplicar migração
2. Criar contato manual com phone "+5511999998888"
3. Simular webhook WhatsApp recebido desse número
4. Conversa aparece em inbox **já vinculada** ao contato
5. Repetir com número desconhecido → conversation sem `contact_id`
6. UI mostra botão "Vincular" → escolher contato existente OU criar novo
7. Verificar `conversations.contact_id` no banco

## Notas

- `normalize(phone)` deve remover formatação: "+55 (11) 99999-8888" → "5511999998888"
- Cuidado com phone duplicado: pegar o mais recente
- Considerar vincular também a `deal_id` se contato tem deal aberto único
- Em fase futura: machine learning para auto-detectar quando "+5511999..." é mesma pessoa que "11999..."
