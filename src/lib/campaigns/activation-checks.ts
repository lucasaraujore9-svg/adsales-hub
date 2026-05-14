import "server-only";

export type CheckStatus = "pass" | "warn" | "fail";

export interface ActivationCheck {
  id: string;
  label: string;
  status: CheckStatus;
  details?: string;
  resolveUrl?: string;
}

interface CampaignRow {
  id: string;
  workspace_id: string;
  name: string;
  objective: string;
  status: string;
  daily_budget: number | null;
  lifetime_budget: number | null;
  ai_generated_config: unknown;
  ad_account_id: string | null;
}

interface AdAccountRow {
  id: string;
  name: string | null;
  status: string | null;
}

interface PixelRow {
  id: string;
}

interface LeadFormRow {
  id: string;
}

interface AdRow {
  id: string;
  creative_id: string | null;
}

interface CreativeRow {
  id: string;
  image_url: string | null;
  video_url: string | null;
}

/**
 * Avalia se uma campanha em rascunho está pronta para ser ativada.
 * Retorna lista de checks com status individual.
 *
 * Recebe SupabaseClient como `any` para evitar fricção com tipos gerados
 * — todas as queries são simples e seguras.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getCampaignActivationChecks(
  sb: any,
  campaignId: string,
): Promise<ActivationCheck[]> {
  const checks: ActivationCheck[] = [];

  const { data: campRow } = await sb
    .from("campaigns")
    .select(
      "id, workspace_id, name, objective, status, daily_budget, lifetime_budget, ai_generated_config, ad_account_id",
    )
    .eq("id", campaignId)
    .maybeSingle();
  const campaign = campRow as CampaignRow | null;

  if (!campaign) {
    return [
      {
        id: "campaign_exists",
        label: "Campanha encontrada",
        status: "fail",
        details: "Não foi possível carregar a campanha.",
      },
    ];
  }

  // 1. Conta Meta Ads conectada e ativa
  if (!campaign.ad_account_id) {
    checks.push({
      id: "ad_account",
      label: "Conta Meta Ads conectada",
      status: "fail",
      details: "Nenhuma conta de anúncios vinculada.",
      resolveUrl: "/configuracoes/meta-ads",
    });
  } else {
    const { data: acc } = await sb
      .from("ad_accounts")
      .select("id, name, status")
      .eq("id", campaign.ad_account_id)
      .maybeSingle();
    const account = acc as AdAccountRow | null;
    if (!account) {
      checks.push({
        id: "ad_account",
        label: "Conta Meta Ads conectada",
        status: "fail",
        details: "Conta vinculada não existe mais.",
        resolveUrl: "/configuracoes/meta-ads",
      });
    } else if (account.status && account.status !== "active") {
      checks.push({
        id: "ad_account",
        label: "Conta Meta Ads ativa",
        status: "fail",
        details: `Conta "${account.name ?? ""}" está em status: ${account.status}.`,
        resolveUrl: "/configuracoes/meta-ads",
      });
    } else {
      checks.push({
        id: "ad_account",
        label: "Conta Meta Ads conectada",
        status: "pass",
        details: account.name ?? "Conta ativa",
      });
    }
  }

  // 2. Pixel configurado (apenas para objetivos de conversão)
  const needsPixel =
    campaign.objective === "conversions" || campaign.objective === "sales";
  if (needsPixel) {
    const { data: pixelRow } = await sb
      .from("pixels")
      .select("id")
      .eq("workspace_id", campaign.workspace_id)
      .limit(1)
      .maybeSingle();
    const pixel = pixelRow as PixelRow | null;
    checks.push({
      id: "pixel",
      label: "Pixel configurado",
      status: pixel ? "pass" : "fail",
      details: pixel
        ? "Pixel encontrado no workspace."
        : "Objetivo de conversão exige um Pixel configurado.",
      resolveUrl: pixel ? undefined : "/configuracoes/pixel",
    });
  }

  // 3. Lead form (para campanhas de lead_gen)
  if (campaign.objective === "lead_gen") {
    const { data: lfRow } = await sb
      .from("lead_forms")
      .select("id")
      .eq("campaign_id", campaign.id)
      .limit(1)
      .maybeSingle();
    const lf = lfRow as LeadFormRow | null;
    checks.push({
      id: "lead_form",
      label: "Lead form vinculado",
      status: lf ? "pass" : "fail",
      details: lf
        ? "Formulário pronto para captar leads."
        : "Campanha de Lead Gen exige um formulário.",
      resolveUrl: lf ? undefined : `/campanhas/${campaign.id}`,
    });
  }

  // 4. Ao menos 1 criativo com imagem ou vídeo
  const { data: adsRows } = await sb
    .from("ads")
    .select("id, creative_id")
    .eq("campaign_id", campaign.id);
  const ads = (adsRows ?? []) as AdRow[];

  if (ads.length === 0) {
    checks.push({
      id: "creatives",
      label: "Anúncios criados",
      status: "fail",
      details: "Nenhum anúncio cadastrado na campanha.",
      resolveUrl: `/campanhas/${campaign.id}`,
    });
  } else {
    const creativeIds = ads.map((a) => a.creative_id).filter(Boolean) as string[];
    let creativesOk = creativeIds.length > 0;
    if (creativeIds.length > 0) {
      const { data: crRows } = await sb
        .from("ad_creatives")
        .select("id, image_url, video_url")
        .in("id", creativeIds);
      const creatives = (crRows ?? []) as CreativeRow[];
      creativesOk =
        creatives.length === creativeIds.length &&
        creatives.every((c) => !!c.image_url || !!c.video_url);
    }
    checks.push({
      id: "creatives",
      label: `Anúncios com mídia (${ads.length})`,
      status: creativesOk ? "pass" : "fail",
      details: creativesOk
        ? "Todos os anúncios têm imagem ou vídeo."
        : "Há anúncios sem mídia configurada.",
      resolveUrl: creativesOk ? undefined : `/campanhas/${campaign.id}`,
    });
  }

  // 5. Orçamento dentro de faixa razoável
  const dailyTotal =
    Number(campaign.daily_budget ?? 0) ||
    sumAdSetsBudget(campaign.ai_generated_config);
  if (!Number.isFinite(dailyTotal) || dailyTotal < 5) {
    checks.push({
      id: "budget",
      label: "Orçamento mínimo (R$ 5/dia)",
      status: "fail",
      details: dailyTotal
        ? `Orçamento atual: R$ ${dailyTotal.toFixed(2)}/dia. Meta exige no mínimo R$ 5.`
        : "Defina um orçamento diário.",
      resolveUrl: `/campanhas/${campaign.id}`,
    });
  } else if (dailyTotal > 1000) {
    checks.push({
      id: "budget",
      label: "Orçamento alto",
      status: "warn",
      details: `R$ ${dailyTotal.toFixed(2)}/dia. Confirme se este é o valor desejado.`,
    });
  } else {
    checks.push({
      id: "budget",
      label: `Orçamento: R$ ${dailyTotal.toFixed(2)}/dia`,
      status: "pass",
    });
  }

  return checks;
}

function sumAdSetsBudget(config: unknown): number {
  if (!config || typeof config !== "object") return 0;
  const adSets = (config as { ad_sets?: Array<{ daily_budget?: number }> }).ad_sets;
  if (!Array.isArray(adSets)) return 0;
  return adSets.reduce((acc, a) => acc + Number(a.daily_budget ?? 0), 0);
}

/**
 * Retorna true apenas se TODOS os checks tipo fail estiverem ok.
 * Warnings não bloqueiam (usuário confirma).
 */
export function isCampaignReadyToActivate(checks: ActivationCheck[]): boolean {
  return checks.every((c) => c.status !== "fail");
}
