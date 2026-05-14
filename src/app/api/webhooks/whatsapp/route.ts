import { NextResponse, type NextRequest } from "next/server";
import { requireServerEnv } from "@/lib/env";
import {
  processWhatsAppWebhook,
  verifyWhatsAppSubscription,
} from "@/lib/whatsapp/webhooks";
import { checkMetaSignatureOrReject } from "@/lib/webhooks/verify";

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
  const rawBody = await request.text();
  const reject = checkMetaSignatureOrReject(
    rawBody,
    request,
    process.env.META_APP_SECRET,
    "whatsapp",
  );
  if (reject) return reject;

  let payload: unknown = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const p = payload as { object?: string; entry?: unknown } | null;
  if (!p || p.object !== "whatsapp_business_account" || !p.entry) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  try {
    await processWhatsAppWebhook(p as Parameters<typeof processWhatsAppWebhook>[0]);
  } catch (err) {
    console.error("[whatsapp/webhook] handler failed", err);
    // Always return 200 to prevent Meta from retrying en masse
  }
  return NextResponse.json({ received: true });
}
