# 064 — Lembretes automáticos de proposta (3d / 5d / 7d)

**Tipo:** feature
**Severidade:** médio
**Bloco:** F (Contratos)
**Dependências:** 042 (email dispatcher, opcional)
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

Cliente recebe proposta e esquece de responder. Vendedor esquece de cobrar. Proposta expira sem fechar.

## Critérios de aceite

- [ ] Cron `proposal_reminders` (a cada 1h)
- [ ] Para propostas com status='sent' e sem visualização ainda:
  - 3 dias depois: lembrete amigável "Você recebeu a proposta?"
  - 7 dias depois: "Posso ajudar?"
- [ ] Para propostas visualizadas mas não aceitas:
  - 5 dias depois da visualização: "Tem dúvidas?"
- [ ] Limite máximo: 3 lembretes por proposta
- [ ] Pode ser desabilitado em configurações
- [ ] Não envia se proposta foi recusada/cancelada
- [ ] Vendedor (owner do deal) recebe cópia interna

## Plan

1. Migração `supabase/migrations/00028_proposal_reminders.sql`:
   ```sql
   ALTER TABLE proposals
     ADD COLUMN IF NOT EXISTS reminders_sent INT DEFAULT 0,
     ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMPTZ,
     ADD COLUMN IF NOT EXISTS reminders_disabled BOOLEAN DEFAULT FALSE;
   ```

2. Em cron task `proposal_reminders`:
   ```ts
   const now = new Date();
   const day3 = new Date(now.getTime() - 3 * 24 * 3600_000).toISOString();
   const day5 = new Date(now.getTime() - 5 * 24 * 3600_000).toISOString();
   const day7 = new Date(now.getTime() - 7 * 24 * 3600_000).toISOString();
   
   // 3 dias sem visualizar
   const { data: silent } = await admin.from('proposals')
     .select('*')
     .eq('status', 'sent')
     .is('viewed_at', null)
     .lte('sent_at', day3)
     .lt('reminders_sent', 3)
     .or('last_reminder_at.is.null,last_reminder_at.lte.' + day3)
     .eq('reminders_disabled', false);
   
   for (const p of silent ?? []) await sendReminder(admin, p, 'silent_3d');
   
   // 5 dias após visualizar
   const { data: viewed } = await admin.from('proposals')
     .select('*')
     .eq('status', 'sent')
     .not('viewed_at', 'is', null)
     .lte('viewed_at', day5)
     .lt('reminders_sent', 3);
   
   for (const p of viewed ?? []) await sendReminder(admin, p, 'viewed_5d');
   ```

3. Função `sendReminder(admin, proposal, type)`:
   - Templates pt-BR diferentes por tipo
   - Envia via Resend (issue 042) ou logger se não disponível
   - Atualiza `reminders_sent += 1`, `last_reminder_at = now()`
   - Notifica vendedor (interno)

4. UI em `/configuracoes/contratos`:
   - Switch "Lembretes automáticos"
   - Editar templates de cada lembrete

5. Botão na proposta: "Pausar lembretes" → set `reminders_disabled=true`

## Arquivos afetados

- `supabase/migrations/00028_proposal_reminders.sql` (novo)
- `src/lib/contracts/reminders.ts` (novo)
- `src/app/api/cron/run/route.ts` (task)
- `src/app/(main)/configuracoes/contratos/page.tsx`
- `src/components/contratos/proposal-actions.tsx`

## Como testar

1. Criar proposta de teste com `sent_at` 4 dias atrás, viewed_at null
2. Trigger cron `?task=proposal_reminders`
3. Email de lembrete enviado, `reminders_sent=1`
4. Aguardar (ou simular) +3 dias → 2º lembrete
5. Após 3 lembretes → não envia mais
6. Cliente visualiza → primeiro reminder pós-view
7. Pausar lembretes → para de enviar

## Notas

- Não usar tom agressivo; manter cordial
- Considerar A/B test de copy em fase futura
- Lembrete de WhatsApp: requer template aprovado pelo Meta
