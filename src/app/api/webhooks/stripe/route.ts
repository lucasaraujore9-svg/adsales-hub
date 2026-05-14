import { NextResponse, type NextRequest } from "next/server";
import { handleStripeEvent, verifyWebhook } from "@/lib/stripe/webhooks";
import { isAlreadyProcessed, markProcessed } from "@/lib/webhooks/idempotency";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = verifyWebhook(rawBody, signature);
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  // Idempotência: Stripe pode reenviar o mesmo evento em retry
  if (await isAlreadyProcessed("stripe", event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    await handleStripeEvent(event);
    await markProcessed("stripe", event.id, { eventType: event.type });
  } catch (err) {
    console.error("[stripe/webhook] handler failed", event.type, err);
    // Return 500 so Stripe retries (não marca como processado)
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
