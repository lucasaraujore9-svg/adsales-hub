import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";

export const metadata = { title: "Ligacoes · AdSales Hub" };

interface CallRow {
  id: string;
  direction: string;
  status: string;
  phone_number: string | null;
  duration_seconds: number;
  started_at: string | null;
  deal_id: string | null;
  contact_id: string | null;
  user_id: string | null;
  created_at: string;
}

export default async function CallsPage() {
  const session = await getSession();
  const sb = session.supabase;

  const [{ data: callsRaw }, { data: contactsRaw }] = await Promise.all([
    sb
      .from("calls")
      .select(
        "id, direction, status, phone_number, duration_seconds, started_at, deal_id, contact_id, user_id, created_at",
      )
      .eq("workspace_id", session.workspaceId)
      .order("created_at", { ascending: false })
      .limit(100),
    sb.from("contacts").select("id, name").eq("workspace_id", session.workspaceId),
  ]);
  const calls = (callsRaw ?? []) as unknown as CallRow[];
  const contactById = new Map(((contactsRaw ?? []) as unknown as { id: string; name: string }[]).map((c) => [c.id, c.name]));

  const completed = calls.filter((c) => c.status === "completed").length;
  const totalDuration = calls.reduce((a, c) => a + (c.duration_seconds || 0), 0);
  const avgMin = calls.length > 0 ? totalDuration / 60 / calls.length : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="CRM · Vendas"
        title="Ligacoes"
        description="Historico + gravacao + transcricao."
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Total" value={String(calls.length)} />
        <MetricCard label="Completas" value={String(completed)} />
        <MetricCard label="Duracao media" value={`${avgMin.toFixed(1)}min`} emphasis="inverse" />
        <MetricCard label="Taxa" value={calls.length > 0 ? `${((completed / calls.length) * 100).toFixed(0)}%` : "0%"} />
      </section>

      <WidgetCard kicker="Historico" title="Ultimas ligacoes" padding="none">
        {calls.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhuma ligacao registrada ainda. Quando o SDR IA rodar ou voce registrar via app,
            aparecerao aqui.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Contato</th>
                <th className="px-5 py-3 text-left font-medium">Tipo</th>
                <th className="px-5 py-3 text-right font-medium">Duracao</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line)]">
              {calls.map((c) => {
                const name = c.contact_id ? contactById.get(c.contact_id) ?? c.phone_number : c.phone_number;
                return (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-medium">{name ?? "—"}</td>
                    <td className="px-5 py-3 text-xs text-[color:var(--ink-3)]">{c.direction}</td>
                    <td className="px-5 py-3 text-right font-mono">
                      {Math.floor(c.duration_seconds / 60)}m {c.duration_seconds % 60}s
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge
                        label={c.status}
                        tone={c.status === "completed" ? "good" : c.status === "failed" ? "bad" : "warn"}
                      />
                    </td>
                    <td className="px-5 py-3 text-xs text-[color:var(--ink-3)]">
                      {new Date(c.created_at).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </WidgetCard>
    </div>
  );
}
