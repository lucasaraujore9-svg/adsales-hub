import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "suspended"
  | "incomplete";

export interface WorkspaceAccess {
  workspaceId: string;
  modules: string[];
  subscriptionStatus: SubscriptionStatus;
  trialEnd: string | null;
  trialDaysLeft: number;
  isTrialing: boolean;
  isValid: boolean;
  periodEnd: string | null;
  basketName: string | null;
}

const cache = new Map<string, { value: WorkspaceAccess; expiresAt: number }>();
const TTL_MS = 60_000; // 1 minute — edge middleware hot path

export async function getWorkspaceAccess(
  workspaceId: string,
): Promise<WorkspaceAccess | null> {
  const now = Date.now();
  const cached = cache.get(workspaceId);
  if (cached && cached.expiresAt > now) return cached.value;

  const supabase = await createServerSupabaseClient();

  const [{ data: subRows }, { data: moduleRows }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("status, trial_end, current_period_end, baskets(name)")
      .eq("workspace_id", workspaceId)
      .limit(1),
    supabase
      .from("workspace_modules")
      .select("enabled, modules(slug, is_active)")
      .eq("workspace_id", workspaceId),
  ]);

  const sub = (subRows?.[0] ?? null) as
    | {
        status: SubscriptionStatus;
        trial_end: string | null;
        current_period_end: string | null;
        baskets: { name: string } | null;
      }
    | null;

  const rawRows = (moduleRows ?? []) as unknown as Array<{
    enabled: boolean;
    modules: { slug: string; is_active: boolean } | null;
  }>;
  const modules = rawRows
    .filter((r) => r.enabled && r.modules?.is_active)
    .map((r) => r.modules?.slug)
    .filter((slug): slug is string => typeof slug === "string");

  const trialEnd = sub?.trial_end ?? null;
  const trialDaysLeft = trialEnd
    ? Math.max(0, Math.ceil((new Date(trialEnd).getTime() - now) / (1000 * 60 * 60 * 24)))
    : 0;

  const status: SubscriptionStatus = sub?.status ?? "incomplete";
  const isTrialing = status === "trialing" && trialDaysLeft > 0;
  const isValid = isSubscriptionValid(status, sub?.current_period_end ?? null);

  const value: WorkspaceAccess = {
    workspaceId,
    modules,
    subscriptionStatus: status,
    trialEnd,
    trialDaysLeft,
    isTrialing,
    isValid,
    periodEnd: sub?.current_period_end ?? null,
    basketName: sub?.baskets?.name ?? null,
  };

  cache.set(workspaceId, { value, expiresAt: now + TTL_MS });
  return value;
}

export function invalidateWorkspaceAccess(workspaceId: string) {
  cache.delete(workspaceId);
}

export function canAccess(
  access: Pick<WorkspaceAccess, "modules">,
  moduleSlug: string | null,
): boolean {
  if (!moduleSlug) return true; // CRM-only or unmapped route
  return access.modules.includes(moduleSlug);
}

function isSubscriptionValid(
  status: SubscriptionStatus,
  periodEnd: string | null,
): boolean {
  if (status === "active" || status === "trialing") return true;
  if (status === "past_due" && periodEnd) {
    const daysOverdue =
      (Date.now() - new Date(periodEnd).getTime()) / (1000 * 60 * 60 * 24);
    return daysOverdue < 7;
  }
  return false;
}
