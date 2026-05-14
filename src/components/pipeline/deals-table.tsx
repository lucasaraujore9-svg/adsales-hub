"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { CheckSquare } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import type { ContactRow, DealRow, StageRow } from "@/lib/queries/crm";
import { DealModal } from "@/components/deals/deal-modal";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
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
}

type SortKey = "title" | "value" | "stage" | "expected_close" | "created";

export function DealsTable({
  deals,
  stages,
  contacts,
  pendingByDeal = {},
  overdueByDeal = {},
}: Props) {
  const [openDealId, setOpenDealId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("value");
  const [sortDesc, setSortDesc] = useState(true);

  const stageById = new Map(stages.map((s) => [s.id, s]));
  const contactById = new Map(contacts.map((c) => [c.id, c]));

  const sorted = [...deals].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "title":
        cmp = a.title.localeCompare(b.title);
        break;
      case "value":
        cmp = Number(a.value || 0) - Number(b.value || 0);
        break;
      case "stage": {
        const sa = stageById.get(a.stage_id);
        const sb = stageById.get(b.stage_id);
        cmp = (sa?.position ?? 0) - (sb?.position ?? 0);
        break;
      }
      case "expected_close": {
        const ta = a.expected_close_date ? new Date(a.expected_close_date).getTime() : Infinity;
        const tb = b.expected_close_date ? new Date(b.expected_close_date).getTime() : Infinity;
        cmp = ta - tb;
        break;
      }
      case "created":
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    return sortDesc ? -cmp : cmp;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDesc((v) => !v);
    else {
      setSortKey(key);
      setSortDesc(key === "value" || key === "created");
    }
  }

  const total = sorted.reduce((a, d) => a + Number(d.value || 0), 0);

  return (
    <>
      <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
              <tr>
                {[
                  { key: "title" as SortKey, label: "Negocio" },
                  { key: "stage" as SortKey, label: "Estagio" },
                  { key: "value" as SortKey, label: "Valor" },
                  { key: "expected_close" as SortKey, label: "Fechamento" },
                  { key: "created" as SortKey, label: "Criado" },
                ].map((c) => (
                  <th
                    key={c.key}
                    className="cursor-pointer px-4 py-3 text-left font-medium hover:text-[color:var(--ink)]"
                    onClick={() => toggleSort(c.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.label}
                      {sortKey === c.key && <span>{sortDesc ? "↓" : "↑"}</span>}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-medium">Origem</th>
                <th className="px-4 py-3 text-left font-medium">Atividades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line)]">
              {sorted.map((d) => {
                const stage = stageById.get(d.stage_id);
                const contact = d.contact_id ? contactById.get(d.contact_id) : null;
                const source = d.source ?? "manual";
                const pending = pendingByDeal[d.id] ?? 0;
                const overdue = overdueByDeal[d.id] ?? 0;
                return (
                  <tr key={d.id} className="hover:bg-[color:var(--bg-2)]/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/negocios/${d.id}`}
                        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                          e.preventDefault();
                          setOpenDealId(d.id);
                        }}
                        className="font-medium hover:text-[color:var(--accent)]"
                      >
                        {d.title}
                      </Link>
                      <div className="text-xs text-[color:var(--ink-3)]">
                        {contact?.name ?? "Sem contato"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: stage?.color ?? "#6366F1" }}
                        />
                        <span className="text-xs">{stage?.name ?? "—"}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{formatBRL(Number(d.value || 0))}</td>
                    <td className="px-4 py-3 text-xs text-[color:var(--ink-3)]">
                      {formatRelative(d.expected_close_date)}
                    </td>
                    <td className="px-4 py-3 text-xs text-[color:var(--ink-3)]">
                      {formatRelative(d.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={source}
                        tone={
                          source === "meta_ads"
                            ? "accent"
                            : source === "referral"
                              ? "good"
                              : "neutral"
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {pending > 0 ? (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            overdue > 0
                              ? "text-[color:var(--bad)]"
                              : "text-[color:var(--ink-3)]"
                          }`}
                        >
                          <CheckSquare className="h-3 w-3" />
                          {pending}
                          {overdue > 0 ? ` (${overdue} atrasada)` : ""}
                        </span>
                      ) : (
                        <span className="text-[color:var(--ink-4)]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-[color:var(--ink-3)]">
                    Nenhum negocio neste filtro.
                  </td>
                </tr>
              )}
            </tbody>
            {sorted.length > 0 && (
              <tfoot className="border-t border-[color:var(--line)] bg-[color:var(--bg-2)]/40 text-xs">
                <tr>
                  <td className="px-4 py-3 font-medium" colSpan={2}>
                    Total: {sorted.length} negocio(s)
                  </td>
                  <td className="px-4 py-3 font-mono font-medium">{formatBRL(total)}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      <DealModal dealId={openDealId} onClose={() => setOpenDealId(null)} />
    </>
  );
}
