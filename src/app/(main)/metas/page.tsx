import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { WidgetCard } from "@/components/shared/widget-card";
import { getSession } from "@/lib/auth/guards";
import { listWorkspaceUsers } from "@/lib/queries/crm";
import { NewGoalButton } from "@/components/sales/new-goal-button";

export const metadata = { title: "Metas · AdSales Hub" };

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

interface GoalRow {
  id: string;
  owner_user_id: string | null;
  scope: string;
  metric: string;
  target: number;
  achieved: number;
  period_type: string;
  period_start: string;
  period_end: string;
}

export default async function GoalsPage() {
  const session = await getSession();
  const sb = session.supabase;

  const [{ data: goalsData }, users] = await Promise.all([
    sb
      .from("goals")
      .select("id, owner_user_id, scope, metric, target, achieved, period_type, period_start, period_end")
      .eq("workspace_id", session.workspaceId)
      .order("period_start", { ascending: false }),
    listWorkspaceUsers(sb, session.workspaceId),
  ]);
  const goals = (goalsData ?? []) as unknown as GoalRow[];

  const workspaceGoals = goals.filter((g) => g.scope === "workspace");
  const userGoals = goals.filter((g) => g.scope === "user");
  const userById = new Map(users.map((u) => [u.id, u]));

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="CRM"
        title="Metas"
        description="Metas individuais + time + marketing (CPL/ROAS/leads)"
        actions={<NewGoalButton users={users} />}
      />

      {workspaceGoals.length > 0 && (
        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {workspaceGoals.map((g) => {
            const pct = g.target > 0 ? (g.achieved / g.target) * 100 : 0;
            const formatValue = (v: number) => {
              if (g.metric === "revenue") return formatBRL(v);
              if (g.metric === "cpl") return `R$ ${v.toFixed(2)}`;
              if (g.metric === "roas") return `${v.toFixed(1)}x`;
              return v.toLocaleString("pt-BR");
            };
            return (
              <MetricCard
                key={g.id}
                label={g.metric.toUpperCase()}
                value={formatValue(Number(g.achieved))}
                hint={`Meta ${formatValue(Number(g.target))} · ${g.period_type}`}
                delta={{ value: pct - 100, label: "da meta" }}
              />
            );
          })}
        </section>
      )}

      <WidgetCard kicker="Time comercial" title="Metas individuais" padding="none">
        <ul className="divide-y divide-[color:var(--line)]">
          {userGoals.map((g) => {
            const pct = Math.min(100, g.target > 0 ? (g.achieved / g.target) * 100 : 0);
            const owner = g.owner_user_id ? userById.get(g.owner_user_id) : null;
            return (
              <li key={g.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent)] text-sm font-medium text-white">
                  {owner ? (owner.name ?? owner.email).slice(0, 2).toUpperCase() : "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{owner?.name ?? owner?.email ?? "—"}</div>
                      <div className="text-xs text-[color:var(--ink-3)]">{g.metric} · {g.period_type}</div>
                    </div>
                    <div className="text-right font-mono text-sm">
                      <div>{formatBRL(Number(g.achieved))}</div>
                      <div className="text-xs text-[color:var(--ink-4)]">de {formatBRL(Number(g.target))}</div>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--bg-2)]">
                    <div
                      className="h-full rounded-full bg-[color:var(--accent)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] text-[color:var(--ink-4)]">{pct.toFixed(0)}% concluido</div>
                </div>
              </li>
            );
          })}
          {userGoals.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
              Nenhuma meta individual cadastrada.
            </li>
          )}
        </ul>
      </WidgetCard>
    </div>
  );
}
