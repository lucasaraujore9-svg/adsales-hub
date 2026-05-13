"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, ListTodo } from "lucide-react";
import type { UserRow } from "@/lib/queries/crm";

const TYPES: { key: string; label: string }[] = [
  { key: "call", label: "Ligacao" },
  { key: "email", label: "Email" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "meeting", label: "Reuniao" },
  { key: "video_meeting", label: "Video reuniao" },
  { key: "demo", label: "Demo" },
  { key: "follow_up", label: "Follow-up" },
  { key: "task", label: "Tarefa" },
  { key: "note", label: "Nota" },
  { key: "sms", label: "SMS" },
  { key: "linkedin", label: "LinkedIn" },
];

interface Props {
  view: "lista" | "calendario";
  typeFilter: string | null;
  userFilter: string | null;
  users: UserRow[];
  currentUserId: string;
}

export function ActivitiesFilters({
  view,
  typeFilter,
  userFilter,
  users,
  currentUserId,
}: Props) {
  const sp = useSearchParams();

  function buildHref(patch: Record<string, string | null>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    const q = params.toString();
    return q ? `/atividades?${q}` : "/atividades";
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex gap-1 rounded-pill border border-[color:var(--line-2)] p-0.5">
        <Link
          href={buildHref({ view: null })}
          className={`flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-medium transition-colors ${
            view === "lista"
              ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
              : "text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
          }`}
        >
          <ListTodo className="h-3 w-3" /> Lista
        </Link>
        <Link
          href={buildHref({ view: "calendario" })}
          className={`flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-medium transition-colors ${
            view === "calendario"
              ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
              : "text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
          }`}
        >
          <CalendarDays className="h-3 w-3" /> Calendario
        </Link>
      </div>

      <select
        defaultValue={typeFilter ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          window.location.href = buildHref({ type: v === "" ? null : v });
        }}
        className="h-8 rounded-pill border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 text-xs"
      >
        <option value="">Todos os tipos</option>
        {TYPES.map((t) => (
          <option key={t.key} value={t.key}>
            {t.label}
          </option>
        ))}
      </select>

      <select
        defaultValue={userFilter ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          window.location.href = buildHref({ user: v === "" ? null : v });
        }}
        className="h-8 rounded-pill border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 text-xs"
      >
        <option value="">Todos os usuarios</option>
        <option value="me">Meus</option>
        <option value="unassigned">Sem responsavel</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name ?? u.email}
            {u.id === currentUserId ? " (eu)" : ""}
          </option>
        ))}
      </select>

      {(typeFilter || userFilter) && (
        <Link
          href={buildHref({ type: null, user: null })}
          className="text-xs text-[color:var(--ink-3)] underline-offset-2 hover:text-[color:var(--ink)] hover:underline"
        >
          Limpar filtros
        </Link>
      )}
    </div>
  );
}
