import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Sparkline, MiniBars } from "@/components/shared/sparkline";
import { getSession } from "@/lib/auth/guards";
import {
  campaignDailyMetrics,
  campaignsWithMetrics,
  getCampaign,
} from "@/lib/queries/marketing";
import { CampaignHeaderActions } from "@/components/campaigns/campaign-header-actions";

const STATUS_LABELS = {
  draft: { label: "Rascunho", tone: "neutral" },
  active: { label: "Ativa", tone: "good" },
  paused: { label: "Pausada", tone: "warn" },
  ended: { label: "Encerrada", tone: "neutral" },
  archived: { label: "Arquivada", tone: "neutral" },
} as const;

const OBJECTIVES: Record<string, string> = {
  lead_gen: "Captura de Leads",
  traffic: "Trafego",
  conversions: "Conversoes",
  engagement: "Engajamento",
  awareness: "Reconhecimento",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default async function CampaignDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ level?: "campaign" | "adset" | "ad" }>;
}) {
  const { id } = await params;
  const { level = "campaign" } = await searchParams;
  const session = await getSession();
  const sb = session.supabase;

  const [campaign, allCampaigns, daily] = await Promise.all([
    getCampaign(sb, id),
    campaignsWithMetrics(sb, session.workspaceId),
    campaignDailyMetrics(sb, id, 14),
  ]);
  if (!campaign) notFound();

  const summary = allCampaigns.find((c) => c.id === id);
  const meta = STATUS_LABELS[campaign.status] ?? STATUS_LABELS.draft;

  const [{ data: adSetsRaw }, { data: adsRaw }] = await Promise.all([
    sb
      .from("ad_sets")
      .select("id, name, status, daily_budget")
      .eq("campaign_id", id),
    sb
      .from("ads")
      .select("id, name, status, headline, primary_text, ad_set_id")
      .eq("workspace_id", session.workspaceId),
  ]);
  const adSets = (adSetsRaw ?? []) as unknown as {
    id: string;
    name: string;
    status: string;
    daily_budget: number | null;
  }[];
  const ads = (adsRaw ?? []) as unknown as {
    id: string;
    name: string;
    status: string;
    headline: string | null;
    primary_text: string | null;
    ad_set_id: string;
  }[];
  const adSetIds = new Set(adSets.map((s) => s.id));
  const campaignAds = ads.filter((a) => adSetIds.has(a.ad_set_id));

  const spendTrend = daily.map((d) => d.spend);
  const leadsTrend = daily.map((d) => d.leads);
  const cplTrend = daily.map((d) => d.cpl);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-8">
      <Link
        href="/campanhas"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Hub de campanhas
      </Link>

      <PageHeader
        kicker={OBJECTIVES[campaign.objective] ?? campaign.objective}
        title={campaign.name}
        description={`${adSets.length} adsets · ${campaignAds.length} ads · desde ${new Date(campaign.created_at).toLocaleDateString("pt-BR")}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge label={meta.label} tone={meta.tone} />
            <CampaignHeaderActions campaign={campaign} />
          </div>
        }
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-6">
        <MetricCard label="Investimento" value={formatBRL(summary?.spend ?? 0)} />
        <MetricCard label="Impressoes" value={(summary?.impressions ?? 0).toLocaleString("pt-BR")} />
        <MetricCard label="Cliques" value={(summary?.clicks ?? 0).toLocaleString("pt-BR")} hint={`CTR ${(summary?.ctr ?? 0).toFixed(2)}%`} />
        <MetricCard label="Leads" value={(summary?.leads ?? 0).toLocaleString("pt-BR")} />
        <MetricCard label="CPL" value={formatBRL(summary?.cpl ?? 0)} />
        <MetricCard label="ROAS" value={`${(summary?.roas ?? 0).toFixed(1)}x`} emphasis="inverse" />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <WidgetCard kicker="14 dias" title="Investimento diario">
          <MiniBars data={spendTrend.length ? spendTrend : [0]} height={100} />
        </WidgetCard>
        <WidgetCard kicker="14 dias" title="Leads capturados">
          <Sparkline data={leadsTrend.length ? leadsTrend : [0]} height={100} showArea color="var(--accent)" />
        </WidgetCard>
        <WidgetCard kicker="14 dias" title="CPL (R$)">
          <Sparkline data={cplTrend.length ? cplTrend : [0]} height={100} showArea color="var(--good)" />
        </WidgetCard>
      </section>

      <nav className="mb-4 flex gap-1 border-b border-[color:var(--line)]">
        {(["campaign", "adset", "ad"] as const).map((l) => (
          <Link
            key={l}
            href={`/campanhas/${id}?level=${l}`}
            className={`border-b-2 px-4 py-2 text-sm transition-colors ${
              level === l
                ? "border-[color:var(--accent)] text-[color:var(--ink)]"
                : "border-transparent text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
            }`}
          >
            {l === "campaign" ? "Campanha" : l === "adset" ? `Ad sets (${adSets.length})` : `Ads (${campaignAds.length})`}
          </Link>
        ))}
      </nav>

      <WidgetCard
        kicker="Drill-down"
        title={level === "campaign" ? "Metricas por dia" : level === "adset" ? "Ad sets" : "Ads"}
        padding="none"
      >
        {level === "campaign" && (
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Data</th>
                <th className="px-5 py-3 text-right font-medium">Impressoes</th>
                <th className="px-5 py-3 text-right font-medium">Cliques</th>
                <th className="px-5 py-3 text-right font-medium">Leads</th>
                <th className="px-5 py-3 text-right font-medium">Investido</th>
                <th className="px-5 py-3 text-right font-medium">CPL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line)] font-mono">
              {daily.map((d) => (
                <tr key={d.date} className="hover:bg-[color:var(--bg-2)]/40">
                  <td className="px-5 py-2.5">
                    {new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                  </td>
                  <td className="px-5 py-2.5 text-right">{d.impressions.toLocaleString("pt-BR")}</td>
                  <td className="px-5 py-2.5 text-right">{d.clicks.toLocaleString("pt-BR")}</td>
                  <td className="px-5 py-2.5 text-right">{d.leads}</td>
                  <td className="px-5 py-2.5 text-right">{formatBRL(d.spend)}</td>
                  <td className="px-5 py-2.5 text-right">{formatBRL(d.cpl)}</td>
                </tr>
              ))}
              {daily.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-xs text-[color:var(--ink-3)]">Sem dados de metrica ainda.</td></tr>
              )}
            </tbody>
          </table>
        )}
        {level === "adset" && (
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Ad set</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Budget diario</th>
                <th className="px-5 py-3 text-right font-medium w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line)]">
              {adSets.map((s) => (
                <tr key={s.id} className="cursor-pointer hover:bg-[color:var(--bg-2)]/40">
                  <td className="px-5 py-3 font-medium">{s.name}</td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      label={s.status}
                      tone={s.status === "active" ? "good" : s.status === "paused" ? "warn" : "neutral"}
                    />
                  </td>
                  <td className="px-5 py-3 text-right font-mono">
                    {s.daily_budget != null ? formatBRL(Number(s.daily_budget)) : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <ChevronRight className="inline h-3 w-3 text-[color:var(--ink-4)]" />
                  </td>
                </tr>
              ))}
              {adSets.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-xs text-[color:var(--ink-3)]">Esta campanha ainda nao tem ad sets.</td></tr>
              )}
            </tbody>
          </table>
        )}
        {level === "ad" && (
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Ad</th>
                <th className="px-5 py-3 text-left font-medium">Headline</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line)]">
              {campaignAds.map((a) => (
                <tr key={a.id} className="hover:bg-[color:var(--bg-2)]/40">
                  <td className="px-5 py-3 font-medium">{a.name}</td>
                  <td className="px-5 py-3 text-xs text-[color:var(--ink-3)]">{a.headline}</td>
                  <td className="px-5 py-3">
                    <StatusBadge
                      label={a.status}
                      tone={a.status === "active" ? "good" : a.status === "paused" ? "warn" : "neutral"}
                    />
                  </td>
                </tr>
              ))}
              {campaignAds.length === 0 && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-xs text-[color:var(--ink-3)]">Sem ads criados nesta campanha.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </WidgetCard>

      {campaign.ai_briefing && (
        <section className="mt-8">
          <WidgetCard kicker="Briefing original" title="IA gerou esta campanha a partir de:">
            <p className="text-sm text-[color:var(--ink-2)]">{campaign.ai_briefing}</p>
          </WidgetCard>
        </section>
      )}
    </div>
  );
}
