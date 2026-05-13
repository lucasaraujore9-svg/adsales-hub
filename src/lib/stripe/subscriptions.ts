import "server-only";

import { getStripe } from "@/lib/stripe/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function upgradeSubscription(
  stripeSubscriptionId: string,
  newPriceId: string,
): Promise<void> {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const itemId = subscription.items.data[0]?.id;
  if (!itemId) throw new Error("Subscription has no items to upgrade");

  await stripe.subscriptions.update(stripeSubscriptionId, {
    items: [{ id: itemId, price: newPriceId }],
    proration_behavior: "always_invoice",
  });
}

export async function downgradeSubscription(
  stripeSubscriptionId: string,
  newPriceId: string,
): Promise<void> {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const itemId = subscription.items.data[0]?.id;
  if (!itemId) throw new Error("Subscription has no items to downgrade");

  await stripe.subscriptions.update(stripeSubscriptionId, {
    items: [{ id: itemId, price: newPriceId }],
    proration_behavior: "none",
  });
}

export async function cancelSubscription(
  workspaceId: string,
  reason?: string,
): Promise<void> {
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("workspace_id", workspaceId)
    .single();

  if (!data?.stripe_subscription_id) {
    throw new Error("No Stripe subscription for workspace");
  }

  const stripe = getStripe();
  await stripe.subscriptions.update(data.stripe_subscription_id as string, {
    cancel_at_period_end: true,
    cancellation_details: reason ? { comment: reason } : undefined,
  });

  await admin
    .from("subscriptions")
    .update({
      cancel_at_period_end: true,
      cancel_reason: reason ?? null,
    })
    .eq("workspace_id", workspaceId);
}

export async function resumeSubscription(workspaceId: string): Promise<void> {
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("workspace_id", workspaceId)
    .single();

  if (!data?.stripe_subscription_id) {
    throw new Error("No Stripe subscription for workspace");
  }

  const stripe = getStripe();
  await stripe.subscriptions.update(data.stripe_subscription_id as string, {
    cancel_at_period_end: false,
  });

  await admin
    .from("subscriptions")
    .update({
      cancel_at_period_end: false,
      cancel_reason: null,
    })
    .eq("workspace_id", workspaceId);
}
