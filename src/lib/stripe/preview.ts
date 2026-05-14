import "server-only";

import Stripe from "stripe";

let cached: Stripe | null = null;
function stripe(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  cached = new Stripe(key);
  return cached;
}

export interface PreviewResult {
  /** Valor a cobrar imediatamente (prorata) em centavos. */
  immediateCharge: number;
  /** Valor da próxima fatura recorrente em centavos. */
  nextChargeAmount: number;
  /** Data da próxima cobrança (ISO). */
  nextChargeDate: string | null;
  /** Moeda. */
  currency: string;
}

/**
 * Faz preview da mudança de plano via Stripe (`subscriptions.upcoming`).
 *
 * Em dev sem `STRIPE_SECRET_KEY`, retorna estimativa simples
 * (prorata = diferença * (dias restantes / 30)).
 */
export async function previewSubscriptionChange(params: {
  subscriptionId: string;
  newPriceId: string;
}): Promise<PreviewResult | null> {
  const s = stripe();
  if (!s) return null;

  try {
    const sub = await s.subscriptions.retrieve(params.subscriptionId, {
      expand: ["items.data"],
    });
    const itemId = sub.items.data[0]?.id;
    if (!itemId) return null;

    const upcoming = await s.invoices.retrieveUpcoming({
      subscription: params.subscriptionId,
      subscription_items: [
        {
          id: itemId,
          price: params.newPriceId,
        },
      ],
      subscription_proration_behavior: "create_prorations",
    });

    const nextDate = upcoming.next_payment_attempt
      ? new Date(upcoming.next_payment_attempt * 1000).toISOString()
      : sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null;

    return {
      immediateCharge: upcoming.amount_due,
      nextChargeAmount: upcoming.total,
      nextChargeDate: nextDate,
      currency: upcoming.currency.toUpperCase(),
    };
  } catch (err) {
    console.error("[stripe/preview] failed", err);
    return null;
  }
}
