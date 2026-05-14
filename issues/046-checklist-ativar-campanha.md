# 046 — Checklist obrigatório antes de ativar campanha

**Tipo:** feature (UX/safety)
**Severidade:** crítico
**Bloco:** B (Ads)
**Dependências:** nenhuma
**Esforço estimado:** S (4-6h)
**Status:** todo

## Contexto

Em [src/components/campaigns/campaign-header-actions.tsx:43](../src/components/campaigns/campaign-header-actions.tsx) o botão "Ativar" começa a **gastar dinheiro real** sem checklist. Usuário pode ativar:
- Sem ter Pixel instalado (perde tracking)
- Com orçamento errado (R$ 1000/dia em vez de R$ 100)
- Sem mapear lead form
- Sem testar criativo

## Critérios de aceite

- [ ] Botão "Ativar" abre modal com checklist
- [ ] Itens verificados automaticamente: ✓ ad account ativa, ✓ pixel configurado (se objetivo conversão), ✓ lead form mapeado (se objetivo lead), ✓ criativos têm imagem, ✓ orçamento entre R$ 5-X
- [ ] Itens manuais: usuário marca "Confirmo que orçamento de R$ X/dia está correto", "Estou ciente de que vai começar a gastar agora"
- [ ] Botão "Ativar agora" disabled até todos os ✓
- [ ] Itens com ✗ têm link "Resolver" que leva à config
- [ ] Após ativar: confirma sucesso + mostra orçamento total estimado/dia

## Plan

1. Criar função `validateCampaignReadyToActivate(campaignId)`:
   ```ts
   type Check = { id: string; label: string; status: 'pass' | 'fail' | 'warn'; resolveUrl?: string; details?: string };
   
   export async function getActivationChecks(sb, campaignId: string): Promise<Check[]> {
     const checks: Check[] = [];
     const { data: campaign } = await sb.from('campaigns').select('*, ad_account:ad_accounts(*)').eq('id', campaignId).single();
     
     // Ad account
     if (!campaign.ad_account || campaign.ad_account.status !== 'active') {
       checks.push({ id: 'ad_account', label: 'Conta Meta Ads conectada', status: 'fail', resolveUrl: '/configuracoes/meta-ads' });
     } else {
       checks.push({ id: 'ad_account', label: 'Conta Meta Ads conectada', status: 'pass', details: campaign.ad_account.name });
     }
     
     // Pixel se conversão
     if (campaign.objective?.includes('conversion')) {
       const { data: pixel } = await sb.from('pixels').select('id').eq('workspace_id', campaign.workspace_id).limit(1).maybeSingle();
       checks.push({ 
         id: 'pixel', 
         label: 'Pixel configurado', 
         status: pixel ? 'pass' : 'fail', 
         resolveUrl: pixel ? undefined : '/configuracoes/pixel' 
       });
     }
     
     // Lead form mapeado
     if (campaign.objective?.includes('lead')) {
       const { data: leadForm } = await sb.from('lead_forms').select('id').eq('campaign_id', campaignId).maybeSingle();
       checks.push({ 
         id: 'lead_form', 
         label: 'Lead form configurado e mapeado', 
         status: leadForm ? 'pass' : 'fail',
         resolveUrl: leadForm ? undefined : `/campanhas/${campaignId}/lead-form` 
       });
     }
     
     // Criativos com imagem
     const { data: ads } = await sb.from('ads').select('id, creative_url').eq('campaign_id', campaignId);
     const allHaveImage = ads?.length > 0 && ads.every(a => !!a.creative_url);
     checks.push({ 
       id: 'creatives', 
       label: 'Criativos com imagem', 
       status: allHaveImage ? 'pass' : 'fail',
       resolveUrl: allHaveImage ? undefined : `/campanhas/${campaignId}/criativos` 
     });
     
     // Orçamento sensato
     const totalDaily = (campaign.ai_generated_config?.ad_sets ?? []).reduce((s: number, a: any) => s + (a.daily_budget ?? 0), 0);
     if (totalDaily < 5) {
       checks.push({ id: 'budget_low', label: 'Orçamento mínimo R$ 5/dia', status: 'fail' });
     } else if (totalDaily > 1000) {
       checks.push({ id: 'budget_high', label: `Orçamento total: R$ ${totalDaily.toFixed(0)}/dia (alto)`, status: 'warn' });
     } else {
       checks.push({ id: 'budget', label: `Orçamento: R$ ${totalDaily.toFixed(0)}/dia`, status: 'pass' });
     }
     
     return checks;
   }
   ```

2. Criar `src/components/campaigns/activate-campaign-modal.tsx`:
   - Lista checks com ícone (✓ verde, ✗ vermelho, ⚠ amarelo)
   - Para ✗: botão "Resolver" → link
   - 2 confirmações manuais (checkboxes):
     - "Confirmo o orçamento de R$ X/dia"
     - "Estou ciente que vai começar a gastar imediatamente"
   - Botão "Ativar agora" disabled enquanto qualquer ✗ ou checkbox manual desmarcada

3. Atualizar [src/components/campaigns/campaign-header-actions.tsx](../src/components/campaigns/campaign-header-actions.tsx):
   - Botão "Ativar" abre modal em vez de chamar action direta
   - Modal confirma → action `toggleCampaignStatus(id, 'active')`

## Arquivos afetados

- `src/lib/campaigns/activation-checks.ts` (novo)
- `src/components/campaigns/activate-campaign-modal.tsx` (novo)
- `src/components/campaigns/campaign-header-actions.tsx`

## Como testar

1. Criar campanha sem pixel, com creative sem imagem, orçamento R$ 2000/dia
2. Click "Ativar" → modal mostra ✗ pixel, ✗ criativo, ⚠ orçamento alto
3. Click "Resolver" no pixel → vai para `/configuracoes/pixel`
4. Voltar → check pixel agora ✓
5. Resolver criativo
6. Marcar 2 confirmações manuais
7. Botão "Ativar" habilita
8. Confirmar → campanha ativada

## Notas

- Não bloquear usuários experientes: deixar opção "Pular checklist" depois de N ativações bem-sucedidas? Não — segurança vale o atrito.
- Não verificar 100% das condições do Meta (pode dar erro depois) — focar em erros frequentes
- Considerar logar todas as ativações para auditoria (issue 020 estende para campaigns)
