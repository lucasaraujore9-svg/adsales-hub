import { getSystemOverview } from "@/lib/queries/super-admin";
import { MetricCard } from "@/components/shared/metric-card";

export const metadata = { title: "Super Admin · Visao geral" };

export default async function SuperAdminOverview() {
  const data = await getSystemOverview();

  return (
    <div className="space-y-8">
      <div>
        <span className="kicker">Sistema</span>
        <h1 className="mt-2 text-3xl font-medium tracking-tighter2">Painel super admin</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--ink-3)]">
          Visao consolidada de workspaces, usuarios, posts agendados e movimentacao de creditos.
          Ajustes sensíveis (creditos manuais, plano master, super admin) ficam nas abas dedicadas.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          Workspaces & usuarios
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="Workspaces" value={String(data.workspaceCount)} emphasis="inverse" />
          <MetricCard label="Usuarios" value={String(data.userCount)} />
          <MetricCard label="Super admins" value={String(data.superAdminCount)} />
          <MetricCard
            label="Workspaces ilimitados"
            value={String(data.unlimitedWorkspaces)}
            hint="creditos sem cobranca"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          Social media
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <MetricCard label="Posts totais" value={String(data.postCount)} />
          <MetricCard label="Publicados" value={String(data.publishedPostCount)} />
          <MetricCard
            label="Agendados"
            value={String(data.scheduledPostCount)}
            hint="rodara no próximo cron"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          Creditos no sistema
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard label="Saldo total" value={data.totalCreditsBalance.toLocaleString("pt-BR")} />
          <MetricCard label="Comprados" value={data.totalCreditsPurchased.toLocaleString("pt-BR")} />
          <MetricCard label="Consumidos" value={data.totalCreditsSpent.toLocaleString("pt-BR")} />
          <MetricCard
            label="Compras pendentes"
            value={String(data.pendingPurchases)}
            hint="aguardando pagamento"
          />
        </div>
      </section>
    </div>
  );
}
