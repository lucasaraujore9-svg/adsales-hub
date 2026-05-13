import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { campaignsWithMetrics } from "@/lib/queries/marketing";
import { PerformanceHeatmap } from "@/components/campaigns/performance-heatmap";

export const metadata = { title: "Performance · AdSales Hub" };

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default async function PerformancePage() {
  const session = await getSession();
  const sb = session.supabase;
  const campaigns = await campaignsWithMetrics(sb, session.workspaceId);
  const totalSpend = campaigns.reduce((a, c) => a + c.spend, 0);
  const totalLeads = campaigns.reduce((a, c) => a + c.leads, 0);
  const totalImpressions = campaigns.reduce((a, c) => a + c.impressions, 0);
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

  const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const { data: hourlyRaw } = await sb
    .from("campaign_metrics")
    .select("date, hour, leads, spend, ctr")
    .gte("date", since)
    .not("hour", "is", null);
  const hourlyRows = ((hourlyRaw ?? []) as unknown as Array<{
    date: string;
    hour: number | null;
    leads: number | null;
    spend: number | null;
    ctr: number | null;
  }>).map((r) => ({
    date: r.date,
    hour: r.hour ?? 0,
    leads: Number(r.leads ?? 0),
    spend: Number(r.spend ?? 0),
    ctr: Number(r.ctr ?? 0),
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Performance consolidada"
        title="Todas as campanhas"
        description="Cruze metricas entre campanhas. Drill-down por campanha para ver ad_sets e ads."
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Investido 30d" value={formatBRL(totalSpend)} />
        <MetricCard label="Impressoes" value={totalImpressions.toLocaleString("pt-BR")} />
        <MetricCard label="Leads" value={totalLeads.toLocaleString("pt-BR")} emphasis="inverse" />
        <MetricCard label="CPL medio" value={formatBRL(avgCpl)} />
      </section>

      <WidgetCard
        kicker="Heatmap"
        title="Performance por dia da semana e horario"
        description="30 dias · clique nos botoes pra alternar entre leads, investimento e CTR"
        className="mb-8"
      >
        <PerformanceHeatmap rows={hourlyRows} />
      </WidgetCard>

      <WidgetCard kicker="Comparativo" title="Todas as campanhas" padding="none">
        <table className="w-full text-sm">
          <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Campanha</th>
              <th className="px-5 py-3 text-right font-medium">Leads</th>
              <th className="px-5 py-3 text-right font-medium">CPL</th>
              <th className="px-5 py-3 text-right font-medium">ROAS</th>
              <th className="px-5 py-3 text-right font-medium">Investido</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--line)]">
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-[color:var(--bg-2)]/40">
                <td className="px-5 py-3">
                  <Link href={`/campanhas/${c.id}`} className="font-medium hover:text-[color:var(--accent)]">
                    {c.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-right font-mono">{c.leads.toLocaleString("pt-BR")}</td>
                <td className="px-5 py-3 text-right font-mono">{c.cpl > 0 ? formatBRL(c.cpl) : "—"}</td>
                <td className="px-5 py-3 text-right font-mono">{c.roas > 0 ? `${c.roas.toFixed(1)}x` : "—"}</td>
                <td className="px-5 py-3 text-right font-mono">{formatBRL(c.spend)}</td>
                <td className="px-5 py-3">
                  <StatusBadge
                    label={c.status}
                    tone={c.status === "active" ? "good" : c.status === "paused" ? "warn" : "neutral"}
                  />
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-xs text-[color:var(--ink-3)]">Nenhuma campanha cadastrada.</td></tr>
            )}
          </tbody>
        </table>
      </WidgetCard>
    </div>
  );
}
