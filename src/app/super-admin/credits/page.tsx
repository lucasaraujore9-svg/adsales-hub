import { listRecentPurchases } from "@/lib/queries/super-admin";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata = { title: "Super Admin · Creditos" };

const fmtBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_TONE: Record<string, "good" | "warn" | "bad" | "accent" | "neutral"> = {
  paid: "good",
  pending: "warn",
  cancelled: "neutral",
  expired: "neutral",
  refunded: "warn",
  failed: "bad",
};

export default async function SuperAdminCreditsPage() {
  const rows = await listRecentPurchases(80);

  return (
    <div className="space-y-6">
      <div>
        <span className="kicker">Creditos</span>
        <h1 className="mt-2 text-2xl font-medium tracking-tighter2">Compras recentes</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--ink-3)]">
          Pagamentos via Asaas, Mercado Pago e concessoes manuais. Para conceder creditos a um
          workspace especifico, va em <span className="font-mono">Workspaces</span> → botao
          “+ creditos”.
        </p>
      </div>

      <div className="overflow-x-auto rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Workspace</th>
              <th className="px-4 py-3 text-left font-medium">Pacote</th>
              <th className="px-4 py-3 text-right font-medium">Creditos</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
              <th className="px-4 py-3 text-left font-medium">Gateway</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Quando</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-[color:var(--ink-3)]"
                >
                  Nenhuma compra registrada.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-[color:var(--line)] last:border-0">
                <td className="px-4 py-3">
                  <div>{r.workspace_name ?? "—"}</div>
                  <div className="font-mono text-[10px] text-[color:var(--ink-4)]">
                    {r.workspace_id.slice(0, 8)}…
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{r.pack_id}</td>
                <td className="px-4 py-3 text-right font-mono">{r.credits}</td>
                <td className="px-4 py-3 text-right font-mono">{fmtBRL(r.amount_cents)}</td>
                <td className="px-4 py-3 text-xs uppercase">{r.gateway}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={r.status} tone={STATUS_TONE[r.status] ?? "neutral"} />
                </td>
                <td className="px-4 py-3 text-right text-[11px] text-[color:var(--ink-4)]">
                  {new Date(r.created_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
