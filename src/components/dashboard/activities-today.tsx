import Link from "next/link";
import { CheckCircle2, Circle, Phone, Mail, MessageCircle, Users, ListTodo, FileText } from "lucide-react";
import { MOCK_ACTIVITIES, contactById, formatRelative } from "@/lib/mock/crm";
import { Avatar } from "@/components/shared/avatar-stack";

const ICONS = {
  call: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  meeting: Users,
  task: ListTodo,
  note: FileText,
} as const;

export function ActivitiesToday() {
  const today = MOCK_ACTIVITIES.filter((a) => {
    const diffHours = (new Date(a.dueDate).getTime() - Date.now()) / 36e5;
    return diffHours >= -12 && diffHours <= 36;
  })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 6);

  if (today.length === 0) {
    return <p className="text-sm text-[color:var(--ink-3)]">Nada agendado para hoje.</p>;
  }

  return (
    <ul className="divide-y divide-[color:var(--line)]">
      {today.map((a) => {
        const Icon = ICONS[a.type];
        const contact = a.contactId ? contactById(a.contactId) : null;
        return (
          <li key={a.id} className="flex items-center gap-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--bg-2)] text-[color:var(--ink-3)]">
              {a.completed ? (
                <CheckCircle2 className="h-4 w-4 text-[color:var(--good)]" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{a.title}</div>
              <div className="flex items-center gap-2 text-xs text-[color:var(--ink-3)]">
                {contact && <span className="truncate">{contact.name}</span>}
                <span>· {formatRelative(a.dueDate)}</span>
              </div>
            </div>
            <Avatar ownerId={a.owner} size="sm" />
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
