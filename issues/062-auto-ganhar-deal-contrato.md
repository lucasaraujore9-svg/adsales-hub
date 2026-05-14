# 062 — Auto-ganhar deal após contrato assinado

**Tipo:** feature (integração)
**Severidade:** alto
**Bloco:** F (Contratos) / A (CRM)
**Dependências:** 020 (audit log, opcional)
**Esforço estimado:** S (3-4h)
**Status:** todo

## Contexto

Quando todas as partes assinam um contrato, o deal vinculado deveria ir para `status='won'` automaticamente. Hoje vendedor tem que mover manualmente — esquece, deal fica preso em "negociação", métricas distorcidas.

## Critérios de aceite

- [ ] Quando último signatário assina (todos com `status='signed'`):
  - Deal vinculado → `status='won'`, `closed_at=now()`
  - Estágio movido para "Ganho" (último estágio do pipeline ou `is_won=true`)
- [ ] Notificação para owner do deal
- [ ] Webhook `deal.won` disparado
- [ ] Audit log marca: "won_via_contract: <contract_id>"
- [ ] Goals.achieved recalculado (issue 027)
- [ ] Se contrato é cancelado/recusado: deal fica como estava

## Plan

1. Em [src/lib/actions/contracts.ts](../src/lib/actions/contracts.ts) (ou webhook de assinatura):
   - Após marcar signer como signed, verificar se TODOS signers do contrato estão signed
   - Se sim, e contract.deal_id existe:
     ```ts
     async function handleAllSigned(sb, contractId: string) {
       const { data: contract } = await sb.from('contracts').select('*').eq('id', contractId).single();
       if (!contract?.deal_id) return;
       
       // Buscar estágio "Ganho" do pipeline
       const { data: deal } = await sb.from('deals').select('pipeline_id').eq('id', contract.deal_id).single();
       const { data: wonStage } = await sb.from('pipeline_stages')
         .select('id')
         .eq('pipeline_id', deal.pipeline_id)
         .eq('is_won', true)
         .limit(1)
         .maybeSingle();
       
       const updates: Record<string, unknown> = {
         status: 'won',
         closed_at: new Date().toISOString(),
         metadata: { won_via_contract: contractId },
       };
       if (wonStage) updates.stage_id = wonStage.id;
       
       await sb.from('deals').update(updates).eq('id', contract.deal_id);
       
       // Webhook
       await dispatchWebhook(contract.workspace_id, 'deal.won', {
         deal_id: contract.deal_id,
         won_via_contract: contractId,
       });
       
       // Trigger goal recalc (issue 027)
       await triggerGoalRecalc(contract.workspace_id, ['revenue', 'deals_won']);
     }
     ```

2. Atualizar contract.status para 'fully_signed' ao mesmo tempo

3. Verificar se já existe webhook/handler na rota de assinatura `/contrato/[token]` — adicionar lógica lá

4. Adicionar coluna `is_won` em `pipeline_stages` se não existir:
   ```sql
   ALTER TABLE pipeline_stages ADD COLUMN IF NOT EXISTS is_won BOOLEAN DEFAULT FALSE;
   ```

## Arquivos afetados

- `src/lib/actions/contracts.ts`
- `src/app/contrato/[token]/page.tsx` (action de assinar)
- `supabase/migrations/00026_pipeline_won_flag.sql` (se necessário)

## Como testar

1. Criar deal vinculado a contrato com 2 signatários
2. Assinatário 1 assina → deal continua em andamento
3. Assinatário 2 assina (último) → deal vira "Ganho", aparece no pipeline na coluna ganho
4. Owner recebe notificação
5. Audit log mostra "won_via_contract"
6. Reabrir deal manualmente → contrato fica como ganhou (não muda)

## Notas

- Não desfazer auto-ganhar se signatário cancelar depois (raro)
- Considerar opção em config: "ganhar deal automaticamente?" (default true)
- Se workspace não tem estágio com `is_won=true`, usar último estágio do pipeline
