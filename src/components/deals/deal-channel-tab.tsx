"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createActivity, toggleActivityComplete } from "@/lib/actions/activities";
import type { ActivityRow, CallRow } from "@/lib/queries/crm";

interface Props {
  dealId: string;
  contactId: string | null;
  type: "call" | "whatsapp" | "email";
  activities: ActivityRow[];
  calls?: CallRow[];
  channelLabel: string;
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DealChannelTab({
  dealId,
  contactId,
  type,
  activities,
  calls = [],
  channelLabel,
}: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, start] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    start(async () => {
      const result = await createActivity({
        type,
        title: trimmed,
        deal_id: dealId,
        contact_id: contactId ?? undefined,
      });
      if (result.ok) {
        setTitle("");
        setCreating(false);
        toast.success("Atividade registrada");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleToggle(id: string, current: boolean) {
    start(async () => {
      const result = await toggleActivityComplete(id, !current);
      if (result.ok) {
        toast.success(current ? "Reaberta" : "Concluida");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        {creating ? (
          <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row">
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Resumo do ${channelLabel.toLowerCase()}...`}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending || !title.trim()}>
                Registrar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setCreating(false);
                  setTitle("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Registrar {channelLabel.toLowerCase()}
          </Button>
        )}
      </div>

      {type === "call" && calls.length > 0 && (
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
          <header className="border-b border-[color:var(--line)] px-5 py-3 text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
            Ligacoes registradas no provedor
          </header>
          <ul className="divide-y divide-[color:var(--line)]">
            {calls.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <div className="font-medium capitalize">
                    {c.direction === "inbound" ? "Recebida" : "Feita"} · {c.status}
                  </div>
                  <div className="text-xs text-[color:var(--ink-3)]">
                    {formatDateTime(c.started_at ?? c.created_at)}
                  </div>
                </div>
                <span className="font-mono text-xs text-[color:var(--ink-3)]">
                  {Math.round(c.duration_seconds / 60)}min
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        <ul className="divide-y divide-[color:var(--line)]">
          {activities.map((a) => (
            <li key={a.id} className="flex items-start gap-3 px-5 py-3">
              <button onClick={() => handleToggle(a.id, a.completed)} disabled={pending}>
                {a.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-[color:var(--good)]" />
                ) : (
                  <Circle className="h-4 w-4 text-[color:var(--ink-4)] hover:text-[color:var(--accent)]" />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm ${a.completed ? "text-[color:var(--ink-4)] line-through" : "font-medium"}`}
                >
                  {a.title}
                </div>
                <div className="text-xs text-[color:var(--ink-3)]">
                  {a.due_date ? formatDateTime(a.due_date) : "sem data"}
                  {a.outcome ? ` · ${a.outcome}` : ""}
                </div>
              </div>
            </li>
          ))}
          {activities.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
              Nenhum registro de {channelLabel.toLowerCase()} ainda.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
