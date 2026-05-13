import Link from "next/link";
import { Kanban, List } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/guards";
import {
  listDeals,
  listContacts,
  listPipelinesAndStages,
  listActivities,
} from "@/lib/queries/crm";
import { KanbanBoard } from "@/components/pipeline/kanban-board";
import { DealsTable } from "@/components/pipeline/deals-table";
import { NewDealButton } from "@/components/pipeline/new-deal-button";
import { PipelineExportButton } from "@/components/pipeline/export-button";

export const metadata = { title: "Pipeline · AdSales Hub" };

type StatusFilter = "open" | "won" | "lost";
type ViewMode = "kanban" | "lista";

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "open", label: "Ativos" },
  { key: "won", label: "Ganhos" },
  { key: "lost", label: "Perdidos" },
];

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ pipeline?: string; status?: StatusFilter; view?: ViewMode }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  const sb = session.supabase;

  const [deals, contacts, { pipelines, stages }, activities] = await Promise.all([
    listDeals(sb, session.workspaceId),
    listContacts(sb, session.workspaceId),
    listPipelinesAndStages(sb, session.workspaceId),
    listActivities(sb, session.workspaceId, { limit: 1000 }),
  ]);

  const selectedPipeline =
    pipelines.find((p) => p.id === sp.pipeline) ??
    pipelines.find((p) => p.is_default) ??
    pipelines[0];

  const status: StatusFilter = sp.status ?? "open";
  const view: ViewMode = sp.view === "lista" ? "lista" : "kanban";

  const pipelineStages = selectedPipeline
    ? stages.filter((s) => s.pipeline_id === selectedPipeline.id)
    : [];

  const pipelineDeals = selectedPipeline
    ? deals.filter((d) => d.pipeline_id === selectedPipeline.id && d.status === status)
    : [];

  const pendingByDeal = new Map<string, number>();
  const overdueByDeal = new Map<string, number>();
  const nowMs = Date.now();
  for (const a of activities) {
    if (a.completed || !a.deal_id) continue;
    pendingByDeal.set(a.deal_id, (pendingByDeal.get(a.deal_id) ?? 0) + 1);
    if (a.due_date && new Date(a.due_date).getTime() < nowMs) {
      overdueByDeal.set(a.deal_id, (overdueByDeal.get(a.deal_id) ?? 0) + 1);
    }
  }

  const counts: Record<StatusFilter, number> = selectedPipeline
    ? {
        open: deals.filter(
          (d) => d.pipeline_id === selectedPipeline.id && d.status === "open",
        ).length,
        won: deals.filter(
          (d) => d.pipeline_id === selectedPipeline.id && d.status === "won",
        ).length,
        lost: deals.filter(
          (d) => d.pipeline_id === selectedPipeline.id && d.status === "lost",
        ).length,
      }
    : { open: 0, won: 0, lost: 0 };

  function buildHref(
    patch: Partial<{ pipeline: string; status: StatusFilter; view: ViewMode }>,
  ) {
    const params = new URLSearchParams();
    const p = patch.pipeline ?? selectedPipeline?.id;
    if (p) params.set("pipeline", p);
    const s = patch.status ?? status;
    if (s !== "open") params.set("status", s);
    const v = patch.view ?? view;
    if (v !== "kanban") params.set("view", v);
    const q = params.toString();
    return q ? `/pipeline?${q}` : "/pipeline";
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] px-6 py-8">
      <PageHeader
        kicker="CRM"
        title="Pipeline"
        description={`${counts.open} ativos · ${counts.won} ganhos · ${counts.lost} perdidos`}
        actions={
          selectedPipeline && (
            <>
              <PipelineExportButton
                deals={pipelineDeals}
                stages={pipelineStages}
                contacts={contacts}
                pipelineName={selectedPipeline.name}
                status={status}
              />
              <NewDealButton
                pipelineId={selectedPipeline.id}
                stages={pipelineStages}
                contacts={contacts}
              />
            </>
          )
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {pipelines.map((p) => (
            <Link
              key={p.id}
              href={buildHref({ pipeline: p.id })}
              className={`rounded-pill border px-3 py-1 text-xs font-medium ${
                selectedPipeline?.id === p.id
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                  : "border-[color:var(--line-2)] text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
              }`}
            >
              {p.name}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex gap-1 rounded-pill border border-[color:var(--line-2)] p-0.5">
            {STATUS_TABS.map((t) => (
              <Link
                key={t.key}
                href={buildHref({ status: t.key })}
                className={`rounded-pill px-3 py-1 text-xs font-medium transition-colors ${
                  status === t.key
                    ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                    : "text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
                }`}
              >
                {t.label} ({counts[t.key]})
              </Link>
            ))}
          </div>

          <div className="flex gap-1 rounded-pill border border-[color:var(--line-2)] p-0.5">
            <Link
              href={buildHref({ view: "kanban" })}
              className={`flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-medium transition-colors ${
                view === "kanban"
                  ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                  : "text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
              }`}
              aria-label="Visao Kanban"
            >
              <Kanban className="h-3 w-3" /> Kanban
            </Link>
            <Link
              href={buildHref({ view: "lista" })}
              className={`flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-medium transition-colors ${
                view === "lista"
                  ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                  : "text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
              }`}
              aria-label="Visao Lista"
            >
              <List className="h-3 w-3" /> Lista
            </Link>
          </div>
        </div>
      </div>

      {selectedPipeline ? (
        view === "kanban" ? (
          <KanbanBoard
            deals={pipelineDeals}
            stages={pipelineStages}
            contacts={contacts}
            pendingByDeal={Object.fromEntries(pendingByDeal)}
            overdueByDeal={Object.fromEntries(overdueByDeal)}
            status={status}
          />
        ) : (
          <DealsTable
            deals={pipelineDeals}
            stages={pipelineStages}
            contacts={contacts}
            pendingByDeal={Object.fromEntries(pendingByDeal)}
            overdueByDeal={Object.fromEntries(overdueByDeal)}
          />
        )
      ) : (
        <p className="text-sm text-[color:var(--ink-3)]">Nenhum pipeline criado ainda.</p>
      )}
    </div>
  );
}
