import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type SB = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export interface CampaignRow {
  id: string;
  name: string;
  objective: string;
  status: "draft" | "active" | "paused" | "ended" | "archived";
  daily_budget: number | null;
  lifetime_budget: number | null;
  start_date: string | null;
  end_date: string | null;
  ad_account_id: string;
  ai_briefing: string | null;
  ai_generated_config: unknown;
  created_at: string;
}

export interface CampaignMetricsAgg {
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  spend: number;
  roas: number;
  ctr: number;
  cpl: number;
  frequency: number;
}

export async function listCampaigns(
  supabase: SB,
  workspaceId: string,
): Promise<CampaignRow[]> {
  const { data } = await supabase
    .from("campaigns")
    .select(
      "id, name, objective, status, daily_budget, lifetime_budget, start_date, end_date, ad_account_id, ai_briefing, ai_generated_config, created_at",
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as CampaignRow[];
}

export async function getCampaign(supabase: SB, id: string): Promise<CampaignRow | null> {
  const { data } = await supabase
    .from("campaigns")
    .select(
      "id, name, objective, status, daily_budget, lifetime_budget, start_date, end_date, ad_account_id, ai_briefing, ai_generated_config, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as CampaignRow | null) ?? null;
}

export async function campaignsWithMetrics(
  supabase: SB,
  workspaceId: string,
): Promise<(CampaignRow & CampaignMetricsAgg & { ad_sets_count: number; ads_count: number })[]> {
  const [campaigns, { data: metrics }, { data: adSets }, { data: ads }] = await Promise.all([
    listCampaigns(supabase, workspaceId),
    supabase
      .from("campaign_metrics")
      .select("campaign_id, impressions, reach, clicks, ctr, leads, cpl, spend, roas, frequency"),
    supabase.from("ad_sets").select("id, campaign_id").eq("workspace_id", workspaceId),
    supabase.from("ads").select("id, ad_set_id").eq("workspace_id", workspaceId),
  ]);
  const metricsRaw = (metrics ?? []) as unknown as Array<{
    campaign_id: string;
    impressions: number | null;
    reach: number | null;
    clicks: number | null;
    ctr: number | null;
    leads: number | null;
    cpl: number | null;
    spend: number | null;
    roas: number | null;
    frequency: number | null;
  }>;
  const adSetsRaw = (adSets ?? []) as unknown as { id: string; campaign_id: string }[];
  const adsRaw = (ads ?? []) as unknown as { id: string; ad_set_id: string }[];

  return campaigns.map((c) => {
    const rows = metricsRaw.filter((m) => m.campaign_id === c.id);
    const impressions = rows.reduce((a, b) => a + Number(b.impressions ?? 0), 0);
    const reach = rows.reduce((a, b) => a + Number(b.reach ?? 0), 0);
    const clicks = rows.reduce((a, b) => a + Number(b.clicks ?? 0), 0);
    const leads = rows.reduce((a, b) => a + Number(b.leads ?? 0), 0);
    const spend = rows.reduce((a, b) => a + Number(b.spend ?? 0), 0);
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpl = leads > 0 ? spend / leads : 0;
    const avgRoas =
      spend > 0
        ? rows.reduce((a, b) => a + Number(b.roas ?? 0) * Number(b.spend ?? 0), 0) / spend
        : 0;
    const avgFreq =
      rows.length > 0 ? rows.reduce((a, b) => a + Number(b.frequency ?? 0), 0) / rows.length : 0;
    const cAdSets = adSetsRaw.filter((s) => s.campaign_id === c.id);
    const ad_sets_count = cAdSets.length;
    const ads_count = adsRaw.filter((ad) => cAdSets.some((s) => s.id === ad.ad_set_id)).length;
    return {
      ...c,
      impressions,
      reach,
      clicks,
      leads,
      spend,
      ctr,
      cpl,
      roas: avgRoas,
      frequency: avgFreq,
      ad_sets_count,
      ads_count,
    };
  });
}

export async function campaignDailyMetrics(
  supabase: SB,
  campaignId: string,
  days = 14,
): Promise<{ date: string; spend: number; leads: number; cpl: number; clicks: number; impressions: number }[]> {
  const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const { data } = await supabase
    .from("campaign_metrics")
    .select("date, spend, leads, clicks, impressions")
    .eq("campaign_id", campaignId)
    .gte("date", since)
    .order("date", { ascending: true });
  const rows = (data ?? []) as unknown as Array<{
    date: string;
    spend: number | null;
    leads: number | null;
    clicks: number | null;
    impressions: number | null;
  }>;
  return rows.map((r) => ({
    date: r.date,
    spend: Number(r.spend ?? 0),
    leads: Number(r.leads ?? 0),
    clicks: Number(r.clicks ?? 0),
    impressions: Number(r.impressions ?? 0),
    cpl: Number(r.leads ?? 0) > 0 ? Number(r.spend ?? 0) / Number(r.leads ?? 0) : 0,
  }));
}

export interface AudienceRow {
  id: string;
  name: string;
  type: "saved" | "custom" | "lookalike" | "retargeting";
  size_estimate: number | null;
  last_synced_at: string | null;
  updated_at: string;
  provider_audience_id: string | null;
  config: unknown;
}

export async function listAudiences(supabase: SB, workspaceId: string): Promise<AudienceRow[]> {
  const { data } = await supabase
    .from("audiences")
    .select("id, name, type, size_estimate, last_synced_at, updated_at, provider_audience_id, config")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });
  return (data ?? []) as unknown as AudienceRow[];
}

