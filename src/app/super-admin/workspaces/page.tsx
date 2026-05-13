import Link from "next/link";
import { listWorkspaces } from "@/lib/queries/super-admin";
import { StatusBadge } from "@/components/shared/status-badge";
import { WorkspaceRowActions } from "@/components/super-admin/workspace-row-actions";

export const metadata = { title: "Super Admin · Workspaces" };

export default async function SuperAdminWorkspaces() {
  const rows = await listWorkspaces();

  return (
    <div className="space-y-6">
      <div>
        <span className="kicker">Workspaces</span>
        <h1 className="mt-2 text-2xl font-medium tracking-tighter2">
          {rows.length} workspaces
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--ink-3)]">
          Conceda creditos, ative plano master e inspecione o saldo de cada workspace.
        </p>
      </div>

      <div className="overflow-x-auto rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Workspace</th>
              <th className="px-4 py-3 text-left font-medium">Plano</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Usuarios</th>
              <th className="px-4 py-3 text-right font-medium">Creditos</th>
              <th className="px-4 py-3 text-right font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => {
              const tone =
                w.subscription_status === "active"
                  ? "good"
                  : w.subscription_status === "trialing"
                    ? "accent"
                    : w.subscription_status === "past_due"
                      ? "warn"
                      : "neutral";
              return (
                <tr key={w.id} className="border-b border-[color:var(--line)] last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/super-admin/workspaces/${w.id}`}
                      className="font-medium hover:text-[color:var(--accent)] hover:underline"
                    >
                      {w.name}
                    </Link>
                    <div className="text-[11px] text-[color:var(--ink-4)]">{w.slug}</div>
                    <div className="font-mono text-[10px] text-[color:var(--ink-4)]">
                      {w.id.slice(0, 8)}…
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {w.basket_name ? (
                      <span
                        className={`rounded-pill border px-2 py-0.5 text-[11px] uppercase ${
                          w.basket_name === "master"
                            ? "border-[color:var(--bad)]/40 bg-[color:var(--bad)]/10 text-[color:var(--bad)]"
                            : "border-[color:var(--line-2)] text-[color:var(--ink-3)]"
                        }`}
                      >
                        {w.basket_name}
                      </span>
                    ) : (
                      <span className="text-[color:var(--ink-4)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {w.subscription_status ? (
                      <StatusBadge label={w.subscription_status} tone={tone} />
                    ) : (
                      <span className="text-[color:var(--ink-4)]">sem assinatura</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{w.user_count}</td>
                  <td className="px-4 py-3 text-right">
                    {w.credits_unlimited ? (
                      <span className="rounded-pill border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 px-2 py-0.5 text-[11px] text-[color:var(--accent)]">
                        ilimitado
                      </span>
                    ) : (
                      <div className="font-mono">
                        {w.credits_balance}
                        {w.credits_monthly_allowance > 0 && (
                          <span className="ml-1 text-[10px] text-[color:var(--ink-4)]">
                            (+{w.credits_monthly_allowance}/mes)
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <WorkspaceRowActions
                      workspaceId={w.id}
                      currentBasket={w.basket_name}
                      unlimited={w.credits_unlimited}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
