"use client";

import { useTransition } from "react";
import {
  CheckCircle2,
  Circle,
  FileText,
  Linkedin,
  ListTodo,
  Mail,
  MessageCircle,
  Phone,
  PlayCircle,
  Repeat,
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { ActivityRow, ContactRow, DealRow } from "@/lib/queries/crm";
import { toggleActivityComplete } from "@/lib/actions/activities";

const ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  meeting: Users,
  task: ListTodo,
  note: FileText,
  sms: MessageCircle,
  video_meeting: Video,
  demo: PlayCircle,
  follow_up: Repeat,
  linkedin: Linkedin,
};

function formatBucketDate(d: Date): string {
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" });
}

export function ActivitiesList({
  activities,
  deals,
  contacts,
}: {
  activities: ActivityRow[];
  deals: DealRow[];
  contacts: ContactRow[];
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const dealById = new Map(deals.map((d) => [d.id, d]));
  const contactById = new Map(contacts.map((c) => [c.id, c]));

  // Group by date
  const groups = new Map<string, ActivityRow[]>();
  for (const a of [...activities].sort((x, y) => {
    const xd = x.due_date ? new Date(x.due_date).getTime() : Infinity;
    const yd = y.due_date ? new Date(y.due_date).getTime() : Infinity;
    return xd - yd;
  })) {
    const key = a.due_date ? new Date(a.due_date).toISOString().slice(0, 10) : "sem-data";
    const arr = groups.get(key) ?? [];
    arr.push(a);
    groups.set(key, arr);
  }

  const today = new Date().toISOString().slice(0, 10);

  async function handleToggle(id: string, current: boolean) {
    start(async () => {
      const result = await toggleActivityComplete(id, !current);
      if (result.ok) {
        const wasCompleted = !current;
        toast.success(wasCompleted ? "Atividade concluída" : "Atividade reaberta", {
          action: {
            label: "Desfazer",
            onClick: () => {
              start(async () => {
                const undo = await toggleActivityComplete(id, current);
                if (undo.ok) {
                  toast.message("Ação desfeita");
                  router.refresh();
                }
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
    <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
      {[...groups.entries()].map(([dateKey, items]) => {
        const d = dateKey === "sem-data" ? null : new Date(dateKey);
        const isToday = dateKey === today;
        return (
          <div key={dateKey} className="border-b border-[color:var(--line)] last:border-b-0">
            <header className="flex items-center justify-between bg-[color:var(--bg-2)]/40 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium capitalize">
                  {d ? formatBucketDate(d) : "Sem data"}
                </span>
                {isToday && (
                  <span className="rounded-pill bg-[color:var(--accent)] px-2 py-0.5 text-[10px] font-medium text-white">
                    Hoje
                  </span>
                )}
              </div>
              <span className="text-xs text-[color:var(--ink-4)]">{items.length}</span>
            </header>
            <ul className="divide-y divide-[color:var(--line)]">
              {items.map((a) => {
                const Icon = ICONS[a.type] ?? ListTodo;
                const contact = a.contact_id ? contactById.get(a.contact_id) : null;
                const deal = a.deal_id ? dealById.get(a.deal_id) : null;
                const overdue =
                  !a.completed && a.due_date && new Date(a.due_date).getTime() < Date.now();
                return (
                  <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                    <button
                      onClick={() => handleToggle(a.id, a.completed)}
                      className="mt-0.5"
                      disabled={pending}
                    >
                      {a.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-[color:var(--good)]" />
                      ) : (
                        <Circle className="h-4 w-4 text-[color:var(--ink-4)] hover:text-[color:var(--accent)]" />
                      )}
                    </button>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[color:var(--bg-2)] text-[color:var(--ink-3)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`truncate text-sm ${a.completed ? "text-[color:var(--ink-4)] line-through" : "font-medium"}`}>
                        {a.title}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-[color:var(--ink-3)]">
                        {a.due_date && (
                          <span>
                            {new Date(a.due_date).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                        {contact && <><span>·</span><span>{contact.name}</span></>}
                        {deal && <><span>·</span><span className="truncate">{deal.title}</span></>}
                        {overdue && <><span>·</span><span className="text-[color:var(--bad)]">Atrasada</span></>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {groups.size === 0 && (
        <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
          Nenhuma atividade ainda.
        </p>
      )}
    </div>
  );
}
