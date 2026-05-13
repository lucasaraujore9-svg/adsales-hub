import Link from "next/link";
import { Sparkles, TrendingUp, Users, Target, DollarSign, FileBarChart, Plus, CheckSquare } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { WidgetCard } from "@/components/shared/widget-card";
import { Sparkline, MiniBars } from "@/components/shared/sparkline";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/guards";
import { dealStats, listActivities } from "@/lib/queries/crm";
import { campaignsWithMetrics, listOptimizationLogs } from "@/lib/queries/marketing";
import { unifiedFunnel, topCampaigns } from "@/lib/queries/analytics";
import { DashboardPipelineSnapshot } from "@/components/dashboard/real-pipeline-snapshot";
import { DashboardFunnel } from "@/components/dashboard/real-funnel";
import { DashboardTopCampaigns } from "@/components/dashboard/real-top-campaigns";
import { DashboardActivitiesToday } from "@/components/dashboard/real-activities-today";
import { LeadsBySourceChart, buildLeadsBySource } from "@/components/dashboard/leads-by-source";
import { DashboardExportButton } from "@/components/dashboard/export-button";

export const metadata = { title: "Dashboard · AdSales Hub" };

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

type Period = "7d" | "30d" | "90d" | "this_month" | "last_month";

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: "7d", label: "Ultimos 7 dias" },
  { key: "30d", label: "Ultimos 30 dias" },
  { key: "90d", label: "Ultimos 90 dias" },
  { key: "this_month", label: "Mes atual" },
  { key: "last_month", label: "Mes anterior" },
];

