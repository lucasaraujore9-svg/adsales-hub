"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Building2,
  Tag,
  TrendingUp,
  CalendarClock,
  Users as UsersIcon,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import type { ConversationRow } from "@/lib/queries/inbox";
import type { ContactRow, DealRow, UserRow } from "@/lib/queries/crm";
import { ChannelIcon, channelLabel } from "@/components/inbox/channel-icon";
import { ownerColor, ownerInitials } from "@/components/inbox/conversation-card";
import { Button } from "@/components/ui/button";
import { updateConversation } from "@/lib/actions/inbox";
import { cn } from "@/lib/utils";

interface Props {
  conversation: ConversationRow;
  contact: ContactRow | null;
  deal: DealRow | null;
  users: UserRow[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(v: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(v);
}

export function ConversationSidePanel({ conversation, contact, deal, users }: Props) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function assign(userId: string | null) {
    start(async () => {
      const res = await updateConversation({
        conversation_id: conversation.id,
        assignee_user_id: userId,
      });
      if (res.ok) {
        toast.success(userId ? "Responsavel atribuido" : "Responsavel removido");
        router.refresh();
      } else {
        toast.error(res.error ?? "Erro");
      }
    });
  }

  function changePriority(priority: "low" | "normal" | "high" | "urgent") {
    start(async () => {
      const res = await updateConversation({
        conversation_id: conversation.id,
        priority,
      });
      if (res.ok) {
        toast.success("Prioridade atualizada");
        router.refresh();
      }
    });
  }

  const assignee = users.find((u) => u.id === conversation.assignee_user_id);

  return (
    <aside className="flex h-full w-[320px] flex-col border-l border-[color:var(--line)] bg-[color:var(--panel)] overflow-y-auto">
      <Section title="Canal">
        <div className="flex items-center gap-2 rounded-card bg-[color:var(--bg-2)] px-3 py-2">
          <ChannelIcon channel={conversation.channel} className="h-4 w-4 text-[color:var(--ink-3)]" />
          <div className="flex-1">
            <div className="text-xs font-medium">{channelLabel(conversation.channel)}</div>
            <div className="text-[10px] text-[color:var(--ink-4)]">
              {conversation.channel_identifier}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Contato">
        {contact ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                style={{ backgroundColor: ownerColor(contact.id) }}
              >
                {contact.name.split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("")}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/contatos/${contact.id}`}
                  className="block truncate text-sm font-medium hover:text-[color:var(--accent)]"
                >
                  {contact.name}
                </Link>
                <span className="text-[10px] uppercase tracking-kicker text-[color:var(--ink-4)]">
                  {contact.lifecycle_stage}
                </span>
              </div>
            </div>
            {contact.email && <Field icon={Mail} label="Email" value={contact.email} />}
            {contact.phone && <Field icon={Phone} label="Telefone" value={contact.phone} />}
            {contact.company_id && (
              <Field icon={Building2} label="Empresa" value={contact.company_id.slice(0, 8)} />
            )}
            {(contact.utm_source || contact.utm_campaign) && (
              <div className="rounded-card bg-[color:var(--bg-2)] p-2">
                <div className="mb-1 text-[10px] uppercase tracking-kicker text-[color:var(--ink-4)]">
                  UTM
                </div>
                <div className="space-y-0.5 text-[11px] text-[color:var(--ink-3)]">
                  {contact.utm_source && <div>source: {contact.utm_source}</div>}
                  {contact.utm_medium && <div>medium: {contact.utm_medium}</div>}
                  {contact.utm_campaign && <div>campaign: {contact.utm_campaign}</div>}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-[color:var(--warn)]/30 bg-[color:var(--warn)]/5 p-3 text-[11px] text-[color:var(--warn)]">
            <AlertTriangle className="mb-1 h-3 w-3" />
            Nenhum contato vinculado. Vincule manualmente para enriquecer os dados.
          </div>
        )}
      </Section>

      {deal && (
        <Section title="Negocio">
          <Link
            href={`/negocios/${deal.id}`}
            className="block rounded-card border border-[color:var(--line)] p-3 transition-colors hover:border-[color:var(--accent)]/50 hover:bg-[color:var(--accent)]/5"
          >
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 shrink-0 text-[color:var(--accent)]" />
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-medium">{deal.title}</div>
                <div className="mt-1 text-[11px] text-[color:var(--ink-3)]">
                  {formatCurrency(deal.value, deal.currency)}
                </div>
                <div
                  className={cn(
                    "mt-1 inline-block rounded-pill px-2 py-0.5 text-[10px] font-medium",
                    deal.status === "open" && "bg-[color:var(--bg-2)] text-[color:var(--ink-3)]",
                    deal.status === "won" && "bg-[color:var(--good)]/15 text-[color:var(--good)]",
                    deal.status === "lost" && "bg-[color:var(--bad)]/15 text-[color:var(--bad)]",
                  )}
                >
                  {deal.status === "open" ? "Aberto" : deal.status === "won" ? "Ganho" : "Perdido"}
                </div>
                {deal.expected_close_date && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-[color:var(--ink-4)]">
                    <CalendarClock className="h-3 w-3" />
                    Fechamento esperado: {formatDate(deal.expected_close_date)}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </Section>
      )}

      <Section title="Responsavel">
        <div className="space-y-1">
          {assignee && (
            <div className="mb-2 flex items-center gap-2 rounded-card bg-[color:var(--bg-2)] px-3 py-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                style={{ backgroundColor: ownerColor(assignee.id) }}
              >
                {ownerInitials(assignee)}
              </div>
              <span className="text-xs font-medium">{assignee.name ?? assignee.email}</span>
              <button
                onClick={() => assign(null)}
                disabled={pending}
                className="ml-auto text-[10px] text-[color:var(--ink-4)] hover:text-[color:var(--bad)]"
              >
                Remover
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-1">
            {users.slice(0, 8).map((u) => (
              <button
                key={u.id}
                onClick={() => assign(u.id)}
                disabled={pending || u.id === assignee?.id}
                className={cn(
                  "flex items-center gap-1.5 rounded-card px-2 py-1.5 text-[11px] transition-colors",
                  u.id === assignee?.id
                    ? "bg-[color:var(--accent)]/10"
                    : "hover:bg-[color:var(--bg-2)]",
                )}
              >
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white"
                  style={{ backgroundColor: ownerColor(u.id) }}
                >
                  {ownerInitials(u)}
                </div>
                <span className="truncate">{u.name?.split(" ")[0] ?? u.email}</span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Prioridade">
        <div className="flex gap-1">
          {(["low", "normal", "high", "urgent"] as const).map((p) => (
            <button
              key={p}
              onClick={() => changePriority(p)}
              disabled={pending || conversation.priority === p}
              className={cn(
                "flex-1 rounded-pill px-2 py-1 text-[10px] font-medium capitalize transition-colors",
                conversation.priority === p
                  ? p === "urgent"
                    ? "bg-[color:var(--bad)] text-white"
                    : p === "high"
                      ? "bg-[color:var(--warn)] text-white"
                      : "bg-[color:var(--ink)] text-[color:var(--bg)]"
                  : "bg-[color:var(--bg-2)] text-[color:var(--ink-3)] hover:bg-[color:var(--bg)]",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </Section>

      {conversation.tags?.length > 0 && (
        <Section title="Tags">
          <div className="flex flex-wrap gap-1">
            {conversation.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 rounded-pill border border-[color:var(--line-2)] bg-[color:var(--bg-2)] px-2 py-0.5 text-[10px]"
              >
                <Tag className="h-2.5 w-2.5" />
                {t}
              </span>
            ))}
          </div>
        </Section>
      )}

      <Section title="Equipe">
        <div className="space-y-1">
          <div className="text-[11px] text-[color:var(--ink-3)]">
            <UsersIcon className="mr-1 inline h-3 w-3" />
            {users.length} membros no workspace
          </div>
          <div className="text-[11px] text-[color:var(--ink-3)]">
            <MessageSquare className="mr-1 inline h-3 w-3" />
            Ultima msg: {formatDate(conversation.last_message_at)}
          </div>
        </div>
      </Section>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[color:var(--line)] px-4 py-3">
      <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-kicker text-[color:var(--ink-4)]">
        {title}
      </h4>
      {children}
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <Icon className="h-3 w-3 shrink-0 text-[color:var(--ink-4)]" />
      <span className="text-[color:var(--ink-4)]">{label}:</span>
      <span className="truncate text-[color:var(--ink-2)]">{value}</span>
    </div>
  );
}
