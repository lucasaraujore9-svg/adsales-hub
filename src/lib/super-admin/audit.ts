import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getRequestMeta } from "@/lib/server/request-meta";

export type SuperAdminAction =
  | "workspace_plan_changed"
  | "workspace_credits_granted"
  | "workspace_suspended"
  | "workspace_activated"
  | "integration_disconnected"
  | "user_impersonated"
  | "user_role_changed";

export async function logSuperAdminEvent(params: {
  actorUserId: string;
  actionType: SuperAdminAction;
  targetType: string;
  targetId?: string | null;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
}): Promise<void> {
  try {
    const meta = await getRequestMeta();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminSupabaseClient() as any;
    await admin.from("super_admin_audit_log").insert({
      actor_user_id: params.actorUserId,
      action_type: params.actionType,
      target_type: params.targetType,
      target_id: params.targetId ?? null,
      before_value: params.before ?? null,
      after_value: params.after ?? null,
      reason: params.reason ?? null,
      ip_address: meta.ip,
      user_agent: meta.userAgent,
    });
  } catch (err) {
    console.error("[super-admin/audit] failed", err);
  }
}
