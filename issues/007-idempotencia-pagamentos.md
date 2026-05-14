# 007 — Idempotência em webhooks de pagamento

**Tipo:** compliance / fix
**Severidade:** crítico
**Bloco:** Billing
**Dependências:** 006 (signature)
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

Webhooks de pagamento (Asaas, Mercado Pago, Stripe) podem ser reentregues por retry do gateway. Sem idempotência:

- `recordCreditPurchase()` é chamado N vezes
- Workspace recebe créditos duplicados
- Cliente paga 1x, ganha N pacotes

Arquivos:
- [src/app/api/webhooks/asaas/route.ts](../src/app/api/webhooks/asaas/route.ts)
- [src/app/api/webhooks/mercadopago/route.ts](../src/app/api/webhooks/mercadopago/route.ts)
- [src/app/api/webhooks/stripe/route.ts](../src/app/api/webhooks/stripe/route.ts)

## Critérios de aceite

- [ ] Tabela `webhook_events_processed` com `(provider, event_id)` como chave única
- [ ] Antes de processar evento de pagamento: checa se já existe → retorna 200 com `duplicate: true`
- [ ] Após processar com sucesso: insere registro
- [ ] Stripe: usa `event.id`
- [ ] Mercado Pago: usa `payment.id` (numeric)
- [ ] Asaas: usa `payment.id` (uuid)
- [ ] Falha em processamento NÃO insere registro (permite retry legítimo)
- [ ] Migração SQL aplicada

## Plan

1. Criar migração `supabase/migrations/00012_webhook_idempotency.sql`:
   ```sql
   CREATE TABLE IF NOT EXISTS webhook_events_processed (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     provider TEXT NOT NULL,
     event_id TEXT NOT NULL,
     event_type TEXT,
     processed_at TIMESTAMPTZ DEFAULT now(),
     workspace_id UUID REFERENCES workspaces(id),
     UNIQUE (provider, event_id)
   );
   
   CREATE INDEX idx_webhook_events_provider_eventid 
     ON webhook_events_processed (provider, event_id);
   ```

2. Criar `src/lib/webhooks/idempotency.ts`:
   ```ts
   import { createAdminSupabaseClient } from '@/lib/supabase/admin';
   
   export async function isAlreadyProcessed(
     provider: string,
     eventId: string
   ): Promise<boolean> {
     const admin = createAdminSupabaseClient();
     const { data } = await admin
       .from('webhook_events_processed')
       .select('id')
       .eq('provider', provider)
       .eq('event_id', eventId)
       .maybeSingle();
     return !!data;
   }
   
   export async function markProcessed(
     provider: string,
     eventId: string,
     opts?: { eventType?: string; workspaceId?: string }
   ): Promise<void> {
     const admin = createAdminSupabaseClient();
     await admin.from('webhook_events_processed').insert({
       provider,
       event_id: eventId,
       event_type: opts?.eventType ?? null,
       workspace_id: opts?.workspaceId ?? null,
     });
   }
   ```

3. Em [src/app/api/webhooks/stripe/route.ts](../src/app/api/webhooks/stripe/route.ts):
   ```ts
   if (await isAlreadyProcessed('stripe', event.id)) {
     return NextResponse.json({ received: true, duplicate: true });
   }
   try {
     await handleStripeEvent(event);
     await markProcessed('stripe', event.id, { eventType: event.type });
   } catch (err) { /* não marca como processado */ }
   ```

4. Mesma lógica em Asaas e Mercado Pago, ajustando o ID:
   - Asaas: `payload.payment.id`
   - MP: `payload.id` ou `payload.data.id`

## Arquivos afetados

- `supabase/migrations/00012_webhook_idempotency.sql` (novo)
- `src/lib/webhooks/idempotency.ts` (novo)
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/api/webhooks/asaas/route.ts`
- `src/app/api/webhooks/mercadopago/route.ts`

## Como testar

1. Aplicar migração: `npm run supabase:push`
2. Disparar webhook Stripe via CLI:
   ```bash
   stripe trigger checkout.session.completed
   ```
3. Verificar log: primeira chamada processa, retorna 200
4. Repetir o mesmo evento (Stripe replay):
   ```bash
   stripe events resend evt_XXX
   ```
   → 200 com `{ duplicate: true }`, **sem duplicar créditos** no banco
5. Provocar erro no handler (e.g., DB down) → não marca como processado, retry posterior funciona
6. Verificar `SELECT * FROM webhook_events_processed` mostra registro único por evento

## Notas

- Não usar `webhook_logs` existente (tem propósito diferente, log diagnóstico)
- Considerar TTL/limpeza após 90 dias (job futuro)
- Stripe já garante `event.id` único por evento
- MP envia `topic=payment&id=XXX` em query, parsear cuidado
