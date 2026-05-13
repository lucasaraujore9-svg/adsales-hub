import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireWorkspaceAdmin } from "@/lib/auth/guards";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { basketPriceId } from "@/lib/stripe/products";

const bodySchema = z.object({
  basket: z.enum(["operacao", "crescimento", "escala"]).optional(),
  price_id: z.string().optional(),
  trial_days: z.number().int().min(0).max(30).optional(),
  modules: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const session = await requireWorkspaceAdmin();

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const priceId = parsed.data.price_id ?? (parsed.data.basket ? basketPriceId(parsed.data.basket) : null);
  if (!priceId) {
    return NextResponse.json({ error: "price_id_not_configured" }, { status: 400 });
  }

  const checkout = await createCheckoutSession({
    workspaceId: session.workspaceId,
    email: session.profile.email,
    priceId,
    trialDays: parsed.data.trial_days,
    addModules: parsed.data.modules,
    basket: parsed.data.basket,
  });

  return NextResponse.json({ url: checkout.url, session_id: checkout.id });
}
