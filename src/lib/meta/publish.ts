import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getCampaignActivationChecks, isCampaignReadyToActivate } from "@/lib/campaigns/activation-checks";

export interface PublishResult {
  ok: boolean;
  error?: string;
  metaCampaignId?: string | null;
  /**
   * Quando true, publicação foi simulada (sem chave Meta configurada ou em
   * modo dry-run). Útil para desenvolvimento.
   */
  simulated?: boolean;
}

/**
 * Publica uma campanha no Meta Marketing API.
 *
 * Implementação atual (MVP):
 * - Valida pré-requisitos via `getCampaignActivationChecks`.
 * - Atualiza `campaigns.status = 'paused'` localmente (Meta sempre cria pausada).
 * - Marca como simulado se a integração real (`META_SYSTEM_USER_TOKEN`) não estiver configurada.
 *
 * TODO: orquestrar createCampaign → createAdSet[] → uploadImage → createAdCreative → createAd → createLeadForm.
 */
export async function publishCampaignToMeta(
  workspaceId: string,
  campaignId: string,
): Promise<PublishResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminSupabaseClient() as any;

  // Pré-validação
  const checks = await getCampaignActivationChecks(admin, campaignId);
  if (!isCampaignReadyToActivate(checks)) {
    const failed = checks.filter((c) => c.status === "fail").map((c) => c.label);
    return {
      ok: false,
      error: `Pré-requisitos não atendidos: ${failed.join(", ")}`,
    };
  }

  const metaToken = process.env.META_SYSTEM_USER_TOKEN;
  if (!metaToken) {
    // Simula: marca como ativa localmente mas sinaliza no DB que é simulação
    await admin
      .from("campaigns")
      .update({
        status: "paused",
        provider_campaign_id: `simulated_${Date.now()}`,
      } as never)
      .eq("id", campaignId)
      .eq("workspace_id", workspaceId);
    return {
      ok: true,
      simulated: true,
      metaCampaignId: null,
    };
  }

  // TODO: orquestração real com Meta Graph API.
  // 1. POST /act_{ad_account_id}/campaigns → campaign_id
  // 2. Para cada ad_set: POST /act_{...}/adsets
  // 3. Upload das imagens (image_hash) e criação de creatives
  // 4. POST /act_{...}/ads com adset_id + creative_id
  // 5. Se objective=lead_gen: POST /act_{...}/leadgen_forms
  // 6. Salvar provider_campaign_id, provider_ad_set_id, provider_ad_id no DB.
  // 7. Em caso de erro, rollback DELETE das entidades criadas.

  await admin
    .from("campaigns")
    .update({ status: "paused" } as never)
    .eq("id", campaignId)
    .eq("workspace_id", workspaceId);

  return {
    ok: true,
    simulated: true,
    metaCampaignId: null,
  };
}
