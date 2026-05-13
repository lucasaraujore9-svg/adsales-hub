import "server-only";

import { serverEnv } from "@/lib/env";

/**
 * Map of basket slug to Stripe price ID. Each entry is resolved from
 * environment variables — populate them via the Stripe dashboard or via
 * scripts/stripe-seed-products.ts (to be added) after creating products.
 */
export function basketPriceId(basket: "operacao" | "crescimento" | "escala"): string | null {
  const env = serverEnv();
  switch (basket) {
    case "operacao":
      return env.STRIPE_PRICE_OPERACAO ?? null;
    case "crescimento":
      return env.STRIPE_PRICE_CRESCIMENTO ?? null;
    case "escala":
      return env.STRIPE_PRICE_ESCALA ?? null;
    default:
      return null;
  }
}
