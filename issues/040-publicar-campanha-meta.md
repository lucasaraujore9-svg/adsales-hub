# 040 — Publicar campanha no Meta Ads (orquestração completa)

**Tipo:** feature
**Severidade:** crítico
**Bloco:** B (Ads)
**Dependências:** 046
**Esforço estimado:** L (40-60h)
**Status:** todo

## Contexto

Função-âncora do produto: usuário escreve briefing → IA gera estrutura → publica no Meta. Hoje:
1. ✓ Briefing IA gera config JSON
2. ✓ Salva como rascunho
3. ✗ **Botão "Publicar" inexistente** — campanha trava no banco
4. ✗ Sem chamada real ao Meta Marketing API

[src/lib/meta/campaigns.ts](../src/lib/meta/campaigns.ts) tem `createCampaign()` mas nunca é chamado.

## Critérios de aceite

- [ ] Botão "Publicar no Meta" no detalhe da campanha em rascunho
- [ ] Pré-validação: ad account conectada, pixel configurado, lead form mapeado, orçamento >= R$ 10/dia
- [ ] Cria Campaign no Meta com `objective`, `status='PAUSED'` (sempre criar pausado)
- [ ] Cria Ad Sets (público, orçamento, posicionamentos, otimização)
- [ ] Cria Creatives (image_hash + copy + headline + CTA + URL)
- [ ] Cria Ads (combina ad set + creative)
- [ ] Se for lead gen: cria Lead Form e vincula
- [ ] Salva todos os IDs do Meta no banco (`provider_campaign_id`, etc.)
- [ ] UI mostra progresso passo a passo ("Criando campanha... Criando ad set 1/2...")
- [ ] Em caso de erro: rollback no Meta (deletar criados) + mensagem clara
- [ ] Após sucesso: campanha fica `status='paused'` no Meta; usuário ativa manualmente em outro botão
- [ ] Webhook subsequente sincroniza status do Meta

## Plan

1. Criar `src/lib/meta/publish.ts`:
   ```ts
   export async function publishCampaign(workspaceId: string, campaignId: string): Promise<PublishResult> {
     // 1. Buscar campanha + config
     // 2. Validar pré-requisitos
     // 3. createCampaign()
     // 4. for each adSet in config: createAdSet()
     // 5. for each ad: uploadImage() → createAdCreative() → createAd()
     // 6. if leadGen: createLeadForm()
     // 7. Salvar IDs no banco
     // 8. Em erro: rollback (DELETE no Meta, marcar tentativa falha)
   }
   ```

2. Função `validatePublishPrereqs()`:
   - Workspace tem ad_account ativa
   - Pixel configurado se objetivo for conversões
   - Lead form mapeado se objetivo for leads (issue 041)
   - Orçamento mínimo
   - Imagens dos criativos têm URL válida

3. Action `publishCampaignAction(campaignId)` em [src/lib/actions/campaigns.ts](../src/lib/actions/campaigns.ts):
   - Chama `publishCampaign()`
   - Atualiza `campaigns.status = 'paused'` (no nosso banco)
   - Atualiza `provider_campaign_id`, etc.
   - revalidatePath

4. Componente `<PublishCampaignModal>`:
   - Mostra checklist de pré-requisitos (✓/✗)
   - Para cada ✗: link para resolver
   - Quando todos ✓: botão "Publicar"
   - Durante publicação: spinner com etapas ("Criando campanha", "Criando 3 ad sets", "Criando 5 ads", "Criando lead form")
   - Em sucesso: redireciona para `/campanhas/[id]/performance`

5. Botão de "Ativar" separado: muda status PAUSED → ACTIVE no Meta

6. Sync de status (cron task `meta_sync`):
   - Para cada campanha publicada (com `provider_campaign_id`), busca status no Meta
   - Atualiza local

## Arquivos afetados

- `src/lib/meta/publish.ts` (novo)
- `src/lib/meta/validate.ts` (novo)
- `src/lib/actions/campaigns.ts` (action)
- `src/components/campaigns/publish-campaign-modal.tsx` (novo)
- `src/components/campaigns/campaign-header-actions.tsx` (botão)
- `src/app/api/cron/run/route.ts` (task `meta_sync`)

## Como testar

1. Configurar ad account de teste no Meta
2. Criar campanha via briefing IA
3. Click "Publicar" → modal mostra checklist
4. Resolver pendências (pixel, etc.)
5. Click confirmar → spinner com progresso
6. Sucesso: campaign aparece no Meta Ads Manager (pausada)
7. `provider_campaign_id` populado
8. Click "Ativar" → status muda no Meta
9. Cron `meta_sync` reflete updates externos

## Notas

- Meta API tem rate limit; respeitar com retry exponencial
- Imagens precisam ser uploadadas via `image_hash` antes de criar creative
- Lead form é separado (Lead Ads endpoint)
- Token Meta criptografado (issue 006)
- Considerar dry-run mode (validar sem publicar) na primeira versão
- Isso é o trabalho mais complexo desta lista — splittar em sub-tarefas se necessário
