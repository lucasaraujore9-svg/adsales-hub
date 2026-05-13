"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, requireWorkspaceAdmin } from "@/lib/auth/guards";
import { invalidateWorkspaceAccess } from "@/lib/billing/feature-gate";
import { serverEnv } from "@/lib/env";

/**
 * Starts a checkout flow. When Stripe is configured (STRIPE_SECRET_KEY + the
 * price IDs), a real Checkout session is generated and the user is redirected.
 * Otherwise, the workspace's subscription is updated to `active` locally so
 * you can evaluate feature gating end-to-end without a Stripe account.
 */
export async function startBasketCheckout(formData: FormData): Promise<void> {
  const basket = String(formData.get("basket") ?? "escala") as
    | "operacao"
    | "crescimento"
    | "escala";

  const session = await requireWorkspaceAdmin();
  const env = serverEnv();
  const priceId =
    basket === "operacao"
      ? env.STRIPE_PRICE_OPERACAO
      : basket === "crescimento"
        ? env.STRIPE_PRICE_CRESCIMENTO
        : env.STRIPE_PRICE_ESCALA;

  if (env.STRIPE_SECRET_KEY && priceId) {
    const { createCheckoutSession } = await import("@/lib/stripe/checkout");
    const checkout = await createCheckoutSession({
      workspaceId: session.workspaceId,
      email: session.profile.email,
      priceId,
      basket,
    });
    if (checkout.url) redirect(checkout.url);
  }

  // DEMO FALLBACK: grant the plan locally.
  await setBasketLocally(session.workspaceId, basket);
  invalidateWorkspaceAccess(session.workspaceId);
  revalidatePath("/configuracoes/billing");
  redirect(`/configuracoes/billing?status=demo_activated&basket=${basket}`);
}

async function setBasketLocally(workspaceId: string, basketName: string) {
  const { createAdminSupabaseClient } = await import("@/lib/supabase/admin");
  const admin = createAdminSupabaseClient();

  const { data: basketRow } = await admin
    .from("baskets")
    .select("id, module_ids")
    .eq("name", basketName)
    .single();
  if (!basketRow) return;

  await admin
    .from("subscriptions")
    .upsert(
      {
        workspace_id: workspaceId,
        basket_id: (basketRow as unknown as { id: string }).id,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 864e5).toISOString(),
        trial_end: null,
      } as never,
      { onConflict: "workspace_id" },
    );

  // Replace workspace modules
  await admin.from("workspace_modules").delete().eq("workspace_id", workspaceId);
  const slugs = ((basketRow as unknown as { module_ids: string[] | null }).module_ids ?? []) as string[];
  if (slugs.length > 0) {
    const { data: modules } = await admin
      .from("modules")
      .select("id, slug")
      .in("slug", slugs);
    const rows = ((modules ?? []) as unknown as { id: string; slug: string }[]).map((m) => ({
      workspace_id: workspaceId,
      module_id: m.id,
      source: "basket",
      enabled: true,
    }));
    if (rows.length > 0) {
      await admin.from("workspace_modules").insert(rows as never);
    }
  }
}

export async function cancelSubscriptionAction(): Promise<void> {
  const session = await requireWorkspaceAdmin();
  const { cancelSubscription } = await import("@/lib/stripe/subscriptions");
  try {
    await cancelSubscription(session.workspaceId);
  } catch {
    // demo mode — set cancel flag locally
    const { createAdminSupabaseClient } = await import("@/lib/supabase/admin");
    const admin = createAdminSupabaseClient();
    await admin
      .from("subscriptions")
      .update({ cancel_at_period_end: true } as never)
      .eq("workspace_id", session.workspaceId);
  }
  invalidateWorkspaceAccess(session.workspaceId);
  revalidatePath("/configuracoes/billing");
  redirect("/configuracoes/billing?status=canceled");
}

export async function openBillingPortal(): Promise<void> {
  const session = await requireWorkspaceAdmin();
  const env = serverEnv();
  if (!env.STRIPE_SECRET_KEY) {
    redirect("/configuracoes/billing?error=stripe_not_configured");
  }
  const { createBillingPortalSession } = await import("@/lib/stripe/checkout");
  const portal = await createBillingPortalSession(session.workspaceId);
  redirect(portal.url);
}

/** Placeholder to keep session typed */
void getSession;
