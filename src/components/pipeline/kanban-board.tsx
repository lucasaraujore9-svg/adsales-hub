"use client";

import Link from "next/link";
import { useTransition, useState, type DragEvent, type MouseEvent } from "react";
import { CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ContactRow, DealRow, StageRow } from "@/lib/queries/crm";
import { moveDealStage } from "@/lib/actions/deals";
import { DealModal } from "@/components/deals/deal-modal";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatRelative(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const days = Math.round((d.getTime() - Date.now()) / 864e5);
  if (Math.abs(days) < 1) return "hoje";
  return days > 0 ? `em ${days}d` : `${Math.abs(days)}d atrás`;
}

interface Props {
  deals: DealRow[];
  stages: StageRow[];
  contacts: ContactRow[];
  pendingByDeal?: Record<string, number>;
  overdueByDeal?: Record<string, number>;
  status?: "open" | "won" | "lost";
}

export function KanbanBoard({
  deals: initialDeals,
  stages,
  contacts,
  pendingByDeal = {},
  overdueByDeal = {},
  status = "open",
}: Props) {
  const [deals, setDeals] = useState(initialDeals);
  const [, startTransition] = useTransition();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [openDealId, setOpenDealId] = useState<string | null>(null);

  const contactById = new Map(contacts.map((c) => [c.id, c]));
  const visibleStages =
    status === "lost"
      ? stages.filter((s) => s.is_lost)
      : status === "won"
        ? stages.filter((s) => s.is_won)
        : stages.filter((s) => !s.is_lost);
  const buckets = visibleStages
    .sort((a, b) => a.position - b.position)
    .map((stage) => ({
      stage,
      items: deals
        .filter((d) => d.status === status && d.stage_id === stage.id)
        .sort((a, b) => b.value - a.value),
    }));

  function handleDrop(stageId: string) {
    if (!draggedId) return;
    const deal = deals.find((d) => d.id === draggedId);
    if (!deal || deal.stage_id === stageId) {
      setDraggedId(null);
      return;
    }

    // Optimistic
    setDeals((prev) =>
      prev.map((d) => (d.id === draggedId ? { ...d, stage_id: stageId } : d)),
    );
    const stage = stages.find((s) => s.id === stageId);
    startTransition(async () => {
      const result = await moveDealStage(draggedId, stageId);
      if (result.ok) {
        toast.success(`Movido para ${stage?.name ?? "novo estagio"}`);
      } else {
        toast.error(`Erro ao mover: ${result.error}`);
        setDeals(initialDeals);
      }
    });
    setDraggedId(null);
  }

  return (
    <div className="-mx-6 overflow-x-auto px-6 pb-4">
      <div className="flex w-max gap-4">
        {buckets.map(({ stage, items }) => (
          <div
            key={stage.id}
            onDragOver={(e: DragEvent) => e.preventDefault()}
            onDrop={() => handleDrop(stage.id)}
            className="flex w-72 shrink-0 flex-col rounded-card border border-[color:var(--line)] bg-[color:var(--bg-2)]"
          >
            <header className="flex items-center justify-between border-b border-[color:var(--line)] px-3 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: stage.color ?? "#6366F1" }}
                />
                <span className="truncate text-sm font-medium">{stage.name}</span>
                <span className="shrink-0 text-xs text-[color:var(--ink-4)]">{items.length}</span>
              </div>
              <span className="font-mono text-xs text-[color:var(--ink-3)]">
                {formatBRL(items.reduce((a, d) => a + Number(d.value || 0), 0))}
              </span>
            </header>
            <div className="flex-1 space-y-2 p-2 min-h-[200px]">
              {items.map((d) => {
                const contact = d.contact_id ? contactById.get(d.contact_id) : null;
                const source = d.source ?? "manual";
                const pending = pendingByDeal[d.id] ?? 0;
                const overdue = overdueByDeal[d.id] ?? 0;
                return (
                  <Link
                    key={d.id}
                    href={`/negocios/${d.id}`}
                    onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                      e.preventDefault();
                      setOpenDealId(d.id);
                    }}
                    draggable={status === "open"}
                    onDragStart={() => status === "open" && setDraggedId(d.id)}
                    onDragEnd={() => setDraggedId(null)}
                    className={`block cursor-pointer rounded-xl border border-[color:var(--line)] bg-[color:var(--panel)] p-3 text-sm transition-all hover:border-[color:var(--line-3)] ${
                      draggedId === d.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2 font-medium">{d.title}</span>
                    </div>
                    <div className="mt-2 font-mono text-base font-medium tracking-tight">
                      {formatBRL(Number(d.value || 0))}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-[color:var(--ink-3)]">
                      <span>{contact?.name ?? "Sem contato"}</span>
                      <span>{formatRelative(d.expected_close_date)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <StatusBadge
                        label={source}
                        tone={source === "meta_ads" ? "accent" : source === "referral" ? "good" : "neutral"}
                      />
                      {pending > 0 && (
                        <span
                          title={`${pending} atividade(s) pendente(s)${overdue > 0 ? ` · ${overdue} atrasada(s)` : ""}`}
                          className={`inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-[10px] font-medium ${
                            overdue > 0
                              ? "border-[color:var(--bad)]/40 bg-[color:var(--bad)]/10 text-[color:var(--bad)]"
                              : "border-[color:var(--line-2)] text-[color:var(--ink-3)]"
                          }`}
                        >
                          <CheckSquare className="h-3 w-3" />
                          {pending}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
              {items.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-[color:var(--ink-4)]">
                  Arraste negocios aqui.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <DealModal dealId={openDealId} onClose={() => setOpenDealId(null)} />
    </div>
  );
}
