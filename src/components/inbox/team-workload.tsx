"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ownerColor, ownerInitials } from "@/components/inbox/conversation-card";
import type { WorkloadItem } from "@/lib/inbox/types";
import type { UserRow } from "@/lib/queries/crm";
import { cn } from "@/lib/utils";

interface Props {
  workload: WorkloadItem[];
  activeUserId?: string;
  onFilter?: (userId: string | null | undefined) => void;
  filterValue?: string;
  onAutoAssign: () => void;
  autoAssignPending: boolean;
  currentUserId: string;
}

export function TeamWorkload({
  workload,
  filterValue,
  onAutoAssign,
  autoAssignPending,
  currentUserId,
}: Props) {
  const unassigned = workload.find((w) => w.user_id === null);
  const members = workload.filter((w) => w.user_id);
  const totalOpen = workload.reduce((a, w) => a + w.open_count, 0);

  return (
    <div className="flex items-center gap-3 border-b border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-2">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-kicker text-[color:var(--ink-4)]">
        <UserCheck className="h-3 w-3" />
        Time
      </div>

      <div className="flex items-center gap-1 overflow-x-auto">
        {/* Unassigned pill */}
        {unassigned && unassigned.open_count > 0 && (
          <a
            href={`/inbox?assignee=unassigned`}
            className={cn(
              "inline-flex items-center gap-2 rounded-pill border px-2 py-1 text-xs transition-colors",
              filterValue === "unassigned"
                ? "border-[color:var(--warn)] bg-[color:var(--warn)]/15 text-[color:var(--warn)]"
                : "border-[color:var(--warn)]/30 bg-[color:var(--warn)]/5 text-[color:var(--warn)] hover:bg-[color:var(--warn)]/10",
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--warn)]" />
            <span className="font-medium">Livre</span>
            <span className="rounded-pill bg-[color:var(--warn)]/20 px-1 text-[10px]">
              {unassigned.open_count}
            </span>
          </a>
        )}

        {/* Team member pills */}
        {members.map((m) => {
          const isActive =
            filterValue === "me" && m.user_id === currentUserId
              ? true
              : filterValue === m.user_id;
          const isMe = m.user_id === currentUserId;
          const load = m.open_count;
          const loadColor =
            load === 0
              ? "text-[color:var(--ink-4)]"
              : load < 5
                ? "text-[color:var(--good)]"
                : load < 10
                  ? "text-[color:var(--warn)]"
                  : "text-[color:var(--bad)]";

          return (
            <a
              key={m.user_id}
              href={`/inbox?assignee=${isMe ? "me" : m.user_id}`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-pill border px-1.5 py-1 text-xs transition-colors",
                isActive
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10"
                  : "border-[color:var(--line-2)] hover:bg-[color:var(--bg-2)]",
              )}
            >
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-white"
                style={{ backgroundColor: ownerColor(m.user_id ?? "") }}
              >
                {ownerInitials({ id: m.user_id!, name: m.name, email: m.email ?? "", avatar_url: m.avatar_url, role: "" } as UserRow)}
              </div>
              <span className={cn("font-medium", isMe && "text-[color:var(--accent)]")}>
                {isMe ? "Voce" : m.name.split(" ")[0]}
              </span>
              <span className={cn("font-mono font-semibold", loadColor)}>{load}</span>
            </a>
          );
        })}
      </div>

      <span className="ml-2 shrink-0 text-[10px] text-[color:var(--ink-4)]">
        {totalOpen} abertas
      </span>

      <Button
        size="sm"
        variant="outline"
        disabled={autoAssignPending || (unassigned?.open_count ?? 0) === 0}
        onClick={onAutoAssign}
        className="ml-auto"
      >
        <Sparkles className="mr-1 h-3 w-3" />
        {autoAssignPending ? "Distribuindo..." : `Auto-distribuir (${unassigned?.open_count ?? 0})`}
      </Button>
    </div>
  );
}

export function TeamWorkloadWrapper({
  workload,
  filterValue,
  currentUserId,
}: {
  workload: WorkloadItem[];
  filterValue?: string;
  currentUserId: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  async function handleAutoAssign() {
    start(async () => {
      try {
        const mod = await import("@/lib/actions/inbox-ops");
        await mod.autoAssignOpenConversations();
        toast.success("Conversas distribuidas pela equipe");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro");
      }
    });
  }

  return (
    <TeamWorkload
      workload={workload}
      filterValue={filterValue}
      onAutoAssign={handleAutoAssign}
      autoAssignPending={pending}
      currentUserId={currentUserId}
    />
  );
}
