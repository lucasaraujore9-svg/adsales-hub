import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { rpcOnClient } from "@/lib/supabase/admin";

export type LimitedResource =
  | "users"
  | "ad_accounts"
  | "campaigns"
  | "landing_pages"
  | "emails_sent"
  | "social_networks"
  | "ai_generations"
  | "sdr_minutes"
  | "media_monthly"
  | "reports"
  | "contracts";

export interface LimitCheck {
  allowed: boolean;
  current: number;
  limit: number;
  unlimited: boolean;
  tracked: boolean;
}

export async function checkLimit(
  workspaceId: string,
  resource: LimitedResource,
): Promise<LimitCheck> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await rpcOnClient(supabase, "check_plan_limit", {
    p_workspace_id: workspaceId,
    p_resource: resource as string,
  });
  if (error || !data) {
    return { allowed: true, current: 0, limit: 0, unlimited: false, tracked: false };
  }
  const json = data as unknown as {
    allowed: boolean;
    current: number;
    limit: number;
    tracked?: boolean;
    unlimited?: boolean;
  };
  return {
    allowed: json.allowed,
    current: json.current,
    limit: json.limit,
    unlimited: json.unlimited === true,
    tracked: json.tracked !== false,
  };
}

export async function incrementUsage(
  workspaceId: string,
  resource: LimitedResource,
  amount = 1,
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await rpcOnClient(supabase, "increment_usage", {
    p_workspace_id: workspaceId,
    p_resource: resource as string,
    p_amount: amount,
  });
}
