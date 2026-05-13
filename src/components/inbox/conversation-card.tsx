"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import type { ConversationRow } from "@/lib/queries/inbox";
import type { ContactRow, UserRow } from "@/lib/queries/crm";
import { ChannelIcon, channelLabel } from "@/components/inbox/channel-icon";
import { slaAgeMs, slaBucket, formatSlaAge } from "@/lib/inbox/sla";
import { cn } from "@/lib/utils";

const CHANNEL_BORDER: Record<string, string> = {
  whatsapp_cloud: "before:bg-[#25D366]",
  whatsapp_unofficial: "before:bg-[#128C7E]",
  instagram_dm: "before:bg-[#E1306C]",
  messenger: "before:bg-[#0084FF]",
  email: "before:bg-[color:var(--ink-3)]",
  sms: "before:bg-[color:var(--warn)]",
  live_chat: "before:bg-[color:var(--accent)]",
  telegram: "before:bg-[#229ED9]",
};

function formatRelative(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function ownerInitials(user: UserRow | undefined): string {
  if (!user) return "—";
  return (user.name ?? user.email).split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
}

const OWNER_COLORS = ["#FF5E1A", "#3B82F6", "#10B981", "#A855F7", "#F59E0B"];

function ownerColor(id: string | null | undefined): string {
  if (!id) return "#71717a";
  const idx = id.charCodeAt(0) % OWNER_COLORS.length;
  return OWNER_COLORS[idx]!;
}

interface Props {
  conversation: ConversationRow;
  contact: ContactRow | null;
  assignee: UserRow | undefined;
  active: boolean;
  href: string;
}

export function ConversationCard({ conversation: c, contact, assignee, active, href }: Props) {
  const sla = slaAgeMs(c.last_inbound_at, c.status);
  const bucket = slaBucket(sla);
  const label = formatSlaAge(sla);
  const hasUnread = c.unread_count > 0;
  const name = contact?.name ?? c.channel_identifier;

  return (
    <Link
      href={href}
      className={cn(
        "relative block border-b border-[color:var(--line)] px-4 py-3 pl-5 transition-colors",
        "before:absolute before:left-0 before:top-0 before:h-full before:w-[3px]",
        CHANNEL_BORDER[c.channel] ?? "before:bg-[color:var(--line-3)]",
        active
          ? "bg-[color:var(--bg-2)]"
          : "hover:bg-[color:var(--bg-2)]/60",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-semibold text-white"
            style={{ backgroundColor: ownerColor(contact?.id ?? c.channel_identifier) }}
          >
            {contact?.name
              ? contact.name.split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("")
              : <ChannelIcon channel={c.channel} className="h-4 w-4" />}
          </div>
          <div
            className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[color:var(--panel)] bg-[color:var(--bg)]"
            aria-hidden
          >
            <ChannelIcon channel={c.channel} className="h-2.5 w-2.5 text-[color:var(--ink-3)]" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className={cn("truncate text-sm", hasUnread ? "font-semibold" : "font-medium")}>
              {name}
            </span>
            <span className="shrink-0 text-[10px] text-[color:var(--ink-4)]">
              {formatRelative(c.last_message_at)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[color:var(--ink-4)]">
            <span>{channelLabel(c.channel)}</span>
            {c.priority === "high" || c.priority === "urgent" ? (
              <span className="inline-flex items-center gap-0.5 rounded-pill bg-[color:var(--warn)]/20 px-1.5 py-[1px] font-medium text-[color:var(--warn)]">
                <AlertCircle className="h-2.5 w-2.5" /> {c.priority}
              </span>
            ) : null}
          </div>
          <p
            className={cn(
              "mt-1 line-clamp-2 text-xs leading-snug",
              hasUnread ? "text-[color:var(--ink)]" : "text-[color:var(--ink-3)]",
            )}
          >
            {c.last_message_preview ?? "(sem mensagem)"}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {label && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-pill px-1.5 py-[1px] text-[10px] font-medium",
                    bucket === "late" && "bg-[color:var(--bad)]/15 text-[color:var(--bad)]",
                    bucket === "warn" && "bg-[color:var(--warn)]/15 text-[color:var(--warn)]",
                    bucket === "ok" && "bg-[color:var(--good)]/15 text-[color:var(--good)]",
                  )}
                >
                  <Clock className="h-2.5 w-2.5" /> {label}
                </span>
              )}
              {c.status === "resolved" && (
                <CheckCircle2 className="h-3 w-3 text-[color:var(--good)]" />
              )}
              {(c.tags ?? []).slice(0, 1).map((t) => (
                <span
                  key={t}
                  className="rounded-pill border border-[color:var(--line-2)] px-1.5 py-0 text-[10px] text-[color:var(--ink-3)]"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {hasUnread && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--accent)] px-1.5 text-[10px] font-semibold text-white">
                  {c.unread_count}
                </span>
              )}
              {assignee ? (
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white"
                  style={{ backgroundColor: ownerColor(assignee.id) }}
                  title={assignee.name ?? assignee.email}
                >
                  {ownerInitials(assignee)}
                </div>
              ) : (
                <span
                  className="text-[10px] font-medium text-[color:var(--warn)]"
                  title="Sem responsavel"
                >
                  ◌
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export { ownerColor, ownerInitials };
