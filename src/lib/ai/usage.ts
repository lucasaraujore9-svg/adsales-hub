import "server-only";

import { adminRpc } from "@/lib/supabase/admin";

/**
 * Records a unit of AI consumption against the workspace. We use the admin
 * client because this runs inside server actions (or background jobs) that
 * may not have a session, and because usage metering must not be blocked by
 * RLS. Keeps ai_generations counter in usage_records up to date for gating.
 */
export async function recordAiUsage(
  workspaceId: string,
  amount = 1,
): Promise<void> {
  const { error } = await adminRpc("increment_usage", {
    p_workspace_id: workspaceId,
    p_resource: "ai_generations",
    p_amount: amount,
  });
  if (error) {
    console.error("[ai/usage] increment_usage failed", error);
  }
}

export async function canUseAi(workspaceId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
}> {
  const { data } = await adminRpc("check_plan_limit", {
    p_workspace_id: workspaceId,
    p_resource: "ai_generations",
  });
  const json = (data ?? {}) as {
    allowed?: boolean;
    current?: number;
    limit?: number;
    unlimited?: boolean;
  };
  return {
    allowed: json.unlimited === true || json.allowed !== false,
    current: json.current ?? 0,
    limit: json.limit ?? 0,
  };
}
