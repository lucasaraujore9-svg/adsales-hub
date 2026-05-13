import Link from "next/link";
import { ChannelIcon, channelLabel } from "@/components/inbox/channel-icon";
import { cn } from "@/lib/utils";

interface Props {
  filters: { status: string; channel: string; assignee: string };
  counts: {
    byStatus: Record<string, number>;
    byChannel: Record<string, number>;
  };
}

const STATUS = [
  { k: "open", l: "Abertas" },
  { k: "pending", l: "Aguardando" },
  { k: "snoozed", l: "Adiadas" },
  { k: "resolved", l: "Resolvidas" },
  { k: "all", l: "Todas" },
];

const CHANNELS = [
  { k: "whatsapp_cloud" },
  { k: "whatsapp_unofficial" },
  { k: "instagram_dm" },
  { k: "messenger" },
  { k: "email" },
  { k: "live_chat" },
  { k: "sms" },
  { k: "telegram" },
];

function href(base: Props["filters"], updates: Partial<Props["filters"]>) {
  const merged = { ...base, ...updates };
  const q = new URLSearchParams();
  if (merged.status && merged.status !== "open") q.set("status", merged.status);
  if (merged.channel) q.set("channel", merged.channel);
  if (merged.assignee) q.set("assignee", merged.assignee);
  return `/inbox${q.size > 0 ? `?${q.toString()}` : ""}`;
}

export function InboxFilters({ filters, counts }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-2.5">
      <span className="text-[10px] uppercase tracking-kicker text-[color:var(--ink-4)]">Status</span>
      {STATUS.map((s) => {
        const active = (filters.status || "open") === s.k;
        const count = s.k === "all" ? undefined : counts.byStatus[s.k] ?? 0;
        return (
          <Link
            key={s.k}
            href={href(filters, { status: s.k })}
            className={cn(
              "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs transition-colors",
              active
                ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                : "bg-[color:var(--bg-2)] text-[color:var(--ink-3)] hover:bg-[color:var(--bg)] hover:text-[color:var(--ink)]",
            )}
          >
            <span>{s.l}</span>
            {count !== undefined && (
              <span className={cn("text-[10px] opacity-60", active && "opacity-80")}>
                {count}
              </span>
            )}
          </Link>
        );
      })}

      <span className="ml-3 text-[10px] uppercase tracking-kicker text-[color:var(--ink-4)]">Canal</span>
      <Link
        href={href(filters, { channel: "" })}
        className={cn(
          "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs transition-colors",
          !filters.channel
            ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
            : "bg-[color:var(--bg-2)] text-[color:var(--ink-3)] hover:bg-[color:var(--bg)] hover:text-[color:var(--ink)]",
        )}
      >
        Todos
      </Link>
      {CHANNELS.map((c) => {
        const count = counts.byChannel[c.k] ?? 0;
        if (count === 0) return null;
        const active = filters.channel === c.k;
        return (
          <Link
            key={c.k}
            href={href(filters, { channel: c.k })}
            className={cn(
              "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs transition-colors",
              active
                ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                : "bg-[color:var(--bg-2)] text-[color:var(--ink-3)] hover:bg-[color:var(--bg)] hover:text-[color:var(--ink)]",
            )}
          >
            <ChannelIcon channel={c.k} className="h-3 w-3" />
            <span className="truncate max-w-[120px]">{channelLabel(c.k)}</span>
            <span className={cn("text-[10px] opacity-60", active && "opacity-80")}>{count}</span>
          </Link>
        );
      })}
    </div>
  );
}
