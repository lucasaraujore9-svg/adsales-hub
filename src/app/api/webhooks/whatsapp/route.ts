import { NextResponse, type NextRequest } from "next/server";
import { requireServerEnv } from "@/lib/env";
import {
  processWhatsAppWebhook,
  verifyWhatsAppSubscription,
} from "@/lib/whatsapp/webhooks";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const verifyToken = requireServerEnv("WHATSAPP_VERIFY_TOKEN");
  const challenge = verifyWhatsAppSubscription(
    params.get("hub.mode"),
    params.get("hub.verify_token"),
    params.get("hub.challenge"),
    verifyToken,
  );
  if (!challenge) {
    return NextResponse.json({ error: "verify_failed" }, { status: 403 });
  }
  return new NextResponse(challenge, { status: 200 });
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  if (!payload || payload.object !== "whatsapp_business_account") {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  try {
    await processWhatsAppWebhook(payload);
  } catch (err) {
    console.error("[whatsapp/webhook] handler failed", err);
    // Always return 200 to prevent Meta from retrying en masse
  }
  return NextResponse.json({ received: true });
}
