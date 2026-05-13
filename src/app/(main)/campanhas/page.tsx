import Link from "next/link";
import { Filter, Plus, Search, Sparkles, Plug } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { WidgetCard } from "@/components/shared/widget-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession } from "@/lib/auth/guards";
import { campaignsWithMetrics } from "@/lib/queries/marketing";

export const metadata = { title: "Campanhas · AdSales Hub" };

const STATUS_LABELS = {
  draft: { label: "Rascunho", tone: "neutral" },
  active: { label: "Ativa", tone: "good" },
  paused: { label: "Pausada", tone: "warn" },
  ended: { label: "Encerrada", tone: "neutral" },
  archived: { label: "Arquivada", tone: "neutral" },
} as const;

const OBJECTIVE_LABELS: Record<string, string> = {
  lead_gen: "Captura de Leads",
  traffic: "Trafego",
  conversions: "Conversoes",
  engagement: "Engajamento",
  awareness: "Reconhecimento",
  sales: "Vendas",
  app_promotion: "App",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default async function CampaignsHubPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; objective?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  const sb = session.supabase;
  const campaigns = await campaignsWithMetrics(sb, session.workspaceId);

  const { data: adAccountsRaw } = await sb
    .from("ad_accounts")
    .select("id, name, status")
    .eq("workspace_id", session.workspaceId)
    .eq("provider", "meta")
    .eq("status", "active")
    .limit(1);
  const hasMetaConnected = (adAccountsRaw ?? []).length > 0;

  const now = new Date();
  const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
  const startCurrent = new Date(now.getTime() - 30 * 864e5);
  const startPrior = new Date(now.getTime() - 60 * 864e5);

  const [{ data: currentRows }, { data: priorRows }] = await Promise.all([
    sb
      .from("campaign_metrics")
      .select("spend, leads, revenue")
      .gte("date", fmtDate(startCurrent)),
    sb
      .from("campaign_metrics")
      .select("spend, leads, revenue")
      .gte("date", fmtDate(startPrior))
      .lt("date", fmtDate(startCurrent)),
  ]);

  const sumRows = (rows: { spend: number | null; leads: number | null; revenue: number | null }[] | null) => ({
    spend: (rows ?? []).reduce((a, r) => a + Number(r.spend ?? 0), 0),
    leads: (rows ?? []).reduce((a, r) => a + Number(r.leads ?? 0), 0),
    revenue: (rows ?? []).reduce((a, r) => a + Number(r.revenue ?? 0), 0),
  });

  const cur = sumRows(currentRows as never);
  const prior = sumRows(priorRows as never);

  const totalSpend = cur.spend;
  const totalLeads = cur.leads;
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const avgRoas = totalSpend > 0 ? cur.revenue / totalSpend : 0;
  const priorRoas = prior.spend > 0 ? prior.revenue / prior.spend : 0;
  const priorCpl = prior.leads > 0 ? prior.spend / prior.leads : 0;

  const pct = (c: number, p: number) => (p === 0 ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100);
  const spendDelta = pct(totalSpend, prior.spend);
  const leadsDelta = pct(totalLeads, prior.leads);
  const cplDelta = pct(avgCpl, priorCpl);
  const roasDelta = pct(avgRoas, priorRoas);

  const search = (sp.q ?? "").toLowerCase();
  const statusFilter = sp.status ?? "";
  const objectiveFilter = sp.objective ?? "";
  const filteredCampaigns = campaigns.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search)) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    if (objectiveFilter && c.objective !== objectiveFilter) return false;
    return true;
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Bloco B · Trafego pago"
        title="Hub de campanhas"
        description={`${campaigns.length} campanhas · ${campaigns.filter((c) => c.status === "active").length} ativas`}
        actions={
          <Button asChild size="sm">
            <Link href="/campanhas/nova">
              <Sparkles className="mr-1 h-4 w-4" /> Nova com IA
            </Link>
          </Button>
        }
      />

      {!hasMetaConnected && (
        <WidgetCard
          kicker="Comece aqui"
          title="Conecte sua conta de anuncio Meta"
          description="Sem isso, nada de campanhas reais. So leva 30 segundos via Facebook Login."
          className="mb-6 border-[color:var(--accent)]/30 bg-[color:var(--accent)]/5"
        >
          <Button asChild size="lg" className="bg-[#1877F2] text-white hover:bg-[#1564d3]">
            <Link href="/configuracoes/meta-ads">
              <Plug className="mr-2 h-4 w-4" /> Conectar com Facebook
            </Link>
          </Button>
        </WidgetCard>
      )}

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          label="Campanhas ativas"
          value={String(campaigns.filter((c) => c.status === "active").length)}
        />
        <MetricCard
          label="Investimento 30d"
          value={formatBRL(totalSpend)}
          emphasis="inverse"
          delta={{ value: spendDelta, label: "vs. 30d anteriores" }}
        />
        <MetricCard
          label="Leads"
          value={totalLeads.toLocaleString("pt-BR")}
          hint={`CPL medio ${formatBRL(avgCpl)} (${cplDelta >= 0 ? "+" : ""}${cplDelta.toFixed(1)}%)`}
          delta={{ value: leadsDelta }}
        />
        <MetricCard
          label="ROAS medio"
          value={`${avgRoas.toFixed(1)}x`}
          delta={{ value: roasDelta }}
        />
      </section>

      <form className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--ink-4)]" />
          <Input
            name="q"
            className="pl-9"
            placeholder="Buscar campanha..."
            defaultValue={sp.q ?? ""}
          />
        </div>
        <select
          name="status"
          defaultValue={statusFilter}
          className="h-9 rounded-pill border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 text-xs"
        >
          <option value="">Todos status</option>
          {(["draft", "active", "paused", "ended", "archived"] as const).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s].label}
            </option>
          ))}
        </select>
        <select
          name="objective"
          defaultValue={objectiveFilter}
          className="h-9 rounded-pill border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 text-xs"
        >
          <option value="">Todos objetivos</option>
          {Object.entries(OBJECTIVE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <Button variant="outline" size="sm" type="submit">
          <Filter className="mr-1 h-4 w-4" /> Filtrar
        </Button>
        {(sp.q || statusFilter || objectiveFilter) && (
          <Link
            href="/campanhas"
            className="text-xs text-[color:var(--ink-3)] underline-offset-2 hover:text-[color:var(--ink)] hover:underline"
          >
            Limpar
          </Link>
        )}
      </form>

      {campaigns.length === 0 ? (
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-10 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-[color:var(--accent)]" />
          <h3 className="mt-4 text-lg font-medium">Comece com a IA</h3>
          <p className="mt-2 text-sm text-[color:var(--ink-3)]">
            Escreva um briefing e a IA monta campanha, publico, copy e lead form em 2 minutos.
          </p>
          <Button asChild className="mt-6">
            <Link href="/campanhas/nova"><Sparkles className="mr-1 h-4 w-4" /> Criar primeira campanha</Link>
          </Button>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="rounded-card border border-dashed border-[color:var(--line-2)] bg-[color:var(--panel)] p-10 text-center text-sm text-[color:var(--ink-3)]">
          Nenhuma campanha bate com esses filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredCampaigns.map((c) => {
            const meta = STATUS_LABELS[c.status] ?? STATUS_LABELS.draft;
            return (
              <Link
                key={c.id}
                href={`/campanhas/${c.id}`}
                className="group grid grid-cols-12 items-center gap-4 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4 transition-colors hover:border-[color:var(--line-3)]"
              >
                <div className="col-span-12 md:col-span-4">
                  <StatusBadge label={meta.label} tone={meta.tone} />
                  <h3 className="mt-2 text-base font-medium">{c.name}</h3>
                  <p className="mt-0.5 text-xs text-[color:var(--ink-3)]">
                    {OBJECTIVE_LABELS[c.objective] ?? c.objective} · {c.ad_sets_count} adsets · {c.ads_count} ads
                  </p>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <div className="text-[10px] uppercase tracking-kicker text-[color:var(--ink-4)]">Investido</div>
                  <div className="font-mono text-sm font-medium">{formatBRL(c.spend)}</div>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <div className="text-[10px] uppercase tracking-kicker text-[color:var(--ink-4)]">Leads · CPL</div>
                  <div className="text-sm font-medium">{c.leads}</div>
                  <div className="text-[10px] text-[color:var(--ink-4)]">CPL {formatBRL(c.cpl)}</div>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <div className="text-[10px] uppercase tracking-kicker text-[color:var(--ink-4)]">ROAS</div>
                  <div className="text-sm font-medium">{c.roas.toFixed(1)}x</div>
                  <div className="text-[10px] text-[color:var(--ink-4)]">CTR {c.ctr.toFixed(2)}%</div>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <div className="text-[10px] uppercase tracking-kicker text-[color:var(--ink-4)]">Freq</div>
                  <div className="text-sm font-medium">{c.frequency.toFixed(2)}x</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
