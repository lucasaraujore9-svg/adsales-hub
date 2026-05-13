import "server-only";

import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { requireServerEnv } from "@/lib/env";
import {
  syncInvoiceFromStripe,
  syncSubscriptionFromStripe,
} from "@/lib/stripe/sync";

export function verifyWebhook(
  rawBody: string,
  signature: string | null,
): Stripe.Event {
  if (!signature) throw new Error("Missing stripe-signature header");
  const secret = requireServerEnv("STRIPE_WEBHOOK_SECRET");
  return getStripe().webhooks.constructEvent(rawBody, signature, secret);
}

export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const subscription = await getStripe().subscriptions.retrieve(
          session.subscription as string,
        );
        await syncSubscriptionFromStripe(subscription);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.trial_will_end": {
      await syncSubscriptionFromStripe(
        event.data.object as Stripe.Subscription,
      );
      break;
    }
    case "invoice.paid":
    case "invoice.payment_succeeded":
    case "invoice.payment_failed":
    case "invoice.finalized":
    case "invoice.voided": {
      await syncInvoiceFromStripe(event.data.object as Stripe.Invoice);
      break;
    }
    default:
      // Ignore events we don't care about; they still return 200 OK.
      break;
  }
}
