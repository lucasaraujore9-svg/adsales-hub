# 076 — Mudança de plano com prorata explicada

**Tipo:** feature
**Severidade:** alto
**Bloco:** Billing
**Dependências:** 075
**Esforço estimado:** M (10-16h)
**Status:** todo

## Contexto

Usuário não sabe o que vai ser cobrado se trocar de plano no meio do mês. Stripe suporta prorata, mas a UI não calcula nem mostra.

## Critérios de aceite

- [ ] Antes de confirmar mudança: preview com:
  - Valor a cobrar imediatamente (prorata diferença)
  - Próxima cobrança recorrente (data + valor)
  - "Você está mudando de [Plano A] (R$ X) → [Plano B] (R$ Y)"
- [ ] Suporte a upgrade (cobra prorata) e downgrade (efeito no próximo ciclo)
- [ ] Confirmação dupla
- [ ] Após confirmar: subscription atualizada via Stripe API
- [ ] Email de confirmação enviado

## Plan

1. Função `previewSubscriptionChange(workspaceId, newPlanId)`:
   - Chama Stripe `subscriptions.upcoming` com `proration_behavior='create_prorations'`
   - Retorna `{ immediate_charge, next_charge_amount, next_charge_date }`

2. Action `changeSubscriptionPlan(newPlanId)`:
   - Stripe `subscriptions.update` com prorata
   - Atualiza `subscriptions` local

3. UI:
   - Em `/upgrade`: ao escolher novo plano, modal de preview
   - "Mudança de Plano A → Plano B"
   - "Cobramos R$ X agora (proporcional aos dias restantes)"
   - "Próxima cobrança: R$ Y em DD/MM/YYYY"
   - Botões "Confirmar mudança" / "Cancelar"

4. Webhook Stripe `customer.subscription.updated`:
   - Atualiza local
   - Envia email de confirmação

## Arquivos afetados

- `src/lib/stripe/preview.ts` (novo)
- `src/lib/actions/billing.ts` (action change)
- `src/components/billing/change-plan-modal.tsx` (novo)
- `src/app/(main)/upgrade/page.tsx`
- `src/app/api/webhooks/stripe/route.ts` (handler updated)

## Como testar

1. Workspace em plano Operação
2. Click "Mudar para Crescimento"
3. Modal mostra: "Cobraremos R$ XXX agora, próxima fatura R$ 690 em 15/06"
4. Confirmar → Stripe processa
5. Stripe dashboard mostra prorata correta
6. Email recebido confirmando mudança

## Notas

- Downgrade: agendar mudança para fim do ciclo (não cobra/credita imediato)
- Apresentar valores em BRL formatados
- Considerar créditos pendentes (se workspace tem)
