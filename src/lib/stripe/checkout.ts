import "server-only";

import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { publicEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export interface CreateCheckoutInput {
  workspaceId: string;
  email: string;
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  trialDays?: number;
  addModules?: string[];
  basket?: string;
}

export async function createCheckoutSession(
  input: CreateCheckoutInput,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const customerId = await ensureStripeCustomer(input.workspaceId, input.email);

  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: input.priceId, quantity: 1 }],
    success_url:
      input.successUrl ??
      `${publicEnv.NEXT_PUBLIC_APP_URL}/configuracoes/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:
      input.cancelUrl ??
      `${publicEnv.NEXT_PUBLIC_APP_URL}/configuracoes/billing?status=cancel`,
    subscription_data: {
      trial_period_days: input.trialDays,
      metadata: {
        workspace_id: input.workspaceId,
        basket: input.basket ?? "",
        modules: (input.addModules ?? []).join(","),
      },
    },
    metadata: {
      workspace_id: input.workspaceId,
      basket: input.basket ?? "",
    },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    automatic_tax: { enabled: false },
  });
}

async function ensureStripeCustomer(workspaceId: string, email: string): Promise<string> {
  const admin = createAdminSupabaseClient();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id as string;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email,
    metadata: { workspace_id: workspaceId },
  });

  await admin
    .from("subscriptions")
    .upsert(
      {
        workspace_id: workspaceId,
        stripe_customer_id: customer.id,
        status: "incomplete",
      },
      { onConflict: "workspace_id" },
    );

  return customer.id;
}

export async function createBillingPortalSession(
  workspaceId: string,
  returnUrl?: string,
): Promise<Stripe.BillingPortal.Session> {
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("workspace_id", workspaceId)
    .single();

  if (!data?.stripe_customer_id) {
    throw new Error("No Stripe customer for workspace");
  }

  return getStripe().billingPortal.sessions.create({
    customer: data.stripe_customer_id as string,
    return_url:
      returnUrl ??
      `${publicEnv.NEXT_PUBLIC_APP_URL}/configuracoes/billing`,
  });
}
