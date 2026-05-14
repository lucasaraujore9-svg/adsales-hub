import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Edit3,
  Plus,
  TrendingDown,
  User,
  XCircle,
} from "lucide-react";
import type { DealAuditEntry } from "@/lib/queries/deal-history";

const ICONS: Record<string, typeof Activity> = {
  created: Plus,
  stage_changed: ArrowRight,
  value_changed: Edit3,
  owner_changed: User,
  status_changed: Activity,
  title_changed: Edit3,
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function describe(e: DealAuditEntry): { text: string; icon: typeof Activity; tone: string } {
  const actor = e.actor_name ?? "Sistema";
  switch (e.event_type) {
    case "created":
      return {
        text: `${actor} criou o negócio`,
        icon: Plus,
        tone: "text-[color:var(--good)]",
      };
    case "stage_changed":
      return {
        text: `${actor} mudou o estágio`,
        icon: ArrowRight,
        tone: "text-[color:var(--accent)]",
      };
    case "value_changed":
      return {
        text: `${actor} alterou o valor`,
        icon: Edit3,
        tone: "text-[color:var(--ink-2)]",
      };
    case "owner_changed":
      return {
        text: `${actor} reatribuiu o negócio`,
        icon: User,
        tone: "text-[color:var(--ink-2)]",
      };
    case "status_changed": {
      const newStatus = String(e.new_value ?? "");
      if (newStatus === "won")
        return {
          text: `${actor} marcou como ganho`,
          icon: CheckCircle2,
          tone: "text-[color:var(--good)]",
        };
      if (newStatus === "lost")
        return {
          text: `${actor} marcou como perdido`,
          icon: TrendingDown,
          tone: "text-[color:var(--bad)]",
        };
      if (newStatus === "open")
        return {
          text: `${actor} reabriu o negócio`,
          icon: Activity,
          tone: "text-[color:var(--accent)]",
        };
      return {
        text: `${actor} mudou status para ${newStatus}`,
        icon: Activity,
        tone: "text-[color:var(--ink-2)]",
      };
    }
    case "title_changed":
      return {
        text: `${actor} renomeou o negócio`,
        icon: Edit3,
        tone: "text-[color:var(--ink-2)]",
      };
    default:
      return {
        text: `${actor}: ${e.event_type}`,
        icon: Activity,
        tone: "text-[color:var(--ink-3)]",
      };
  }
}

function formatValue(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "number") {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  }
  if (typeof v === "string") return v;
  return String(v);
}

export function DealHistoryTab({ entries }: { entries: DealAuditEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-sm text-[color:var(--ink-3)]">
        Sem histórico registrado ainda. Mudanças no negócio aparecem aqui.
      </p>
    );
  }

  return (
    <ol className="space-y-3 p-5">
      {entries.map((e) => {
        const d = describe(e);
        const Icon = ICONS[e.event_type] ?? d.icon;
        return (
          <li
            key={e.id}
            className="flex items-start gap-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-3"
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[color:var(--bg-2)] ${d.tone}`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{d.text}</p>
              {(e.field === "value" || e.field === "title") && (
                <p className="mt-0.5 text-xs text-[color:var(--ink-3)]">
                  {formatValue(e.old_value)} → {formatValue(e.new_value)}
                </p>
              )}
              <p className="mt-0.5 text-xs text-[color:var(--ink-4)]">{formatDate(e.created_at)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
