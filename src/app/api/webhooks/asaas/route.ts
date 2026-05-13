import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { isPaidEvent, verifyAsaasWebhook, type AsaasWebhookEvent } from "@/lib/payments/asaas";
import { recordCreditPurchase } from "@/lib/billing/credits";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const headerToken = req.headers.get("asaas-access-token");
  if (!verifyAsaasWebhook(headerToken)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let evt: AsaasWebhookEvent;
  try {
    evt = (await req.json()) as AsaasWebhookEvent;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isPaidEvent(evt) || !evt.payment) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const admin = createAdminSupabaseClient() as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (col: string, val: unknown) => {
          eq: (col: string, val: unknown) => {
            maybeSingle: () => Promise<{ data: unknown }>;
          };
        };
      };
      update: (body: unknown) => {
        eq: (col: string, val: unknown) => Promise<{ error: { message: string } | null }>;
      };
    };
  };

  const { data: purchase } = await admin
    .from("credit_purchases")
    .select("id, workspace_id, credits, status")
    .eq("gateway", "asaas")
    .eq("gateway_payment_id", evt.payment.id)
    .maybeSingle();

  const row = purchase as {
    id: string;
    workspace_id: string;
    credits: number;
    status: string;
  } | null;

  if (!row) {
    console.warn("[asaas] webhook for unknown payment", evt.payment.id);
    return NextResponse.json({ ok: true, unknown: true });
  }

  if (row.status === "paid") {
    return NextResponse.json({ ok: true, already_paid: true });
  }

  const result = await recordCreditPurchase({
    workspaceId: row.workspace_id,
    amount: row.credits,
    referenceId: `asaas:${evt.payment.id}`,
    meta: { gateway: "asaas", payment_id: evt.payment.id, event: evt.event },
  });

  if (result.ok) {
    await admin
      .from("credit_purchases")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  }

  return NextResponse.json({ ok: result.ok, balance: result.balance });
}

export function GET() {
  return NextResponse.json({ ok: true, method: "GET" });
}
