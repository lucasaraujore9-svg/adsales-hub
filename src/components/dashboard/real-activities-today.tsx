"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  Circle,
  Phone,
  Mail,
  MessageCircle,
  Users,
  ListTodo,
  FileText,
} from "lucide-react";
import type { ActivityRow } from "@/lib/queries/crm";
import { toggleActivityComplete } from "@/lib/actions/activities";

const ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  meeting: Users,
  task: ListTodo,
  note: FileText,
  sms: MessageCircle,
};

function formatRelative(iso: string) {
  const d = new Date(iso);
  const diff = (d.getTime() - Date.now()) / 60000;
  const abs = Math.abs(diff);
  const hours = abs / 60;
  const days = hours / 24;
  if (abs < 60) return diff >= 0 ? `em ${Math.round(abs)}min` : `${Math.round(abs)}min atrás`;
  if (hours < 24) return diff >= 0 ? `em ${Math.round(hours)}h` : `${Math.round(hours)}h atrás`;
  return diff >= 0 ? `em ${Math.round(days)}d` : `${Math.round(days)}d atrás`;
}

export function DashboardActivitiesToday({ activities }: { activities: ActivityRow[] }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  const relevant = activities
    .filter((a) => {
      if (!a.due_date) return false;
      const diffHours = (new Date(a.due_date).getTime() - Date.now()) / 36e5;
      return diffHours >= -12 && diffHours <= 36;
    })
    .slice(0, 6);

  if (relevant.length === 0) {
    return <p className="text-sm text-[color:var(--ink-3)]">Nada agendado para hoje.</p>;
  }

  function handleToggle(id: string, current: boolean) {
    start(async () => {
      const result = await toggleActivityComplete(id, !current);
      if (result.ok) {
        toast.success(!current ? "Atividade concluída" : "Atividade reaberta", {
          action: {
            label: "Desfazer",
            onClick: () => {
              start(async () => {
                await toggleActivityComplete(id, current);
                router.refresh();
              });
            },
          },
        });
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro ao atualizar");
      }
    });
  }

  return (
    <ul className="divide-y divide-[color:var(--line)]">
      {relevant.map((a) => {
        const Icon = ICONS[a.type] ?? ListTodo;
        return (
          <li key={a.id} className="flex items-center gap-3 py-2.5">
            <button
              type="button"
              onClick={() => handleToggle(a.id, a.completed)}
              disabled={pending}
              aria-label={a.completed ? "Reabrir atividade" : "Marcar como concluída"}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--bg-2)] text-[color:var(--ink-3)] transition hover:bg-[color:var(--bg-3)]"
            >
              {a.completed ? (
                <CheckCircle2 className="h-4 w-4 text-[color:var(--good)]" />
              ) : (
                <Circle className="h-4 w-4 hover:text-[color:var(--accent)]" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <div
                className={`truncate text-sm ${
                  a.completed ? "text-[color:var(--ink-4)] line-through" : "font-medium"
                }`}
              >
                {a.title}
              </div>
              <div className="flex items-center gap-2 text-xs text-[color:var(--ink-3)]">
                {a.due_date && <span>{formatRelative(a.due_date)}</span>}
                <Icon className="h-3 w-3 opacity-60" />
              </div>
            </div>
          </li>
        );
      })}
      <li className="pt-3">
        <Link
          href="/atividades"
          className="text-xs font-medium text-[color:var(--accent)] hover:underline"
        >
          Ver todas as atividades →
        </Link>
      </li>
    </ul>
  );
}
