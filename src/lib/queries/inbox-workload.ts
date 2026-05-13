import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { WorkloadItem } from "@/lib/inbox/types";

type SB = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export type { WorkloadItem };

export async function listTeamWorkload(
  supabase: SB,
  workspaceId: string,
): Promise<WorkloadItem[]> {
  const [{ data: users }, { data: convs }] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, email, avatar_url, role")
      .eq("workspace_id", workspaceId),
    supabase
      .from("conversations")
      .select("assignee_user_id, status")
      .eq("workspace_id", workspaceId)
      .in("status", ["open", "pending"]),
  ]);

  const usersRows = (users ?? []) as unknown as {
    id: string;
    name: string | null;
    email: string;
    avatar_url: string | null;
    role: string;
  }[];
  const convRows = (convs ?? []) as unknown as {
    assignee_user_id: string | null;
    status: string;
  }[];

  const items: WorkloadItem[] = usersRows.map((u) => {
    const userConvs = convRows.filter((c) => c.assignee_user_id === u.id);
    return {
      user_id: u.id,
      name: u.name ?? u.email,
      email: u.email,
      avatar_url: u.avatar_url,
      open_count: userConvs.filter((c) => c.status === "open").length,
      pending_count: userConvs.filter((c) => c.status === "pending").length,
    };
  });

  const unassigned = convRows.filter((c) => !c.assignee_user_id);
  items.unshift({
    user_id: null,
    name: "Sem responsavel",
    email: null,
    avatar_url: null,
    open_count: unassigned.filter((c) => c.status === "open").length,
    pending_count: unassigned.filter((c) => c.status === "pending").length,
  });

  return items;
}

/**
 * Round-robin among the users with the smallest open_count load.
 * Returns user ids of unassigned conversations paired with the user to
 * assign them to.
 */
export function planAutoAssignment(
  workload: WorkloadItem[],
  unassignedIds: string[],
): { conversation_id: string; assignee_user_id: string }[] {
  const candidates = workload.filter((w) => w.user_id);
  if (candidates.length === 0) return [];
  const loads = new Map(candidates.map((c) => [c.user_id!, c.open_count]));
  const sortedOnce = [...candidates].sort((a, b) => a.open_count - b.open_count);
  const plan: { conversation_id: string; assignee_user_id: string }[] = [];
  for (const convId of unassignedIds) {
    // pick the user with the smallest current load
    const picked = [...loads.entries()].sort((a, b) => a[1] - b[1])[0];
    if (!picked) break;
    plan.push({ conversation_id: convId, assignee_user_id: picked[0] });
    loads.set(picked[0], picked[1] + 1);
  }
  void sortedOnce;
  return plan;
}

export { slaAgeMs, slaBucket, formatSlaAge } from "@/lib/inbox/sla";
