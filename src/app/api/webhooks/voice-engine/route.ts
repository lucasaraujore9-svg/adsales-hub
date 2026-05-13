import { NextResponse, type NextRequest } from "next/server";
import { processVoiceWebhook, verifyWebhookSecret } from "@/lib/telephony/webhook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-voice-engine-secret");
  if (!verifyWebhookSecret(signature, process.env.VOICE_ENGINE_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.message) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    await processVoiceWebhook(body);
  } catch (err) {
    console.error("[voice-engine/webhook] handler failed", err);
  }

  return NextResponse.json({ received: true });
}
