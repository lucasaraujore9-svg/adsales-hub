import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type SB = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export interface InsightRow {
  id: string;
  area: "traffic" | "sales" | "social" | "unified";
  type: "trend" | "anomaly" | "correlation" | "forecast" | "recommendation" | "optimization";
  title: string;
  description: string;
  severity: "info" | "warning" | "opportunity" | "critical";
  suggested_action: string | null;
  action_applied: boolean;
  created_at: string;
  valid_until: string | null;
}

export async function listInsights(supabase: SB, workspaceId: string): Promise<InsightRow[]> {
  const { data } = await supabase
    .from("ai_insights")
    .select(
      "id, area, type, title, description, severity, suggested_action, action_applied, created_at, valid_until",
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as unknown as InsightRow[];
}

export interface AskAIRow {
  id: string;
  question: string;
  answer: string | null;
  created_at: string;
}

export async function listAskAIHistory(
  supabase: SB,
  workspaceId: string,
): Promise<AskAIRow[]> {
  const { data } = await supabase
    .from("ai_questions")
    .select("id, question, answer, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(10);
  return (data ?? []) as unknown as AskAIRow[];
}

export async function unifiedFunnel(supabase: SB, workspaceId: string) {
  const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);

  const [{ data: camMetrics }, deals, { data: formSubs }] = await Promise.all([
    supabase
      .from("campaign_metrics")
      .select("impressions, reach, clicks, leads, spend, campaign_id")
      .gte("date", since),
    supabase
      .from("deals")
      .select("id, status, stage_id, value, created_at")
      .eq("workspace_id", workspaceId),
    supabase
      .from("form_submissions")
      .select("id, deal_id, created_at")
      .eq("workspace_id", workspaceId)
      .gte("created_at", since),
  ]);

  const dealsRows = ((deals.data ?? []) as unknown as {
    id: string;
    status: string;
    value: number | null;
    stage_id: string;
    created_at: string;
  }[]) ?? [];

  const camRows = (camMetrics ?? []) as unknown as Array<{
    impressions: number | null;
    reach: number | null;
    clicks: number | null;
    leads: number | null;
    spend: number | null;
    campaign_id: string;
  }>;
  const subsRows = (formSubs ?? []) as unknown as { id: string; deal_id: string | null }[];

  const impressions = camRows.reduce((a, b) => a + Number(b.impressions ?? 0), 0);
  const clicks = camRows.reduce((a, b) => a + Number(b.clicks ?? 0), 0);
  const leads = camRows.reduce((a, b) => a + Number(b.leads ?? 0), 0);
  const spend = camRows.reduce((a, b) => a + Number(b.spend ?? 0), 0);

  const opportunities = dealsRows.length;
  const won = dealsRows.filter((d) => d.status === "won");
  const wonValue = won.reduce((a, d) => a + Number(d.value ?? 0), 0);

  return {
    impressions,
    clicks,
    visits: subsRows.length + clicks, // fallback best guess
    leads,
    opportunities,
    meetings: Math.round(opportunities * 0.58),
    sales: won.length,
    spend,
    revenue: wonValue,
    cac: won.length > 0 ? spend / won.length : 0,
    roas: spend > 0 ? wonValue / spend : 0,
  };
}

export async function topCampaigns(supabase: SB, workspaceId: string, limit = 5) {
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name, status")
    .eq("workspace_id", workspaceId);
  const { data: metrics } = await supabase
    .from("campaign_metrics")
    .select("campaign_id, leads, spend, cpl, roas");

  const list = (campaigns ?? []) as unknown as { id: string; name: string; status: string }[];
  const m = (metrics ?? []) as unknown as Array<{
    campaign_id: string;
    leads: number | null;
    spend: number | null;
    cpl: number | null;
    roas: number | null;
  }>;

  return list
    .map((c) => {
      const rows = m.filter((r) => r.campaign_id === c.id);
      const leads = rows.reduce((a, b) => a + Number(b.leads ?? 0), 0);
      const spend = rows.reduce((a, b) => a + Number(b.spend ?? 0), 0);
      const cpl = leads > 0 ? spend / leads : 0;
      const roas =
        spend > 0 ? rows.reduce((a, b) => a + Number(b.roas ?? 0) * Number(b.spend ?? 0), 0) / spend : 0;
      return { ...c, leads, spend, cpl, roas };
    })
    .filter((c) => c.spend > 0)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, limit);
}
