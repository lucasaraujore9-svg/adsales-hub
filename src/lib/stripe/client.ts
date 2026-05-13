import "server-only";

import Stripe from "stripe";
import { requireServerEnv } from "@/lib/env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  _stripe = new Stripe(requireServerEnv("STRIPE_SECRET_KEY"), {
    typescript: true,
    telemetry: false,
    appInfo: {
      name: "adsales-hub",
      version: "0.1.0",
    },
  });
  return _stripe;
}
