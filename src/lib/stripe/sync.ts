import "server-only";

import type Stripe from "stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { invalidateWorkspaceAccess } from "@/lib/billing/feature-gate";

type InternalStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "suspended"
  | "incomplete";

function mapStatus(stripeStatus: Stripe.Subscription.Status): InternalStatus {
  switch (stripeStatus) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    case "unpaid":
      return "suspended";
    case "incomplete":
      return "incomplete";
    case "paused":
      return "suspended";
    default:
      return "incomplete";
  }
}

function toDate(value: number | null | undefined) {
  return value ? new Date(value * 1000).toISOString() : null;
}

export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const workspaceId =
    (subscription.metadata?.workspace_id as string | undefined) ?? null;

  if (!workspaceId) {
    console.warn("[stripe/sync] missing workspace_id in subscription metadata", subscription.id);
    return null;
  }

  const admin = createAdminSupabaseClient();

  const item = subscription.items.data[0] as unknown as
    | { current_period_end?: number; current_period_start?: number }
    | undefined;
  const currentPeriodEnd =
    (subscription as unknown as { current_period_end?: number }).current_period_end ??
    item?.current_period_end;
  const currentPeriodStart =
    (subscription as unknown as { current_period_start?: number }).current_period_start ??
    item?.current_period_start;

  const patch = {
    workspace_id: workspaceId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    status: mapStatus(subscription.status),
    current_period_start: toDate(currentPeriodStart),
    current_period_end: toDate(currentPeriodEnd),
    trial_end: toDate(subscription.trial_end),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: toDate(subscription.canceled_at),
    updated_at: new Date().toISOString(),
  };

  await admin
    .from("subscriptions")
    .upsert(patch, { onConflict: "workspace_id" });

  invalidateWorkspaceAccess(workspaceId);
  return workspaceId;
}

export async function syncInvoiceFromStripe(invoice: Stripe.Invoice) {
  const admin = createAdminSupabaseClient();

  const invoiceSubscriptionId =
    (invoice as unknown as { subscription?: string | Stripe.Subscription | null }).subscription;

  let workspaceId: string | null = null;
  if (typeof invoiceSubscriptionId === "string") {
    const { data } = await admin
      .from("subscriptions")
      .select("workspace_id")
      .eq("stripe_subscription_id", invoiceSubscriptionId)
      .maybeSingle();
    workspaceId = (data?.workspace_id as string | undefined) ?? null;
  } else if (typeof invoiceSubscriptionId === "object" && invoiceSubscriptionId) {
    workspaceId =
      (invoiceSubscriptionId.metadata?.workspace_id as string | undefined) ?? null;
  }

  if (!workspaceId) return;

  await admin
    .from("invoices")
    .upsert(
      {
        workspace_id: workspaceId,
        stripe_invoice_id: invoice.id,
        number: invoice.number,
        amount: (invoice.amount_paid ?? invoice.amount_due ?? 0) / 100,
        currency: (invoice.currency ?? "brl").toUpperCase(),
        status: invoice.status ?? "open",
        payment_method: (invoice.payment_settings?.payment_method_types?.[0] ??
          "credit_card") as string,
        pdf_url: invoice.invoice_pdf,
        hosted_invoice_url: invoice.hosted_invoice_url,
        due_date: invoice.due_date
          ? new Date(invoice.due_date * 1000).toISOString().slice(0, 10)
          : null,
        paid_at: invoice.status === "paid" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_invoice_id" },
    );
}
