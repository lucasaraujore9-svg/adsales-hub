import { NextResponse, type NextRequest } from "next/server";
import { handleResendEvent } from "@/lib/email/tracking";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.type || !body?.data) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    await handleResendEvent(body);
  } catch (err) {
    console.error("[resend/webhook] handler failed", err);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