export interface CreativeRow {
  id: string;
  name: string;
  type: "image" | "video" | "carousel";
  file_url: string | null;
  thumbnail_url: string | null;
  tags: string[];
  category: string | null;
  performance_data: unknown;
  created_at: string;
}

export async function listCreatives(supabase: SB, workspaceId: string): Promise<CreativeRow[]> {
  const [adRes, aiRes] = await Promise.all([
    supabase
      .from("ad_creatives")
      .select("id, name, type, file_url, thumbnail_url, tags, category, performance_data, created_at")
      .eq("workspace_id", workspaceId),
    supabase
      .from("ai_creatives")
      .select("id, type, file_url, thumbnail_url, metadata, created_at, status")
      .eq("workspace_id", workspaceId)
      .eq("status", "ready"),
  ]);

  const ads = ((adRes.data ?? []) as unknown as CreativeRow[]).map((c) => ({
    ...c,
    tags: c.tags ?? [],
  }));

  const aiRows = (aiRes.data ?? []) as unknown as Array<{
    id: string;
    type: "image" | "video";
    file_url: string | null;
    thumbnail_url: string | null;
    metadata: { name?: string } | null;
    created_at: string;
  }>;

  const aiAsCreatives: CreativeRow[] = aiRows.map((c) => ({
    id: c.id,
    name: c.metadata?.name ?? "Criativo IA",
    type: c.type,
    file_url: c.file_url,
    thumbnail_url: c.thumbnail_url,
    tags: ["IA"],
    category: "ai_generated",
    performance_data: null,
    created_at: c.created_at,
  }));

  return [...ads, ...aiAsCreatives].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export interface AiOptLogRow {
  id: string;
  campaign_id: string | null;
  type: "suggestion" | "auto_action";
  action: string;
  details: Record<string, unknown>;
  status: "pending" | "approved" | "rejected" | "applied" | "failed";
  applied_at: string | null;
  created_at: string;
}

export async function listOptimizationLogs(
  supabase: SB,
  workspaceId: string,
): Promise<AiOptLogRow[]> {
  const { data } = await supabase
    .from("ai_optimization_logs")
    .select("id, campaign_id, type, action, details, status, applied_at, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(30);
  return (data ?? []) as unknown as AiOptLogRow[];
}
