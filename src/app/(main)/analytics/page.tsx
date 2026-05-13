import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { WidgetCard } from "@/components/shared/widget-card";
import { getSession } from "@/lib/auth/guards";
import { unifiedFunnel } from "@/lib/queries/analytics";
import { dealStats, listWorkspaceUsers } from "@/lib/queries/crm";
import { DashboardFunnel } from "@/components/dashboard/real-funnel";
import { AnalyticsExportButton } from "@/components/analytics/export-button";

export const metadata = { title: "Analytics · AdSales Hub" };

type Period = "7d" | "30d" | "90d";

const PERIOD_OPTIONS: { key: Period; label: string; days: number }[] = [
  { key: "7d", label: "7 dias", days: 7 },
  { key: "30d", label: "30 dias", days: 30 },
  { key: "90d", label: "90 dias", days: 90 },
];

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: Period }>;
}) {
  const sp = await searchParams;
  const period: Period =
    sp.period && PERIOD_OPTIONS.some((p) => p.key === sp.period)
      ? (sp.period as Period)
      : "30d";
  const days = PERIOD_OPTIONS.find((p) => p.key === period)?.days ?? 30;

  const session = await getSession();
  const sb = session.supabase;

  const startCurrent = new Date(Date.now() - days * 864e5);
  const startPrior = new Date(Date.now() - 2 * days * 864e5);

  const [funnel, stats, { data: lsRaw }, users] = await Promise.all([
    unifiedFunnel(sb, session.workspaceId),
    dealStats(sb, session.workspaceId),
    sb
      .from("lead_sources")
      .select("source_type, cost, deal_id, captured_at")
      .eq("workspace_id", session.workspaceId),
    listWorkspaceUsers(sb, session.workspaceId),
  ]);

  const userById = new Map(users.map((u) => [u.id, u]));

  const lsRows = (lsRaw ?? []) as unknown as {
    source_type: string;
    cost: number | null;
    deal_id: string | null;
    captured_at: string | null;
  }[];

  // Period-bound subsets
  const inCurrent = lsRows.filter(
    (r) => r.captured_at && new Date(r.captured_at) >= startCurrent,
  );
  const inPrior = lsRows.filter(
    (r) =>
      r.captured_at &&
      new Date(r.captured_at) >= startPrior &&
      new Date(r.captured_at) < startCurrent,
  );

  const totalCostCurrent = inCurrent.reduce((a, r) => a + Number(r.cost ?? 0), 0);
  const totalCostPrior = inPrior.reduce((a, r) => a + Number(r.cost ?? 0), 0);

  const wonInCurrent = stats.won.filter(
    (d) => d.closed_at && new Date(d.closed_at) >= startCurrent,
  );
  const wonInPrior = stats.won.filter(
    (d) =>
      d.closed_at &&
      new Date(d.closed_at) >= startPrior &&
      new Date(d.closed_at) < startCurrent,
  );
  const revenueCurrent = wonInCurrent.reduce((a, d) => a + Number(d.value || 0), 0);
  const revenuePrior = wonInPrior.reduce((a, d) => a + Number(d.value || 0), 0);

  const cac = wonInCurrent.length > 0 ? totalCostCurrent / wonInCurrent.length : 0;
  const cacPrior = wonInPrior.length > 0 ? totalCostPrior / wonInPrior.length : 0;

  const ltv = wonInCurrent.length > 0 ? revenueCurrent / wonInCurrent.length : 0;
  const ltvPrior = wonInPrior.length > 0 ? revenuePrior / wonInPrior.length : 0;
  const ltvcac = cac > 0 ? ltv / cac : 0;
  const ltvcacPrior = cacPrior > 0 ? ltvPrior / cacPrior : 0;

  const roas = totalCostCurrent > 0 ? revenueCurrent / totalCostCurrent : 0;
  const roasPrior = totalCostPrior > 0 ? revenuePrior / totalCostPrior : 0;

  const pct = (c: number, p: number) => (p === 0 ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100);
  const revenueDelta = pct(revenueCurrent, revenuePrior);
  const cacDelta = pct(cac, cacPrior);
  const roasDelta = pct(roas, roasPrior);
  const ltvcacDelta = pct(ltvcac, ltvcacPrior);

  // Source attribution (period-bound)
  const bySource = new Map<string, { count: number; revenue: number; cost: number }>();
  for (const ls of inCurrent) {
    const s = bySource.get(ls.source_type) ?? { count: 0, revenue: 0, cost: 0 };
    s.count += 1;
    s.cost += Number(ls.cost ?? 0);
    if (ls.deal_id) {
      const d = stats.deals.find((x) => x.id === ls.deal_id);
      if (d?.status === "won") s.revenue += Number(d.value ?? 0);
    }
    bySource.set(ls.source_type, s);
  }
  const totalSourceRevenue =
    [...bySource.values()].reduce((a, b) => a + b.revenue, 0) || 1;
  const sourceRowsList = [...bySource.entries()].sort(
    (a, b) => b[1].revenue - a[1].revenue,
  );

  // Performance time (deals are not period-bound here — historical view)
  type SellerRow = {
    userId: string;
    name: string;
    open: number;
    won: number;
    revenue: number;
  };
  const byOwner = new Map<string, SellerRow>();
  for (const d of stats.deals) {
    const key = d.owner_user_id ?? "unassigned";
    const u = key !== "unassigned" ? userById.get(key) : null;
    const existing =
      byOwner.get(key) ??
      ({
        userId: key,
        name: u?.name ?? u?.email ?? "Sem responsavel",
        open: 0,
        won: 0,
        revenue: 0,
      } as SellerRow);
    if (d.status === "open") existing.open += 1;
    if (d.status === "won") {
      existing.won += 1;
      existing.revenue += Number(d.value || 0);
    }
    byOwner.set(key, existing);
  }
  const sellerRows = [...byOwner.values()].sort((a, b) => b.revenue - a.revenue);

  function buildHref(p: Period) {
    return p === "30d" ? "/analytics" : `/analytics?period=${p}`;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Bloco D · Analytics"
        title="Analytics unificado"
        description={`Marketing + vendas cruzados · ${PERIOD_OPTIONS.find((p) => p.key === period)?.label}`}
        actions={
          <>
            <div className="flex gap-1 rounded-pill border border-[color:var(--line-2)] p-0.5">
              {PERIOD_OPTIONS.map((p) => (
                <Link
                  key={p.key}
                  href={buildHref(p.key)}
                  className={`rounded-pill px-3 py-1 text-xs font-medium transition-colors ${
                    period === p.key
                      ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                      : "text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
                  }`}
                >
                  {p.label}
                </Link>
              ))}
            </div>
            <AnalyticsExportButton
              periodLabel={PERIOD_OPTIONS.find((p) => p.key === period)?.label ?? "30 dias"}
              kpis={{
                revenue: revenueCurrent,
                cac,
                roas,
                ltvcac,
                wonCount: wonInCurrent.length,
                cost: totalCostCurrent,
              }}
              sources={sourceRowsList.map(([source, info]) => ({
                source,
                leads: info.count,
                revenue: info.revenue,
                cost: info.cost,
              }))}
              sellers={sellerRows.map((s) => ({
                name: s.name,
                open: s.open,
                won: s.won,
                revenue: s.revenue,
              }))}
              funnel={{
                impressions: funnel.impressions,
                clicks: funnel.clicks,
                leads: funnel.leads,
                opportunities: funnel.opportunities,
                meetings: funnel.meetings,
                sales: funnel.sales,
              }}
            />
          </>
        }
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          label="Receita gerada"
          value={formatBRL(revenueCurrent)}
          emphasis="inverse"
          delta={{ value: revenueDelta }}
        />
        <MetricCard
          label="CAC"
          value={formatBRL(cac)}
          delta={{ value: cacDelta, invert: true }}
          hint="custo por cliente"
        />
        <MetricCard
          label="ROAS"
          value={`${roas.toFixed(1)}x`}
          delta={{ value: roasDelta }}
          hint="receita / investimento"
        />
        <MetricCard
          label="LTV/CAC"
          value={`${ltvcac.toFixed(1)}x`}
          hint={`LTV ${formatBRL(ltv)}`}
          delta={{ value: ltvcacDelta }}
        />
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <WidgetCard
          kicker="Funil unificado"
          title="Impressao → Venda"
          className="lg:col-span-2"
        >
          <DashboardFunnel funnel={funnel} />
        </WidgetCard>

        <WidgetCard kicker="Atribuicao" title="Receita por origem">
          <ul className="space-y-3">
            {sourceRowsList.map(([source, info]) => {
              const p = (info.revenue / totalSourceRevenue) * 100;
              return (
                <li key={source}>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="capitalize">{source.replace(/_/g, " ")}</span>
                    <span className="font-mono text-[color:var(--ink-3)]">
                      {formatBRL(info.revenue)} · {p.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[color:var(--bg-2)]">
                    <div
                      className="h-full rounded-full bg-[color:var(--accent)]"
                      style={{ width: `${Math.max(p, 3)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-[color:var(--ink-4)]">
                    {info.count} leads · custo {formatBRL(info.cost)}
                  </div>
                </li>
              );
            })}
            {sourceRowsList.length === 0 && (
              <li className="text-sm text-[color:var(--ink-3)]">
                Sem dados de atribuicao no periodo.
              </li>
            )}
          </ul>
        </WidgetCard>
      </section>

      <WidgetCard kicker="Time" title="Performance de vendas" padding="none">
        <table className="w-full text-sm">
          <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Vendedor</th>
              <th className="px-5 py-3 text-right font-medium">Abertos</th>
              <th className="px-5 py-3 text-right font-medium">Ganhos</th>
              <th className="px-5 py-3 text-right font-medium">Conversao</th>
              <th className="px-5 py-3 text-right font-medium">Receita</th>
              <th className="px-5 py-3 text-right font-medium">Ticket medio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--line)]">
            {sellerRows.map((row) => {
              const conv = row.open + row.won > 0 ? (row.won / (row.open + row.won)) * 100 : 0;
              const ticket = row.won > 0 ? row.revenue / row.won : 0;
              return (
                <tr key={row.userId} className="hover:bg-[color:var(--bg-2)]/40">
                  <td className="px-5 py-3 font-medium">{row.name}</td>
                  <td className="px-5 py-3 text-right font-mono">{row.open}</td>
                  <td className="px-5 py-3 text-right font-mono">{row.won}</td>
                  <td className="px-5 py-3 text-right font-mono">{conv.toFixed(0)}%</td>
                  <td className="px-5 py-3 text-right font-mono">{formatBRL(row.revenue)}</td>
                  <td className="px-5 py-3 text-right font-mono">{formatBRL(ticket)}</td>
                </tr>
              );
            })}
            {sellerRows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-xs text-[color:var(--ink-3)]">
                  Sem dados de vendedor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </WidgetCard>
    </div>
  );
}