function resolvePeriod(period: Period): {
  startCurrent: Date;
  endCurrent: Date;
  startPrior: Date;
  endPrior: Date;
  trendDays: number;
} {
  const now = new Date();
  switch (period) {
    case "7d": {
      const startCurrent = new Date(now.getTime() - 7 * 864e5);
      const startPrior = new Date(now.getTime() - 14 * 864e5);
      return { startCurrent, endCurrent: now, startPrior, endPrior: startCurrent, trendDays: 7 };
    }
    case "90d": {
      const startCurrent = new Date(now.getTime() - 90 * 864e5);
      const startPrior = new Date(now.getTime() - 180 * 864e5);
      return { startCurrent, endCurrent: now, startPrior, endPrior: startCurrent, trendDays: 30 };
    }
    case "this_month": {
      const startCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
      const startPrior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { startCurrent, endCurrent: now, startPrior, endPrior: startCurrent, trendDays: 30 };
    }
    case "last_month": {
      const startCurrent = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
      const startPrior = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return { startCurrent, endCurrent, startPrior, endPrior: startCurrent, trendDays: 30 };
    }
    case "30d":
    default: {
      const startCurrent = new Date(now.getTime() - 30 * 864e5);
      const startPrior = new Date(now.getTime() - 60 * 864e5);
      return { startCurrent, endCurrent: now, startPrior, endPrior: startCurrent, trendDays: 14 };
    }
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: Period }>;
}) {
  const sp = await searchParams;
  const period: Period =
    sp.period && PERIOD_OPTIONS.some((p) => p.key === sp.period)
      ? (sp.period as Period)
      : "30d";
  const { startCurrent, endCurrent, startPrior, endPrior, trendDays } = resolvePeriod(period);
  const periodLabel =
    PERIOD_OPTIONS.find((p) => p.key === period)?.label ?? "Ultimos 30 dias";

  const session = await getSession();
  const sb = session.supabase;

  const [stats, campaigns, funnel, top, activities, optLogs] = await Promise.all([
    dealStats(sb, session.workspaceId),
    campaignsWithMetrics(sb, session.workspaceId),
    unifiedFunnel(sb, session.workspaceId),
    topCampaigns(sb, session.workspaceId, 5),
    listActivities(sb, session.workspaceId, { limit: 10 }),
    listOptimizationLogs(sb, session.workspaceId),
  ]);

  const pendingSuggestions = optLogs.filter((s) => s.status === "pending");

  const now = endCurrent;
  const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

  const spendByDay = new Map<string, number>();
  const leadsByDay = new Map<string, number>();
  const dealsByDay = new Map<string, number>();
  for (let i = trendDays - 1; i >= 0; i--) {
    const d = fmtDate(new Date(now.getTime() - i * 864e5));
    spendByDay.set(d, 0);
    leadsByDay.set(d, 0);
    dealsByDay.set(d, 0);
  }

  const [{ data: dailyMetrics }, { data: priorMetrics }, { data: sourceRows }] = await Promise.all([
    sb
      .from("campaign_metrics")
      .select("date, spend, leads")
      .gte("date", fmtDate(startCurrent))
      .lt("date", fmtDate(endCurrent)),
    sb
      .from("campaign_metrics")
      .select("date, spend, leads")
      .gte("date", fmtDate(startPrior))
      .lt("date", fmtDate(endPrior)),
    sb
      .from("lead_sources")
      .select("source_type, captured_at")
      .gte("captured_at", startCurrent.toISOString())
      .lt("captured_at", endCurrent.toISOString()),
  ]);

  const leadsBySource = buildLeadsBySource(
    (sourceRows ?? []) as unknown as { source_type: string }[],
  );

  const dailyRows = (dailyMetrics ?? []) as unknown as Array<{
    date: string;
    spend: number | null;
    leads: number | null;
  }>;
  for (const row of dailyRows) {
    if (spendByDay.has(row.date)) {
      spendByDay.set(row.date, (spendByDay.get(row.date) ?? 0) + Number(row.spend ?? 0));
      leadsByDay.set(row.date, (leadsByDay.get(row.date) ?? 0) + Number(row.leads ?? 0));
    }
  }
  for (const d of stats.won) {
    if (!d.closed_at) continue;
    const key = fmtDate(new Date(d.closed_at));
    if (dealsByDay.has(key)) {
      dealsByDay.set(key, (dealsByDay.get(key) ?? 0) + 1);
    }
  }

  const spendTrend = [...spendByDay.values()];
  const leadsTrend = [...leadsByDay.values()];
  const dealsTrend = [...dealsByDay.values()];

  const totalSpend = dailyRows.reduce((a, r) => a + Number(r.spend ?? 0), 0);
  const totalLeads = dailyRows.reduce((a, r) => a + Number(r.leads ?? 0), 0);
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

  const priorRows = (priorMetrics ?? []) as unknown as Array<{
    spend: number | null;
    leads: number | null;
  }>;
  const priorSpend = priorRows.reduce((a, r) => a + Number(r.spend ?? 0), 0);
  const priorLeads = priorRows.reduce((a, r) => a + Number(r.leads ?? 0), 0);

  const wonCurrent = stats.won.filter(
    (d) =>
      d.closed_at &&
      new Date(d.closed_at) >= startCurrent &&
      new Date(d.closed_at) < endCurrent,
  );
  const wonPrior = stats.won.filter(
    (d) =>
      d.closed_at &&
      new Date(d.closed_at) >= startPrior &&
      new Date(d.closed_at) < endPrior,
  );
  const wonCurrentTotal = wonCurrent.reduce((a, d) => a + Number(d.value || 0), 0);
  const wonPriorTotal = wonPrior.reduce((a, d) => a + Number(d.value || 0), 0);

  const avgRoas = totalSpend > 0 ? wonCurrentTotal / totalSpend : 0;
  const priorRoas = priorSpend > 0 ? wonPriorTotal / priorSpend : 0;

  const mrr = wonCurrentTotal / 12;
  const mrrPrior = wonPriorTotal / 12;

  const pctChange = (current: number, prior: number): number => {
    if (prior === 0) return current > 0 ? 100 : 0;
    return ((current - prior) / prior) * 100;
  };

  const spendDelta = pctChange(totalSpend, priorSpend);
  const leadsDelta = pctChange(totalLeads, priorLeads);
  const cplDelta = pctChange(
    totalLeads > 0 ? totalSpend / totalLeads : 0,
    priorLeads > 0 ? priorSpend / priorLeads : 0,
  );
  const roasDelta = pctChange(avgRoas, priorRoas);
  const mrrDelta = pctChange(mrr, mrrPrior);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Visao geral"
        title={`${greet()}, ${(session.profile.name ?? session.profile.email).split(" ")[0]}`}
        description={`Resumo de marketing + vendas · ${periodLabel.toLowerCase()}.`}
        actions={
          <>
            <div className="flex gap-1 rounded-pill border border-[color:var(--line-2)] p-0.5">
              {PERIOD_OPTIONS.map((p) => (
                <Link
                  key={p.key}
                  href={p.key === "30d" ? "/dashboard" : `/dashboard?period=${p.key}`}
                  className={`rounded-pill px-3 py-1 text-xs font-medium transition-colors ${
                    period === p.key
                      ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                      : "text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
                  }`}
                >
                  {p.key === "this_month"
                    ? "Mes"
                    : p.key === "last_month"
                      ? "Mes -1"
                      : p.key}
                </Link>
              ))}
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/pipeline">
                <Plus className="mr-1 h-4 w-4" /> Novo negocio
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/atividades">
                <CheckSquare className="mr-1 h-4 w-4" /> Nova atividade
              </Link>
            </Button>
            <DashboardExportButton
              kpis={{
                periodLabel,
                totalSpend,
                totalLeads,
                avgCpl,
                avgRoas,
                pipelineTotal: stats.pipelineTotal,
                pipelineCount: stats.open.length,
                mrr,
                wonCount: wonCurrent.length,
                wonTotal: wonCurrentTotal,
                spendDelta,
                leadsDelta,
                cplDelta,
                roasDelta,
                mrrDelta,
              }}
              topCampaigns={top.map((c) => ({
                name: c.name,
                spend: c.spend,
                leads: c.leads,
                roas: c.roas,
              }))}
              funnel={[
                { label: "Impressoes", count: funnel.impressions },
                { label: "Cliques", count: funnel.clicks },
                { label: "Leads", count: funnel.leads },
                { label: "Oportunidades", count: funnel.opportunities },
                { label: "Reunioes", count: funnel.meetings },
                { label: "Vendas", count: funnel.sales },
              ]}
              sources={leadsBySource.map((s) => ({ label: s.label, count: s.count }))}
            />
            <Button asChild variant="outline" size="sm">
              <Link href="/relatorios">
                <FileBarChart className="mr-1 h-4 w-4" /> Relatorios
              </Link>
            </Button>
            <Button size="sm">
              <Sparkles className="mr-1 h-4 w-4" /> Pergunte a IA
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Investimento em midia"
          value={formatBRL(totalSpend)}
          hint={`${campaigns.filter((c) => c.status === "active").length} campanhas ativas`}
          delta={{ value: spendDelta, label: "vs. periodo anterior" }}
          icon={<DollarSign className="h-3.5 w-3.5" />}
        />
        <MetricCard
          label="Leads gerados"
          value={totalLeads.toLocaleString("pt-BR")}
          hint={`CPL medio ${formatBRL(avgCpl)} (${cplDelta >= 0 ? "+" : ""}${cplDelta.toFixed(1)}%)`}
          delta={{ value: leadsDelta }}
          icon={<Users className="h-3.5 w-3.5" />}
          emphasis="inverse"
        />
        <MetricCard
          label="ROAS medio"
          value={`${avgRoas.toFixed(1)}x`}
          hint="receita ganha / investimento"
          delta={{ value: roasDelta }}
          icon={<TrendingUp className="h-3.5 w-3.5" />}
        />
        <MetricCard
          label="Pipeline aberto"
          value={formatBRL(stats.pipelineTotal)}
          hint={`${stats.open.length} negocios em aberto`}
          icon={<Target className="h-3.5 w-3.5" />}
        />
        <MetricCard
          label="MRR estimado"
          value={formatBRL(mrr)}
          hint={`${wonCurrent.length} vendas no periodo`}
          delta={{ value: mrrDelta }}
        />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <WidgetCard
          kicker="Performance"
          title="Leads por dia"
          description={`Ultimos ${trendDays} dias`}
          action={{ label: "Detalhes", href: "/analytics" }}
        >
          <div className="mb-3"><Sparkline data={leadsTrend.length ? leadsTrend : [0]} height={80} showArea /></div>
          <div className="flex justify-between text-xs text-[color:var(--ink-3)]">
            <span>{new Date(now.getTime() - 13 * 864e5).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
            <span>hoje</span>
          </div>
        </WidgetCard>

        <WidgetCard
          kicker="Midia paga"
          title="Investimento diario"
          action={{ label: "Campanhas", href: "/campanhas" }}
        >
          <div className="mb-3"><MiniBars data={spendTrend.length ? spendTrend : [0]} height={80} color="var(--ink)" /></div>
          <div className="flex justify-between text-xs text-[color:var(--ink-3)]">
            <span>media {formatBRL(spendTrend.reduce((a, b) => a + b, 0) / Math.max(spendTrend.length, 1))}/dia</span>
            <span>pico {formatBRL(Math.max(...spendTrend, 0))}</span>
          </div>
        </WidgetCard>

        <WidgetCard
          kicker="Vendas"
          title="Negocios fechados"
          description={`Ultimos ${trendDays} dias`}
          action={{ label: "Pipeline", href: "/pipeline" }}
        >
          <div className="mb-3"><Sparkline data={dealsTrend.length ? dealsTrend : [0]} height={80} color="var(--good)" /></div>
          <div className="flex justify-between text-xs text-[color:var(--ink-3)]">
            <span>{wonCurrent.length} vendas no periodo</span>
            <span>
              ticket medio{" "}
              {formatBRL(wonCurrent.length > 0 ? wonCurrentTotal / wonCurrent.length : 0)}
            </span>
          </div>
        </WidgetCard>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <WidgetCard
          kicker="Funil unificado"
          title="Impressao → Venda"
          description={`Marketing + vendas · ${periodLabel.toLowerCase()}`}
          className="lg:col-span-2"
        >
          <DashboardFunnel funnel={funnel} />
        </WidgetCard>

        <WidgetCard
          kicker="Origem"
          title="Leads por origem"
          description={periodLabel}
        >
          <LeadsBySourceChart data={leadsBySource} />
        </WidgetCard>
      </section>

      <section className="mt-8">
        <WidgetCard
          kicker="IA"
          title="Sugestoes do Otimizador"
          description={`${pendingSuggestions.length} pendentes`}
          action={{ label: "Ver todas", href: "/campanhas/otimizador" }}
        >
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {pendingSuggestions.slice(0, 3).map((s) => {
              const det = s.details as Record<string, unknown>;
              const label = String(det?.rationale ?? det?.target ?? det?.reason ?? "");
              return (
                <li key={s.id} className="rounded-lg border border-[color:var(--line)] bg-[color:var(--bg)] p-3">
                  <div className="text-xs font-medium capitalize">{s.action.replace(/_/g, " ")}</div>
                  {label && <p className="mt-1 text-xs text-[color:var(--ink-2)] line-clamp-2">{label}</p>}
                </li>
              );
            })}
            {pendingSuggestions.length === 0 && (
              <li className="text-sm text-[color:var(--ink-3)] sm:col-span-3">
                Nada pendente no momento.
              </li>
            )}
          </ul>
        </WidgetCard>
      </section>

      <section className="mt-8">
        <WidgetCard
          kicker="CRM"
          title="Pipeline em tempo real"
          description="Negocios abertos por estagio"
          action={{ label: "Abrir kanban", href: "/pipeline" }}
        >
          <DashboardPipelineSnapshot deals={stats.open} workspaceId={session.workspaceId} />
        </WidgetCard>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WidgetCard
          kicker="Trafego pago"
          title="Top campanhas por ROAS"
          action={{ label: "Ver todas", href: "/campanhas" }}
          padding="none"
        >
          <div className="px-5 py-1">
            <DashboardTopCampaigns campaigns={top} />
          </div>
        </WidgetCard>

        <WidgetCard
          kicker="Hoje"
          title="Minhas atividades"
          description="Tarefas + reunioes + follow-ups"
          action={{ label: "Agenda", href: "/atividades" }}
        >
          <DashboardActivitiesToday activities={activities} />
        </WidgetCard>
      </section>
    </div>
  );
}
