import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth/guards";

export const metadata = { title: "Contratos · AdSales Hub" };

interface ProposalRow {
  id: string;
  title: string;
  status: string;
  total: number;
  validity_date: string | null;
  created_at: string;
}
interface ContractRow {
  id: string;
  title: string;
  status: string;
  created_at: string;
  signed_at: string | null;
}

const STATUS_META: Record<string, { label: string; tone: "good" | "warn" | "bad" | "accent" | "neutral" }> = {
  draft: { label: "Rascunho", tone: "neutral" },
  sent: { label: "Enviada", tone: "accent" },
  viewed: { label: "Visualizada", tone: "warn" },
  accepted: { label: "Aceita", tone: "good" },
  declined: { label: "Recusada", tone: "bad" },
  expired: { label: "Expirada", tone: "neutral" },
  pending_signature: { label: "Aguardando assinatura", tone: "warn" },
  partially_signed: { label: "Parcialmente assinado", tone: "warn" },
  signed: { label: "Assinado", tone: "good" },
  canceled: { label: "Cancelado", tone: "neutral" },
};

export default async function ContractsPage() {
  const session = await getSession();
  const sb = session.supabase;

  const [{ data: proposalsRaw }, { data: contractsRaw }] = await Promise.all([
    sb
      .from("proposals")
      .select("id, title, status, total, validity_date, created_at")
      .eq("workspace_id", session.workspaceId)
      .order("created_at", { ascending: false })
      .limit(20),
    sb
      .from("contracts")
      .select("id, title, status, created_at, signed_at")
      .eq("workspace_id", session.workspaceId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const proposals = (proposalsRaw ?? []) as unknown as ProposalRow[];
  const contracts = (contractsRaw ?? []) as unknown as ContractRow[];

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Bloco F"
        title="Contratos e assinatura eletronica"
        description="Propostas, contratos com variaveis, e-signature com auditoria"
        actions={<Button size="sm"><Plus className="mr-1 h-4 w-4" /> Nova proposta</Button>}
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Propostas" value={String(proposals.length)} />
        <MetricCard label="Aceitas" value={String(proposals.filter((p) => p.status === "accepted").length)} emphasis="inverse" />
        <MetricCard label="Contratos" value={String(contracts.length)} />
        <MetricCard label="Assinados" value={String(contracts.filter((c) => c.status === "signed").length)} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WidgetCard kicker="Propostas" title="Ultimas" padding="none">
          {proposals.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
              Nenhuma proposta ainda.
            </p>
          ) : (
            <ul className="divide-y divide-[color:var(--line)]">
              {proposals.map((p) => {
                const meta = STATUS_META[p.status] ?? STATUS_META.draft;
                return (
                  <li key={p.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{p.title}</span>
                        <StatusBadge label={meta.label} tone={meta.tone} />
                      </div>
                      <div className="mt-0.5 text-xs text-[color:var(--ink-3)]">
                        R$ {Number(p.total).toLocaleString("pt-BR")} ·{" "}
                        {new Date(p.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </WidgetCard>

        <WidgetCard kicker="Contratos" title="Ultimos" padding="none">
          {contracts.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
              Nenhum contrato ainda.
            </p>
          ) : (
            <ul className="divide-y divide-[color:var(--line)]">
              {contracts.map((c) => {
                const meta = STATUS_META[c.status] ?? STATUS_META.draft;
                return (
                  <li key={c.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{c.title}</span>
                        <StatusBadge label={meta.label} tone={meta.tone} />
                      </div>
                      <div className="mt-0.5 text-xs text-[color:var(--ink-3)]">
                        {new Date(c.created_at).toLocaleDateString("pt-BR")}
                        {c.signed_at ? ` · assinado ${new Date(c.signed_at).toLocaleDateString("pt-BR")}` : ""}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </WidgetCard>
      </div>
    </div>
  );
}
