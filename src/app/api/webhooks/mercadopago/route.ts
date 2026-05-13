import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { recordCreditPurchase } from "@/lib/billing/credits";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface MPNotification {
  type?: string;
  action?: string;
  data?: { id?: string };
}

export async function POST(req: NextRequest) {
  let payload: MPNotification;
  try {
    payload = (await req.json()) as MPNotification;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const env = serverEnv();
  if (!env.MERCADO_PAGO_ACCESS_TOKEN) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const isPaymentEvent = payload.type === "payment" || payload.action?.startsWith("payment.");
  const paymentId = payload.data?.id;
  if (!isPaymentEvent || !paymentId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Lookup the payment from Mercado Pago to get external_reference + status
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}` },
  });
  if (!res.ok) {
    return NextResponse.json({ error: "lookup_failed" }, { status: 502 });
  }
  const payment = (await res.json()) as {
    status?: string;
    external_reference?: string;
    order?: { id?: string };
  };

  if (payment.status !== "approved" || !payment.external_reference) {
    return NextResponse.json({ ok: true, ignored: true, status: payment.status });
  }

  // Find the matching pending credit_purchase by external_reference
  const admin = createAdminSupabaseClient() as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: unknown) => {
          eq: (col: string, val: unknown) => Promise<{ data: unknown }>;
        };
      };
      update: (body: unknown) => {
        eq: (col: string, val: unknown) => Promise<{ error: { message: string } | null }>;
      };
    };
  };

  const { data: pendingRows } = await admin
    .from("credit_purchases")
    .select("id, workspace_id, credits, status, gateway_payment_id")
    .eq("gateway", "mercadopago")
    .eq("status", "pending");

  const candidates = (pendingRows as unknown as {
    id: string;
    workspace_id: string;
    credits: number;
    status: string;
    gateway_payment_id: string;
  }[] | null) ?? [];

  // The MP preference id is what we stored as gateway_payment_id; the webhook
  // gives us the payment id (different). Match on external_reference instead.
  const ref = payment.external_reference;
  const wksMatch = ref.match(/wks=([^;]+)/);
  const packMatch = ref.match(/pack=([^;]+)/);
  if (!wksMatch || !packMatch) {
    return NextResponse.json({ ok: true, ignored: true, reason: "bad_ref" });
  }
  const purchase = candidates.find(
    (c) => c.workspace_id === wksMatch[1],
  );
  if (!purchase) {
    return NextResponse.json({ ok: true, unknown: true });
  }

  const result = await recordCreditPurchase({
    workspaceId: purchase.workspace_id,
    amount: purchase.credits,
    referenceId: `mercadopago:${paymentId}`,
    meta: { gateway: "mercadopago", payment_id: paymentId, preference_id: purchase.gateway_payment_id },
  });

  if (result.ok) {
    await admin
      .from("credit_purchases")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", purchase.id);
  }

  return NextResponse.json({ ok: result.ok });
}

export function GET() {
  return NextResponse.json({ ok: true });
}
