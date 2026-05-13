"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/guards";
import { serverEnv, publicEnv } from "@/lib/env";
import { findCreditPack } from "@/lib/billing/credits";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

// New tables (credit_purchases) are not in the generated database.types yet,
// so we relax `from()` typing for those calls.
type RelaxedClient = {
  from: (table: string) => {
    insert: (body: unknown) => Promise<{ error: { message: string } | null }>;
  };
};
function adm(): RelaxedClient {
  return createAdminSupabaseClient() as unknown as RelaxedClient;
}

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const purchaseSchema = z.object({
  pack_id: z.enum(["small", "medium", "large"]),
  return_url: z.string().url().optional(),
});

export interface PurchaseSession {
  invoice_url: string;
  payment_id: string;
  gateway: "asaas" | "mercadopago" | "stripe";
  pack_id: string;
  credits: number;
}

export async function startCreditPurchase(
  input: unknown,
): Promise<ActionResult<PurchaseSession>> {
  const parsed = purchaseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const pack = findCreditPack(parsed.data.pack_id);
  if (!pack) return { ok: false, error: "Pacote invalido" };

  const env = serverEnv();
  const gateway = env.PAYMENT_GATEWAY ?? (env.ASAAS_API_KEY ? "asaas" : env.MERCADO_PAGO_ACCESS_TOKEN ? "mercadopago" : null);
  if (!gateway) {
    return {
      ok: false,
      error: "Gateway de pagamento nao configurado. Configure ASAAS_API_KEY ou MERCADO_PAGO_ACCESS_TOKEN.",
    };
  }

  const description = `${pack.credits} creditos AdSales Hub`;

  try {
    if (gateway === "asaas") {
      return await startAsaasPurchase({
        workspaceId: session.workspaceId,
        userId: session.user.id,
        userEmail: session.user.email ?? "",
        userName: session.user.email ?? "Usuario",
        pack,
        description,
      });
    }
    if (gateway === "mercadopago") {
      return await startMercadoPagoPurchase({
        workspaceId: session.workspaceId,
        userId: session.user.id,
        userEmail: session.user.email ?? "",
        pack,
        description,
        returnUrl: parsed.data.return_url,
      });
    }
    return { ok: false, error: "Gateway nao suportado para compra de creditos" };
  } catch (err) {
    console.error("[credits] startPurchase falhou", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Falha ao iniciar pagamento",
    };
  }
}

async function startAsaasPurchase(opts: {
  workspaceId: string;
  userId: string;
  userEmail: string;
  userName: string;
  pack: { id: string; credits: number; priceCents: number };
  description: string;
}): Promise<ActionResult<PurchaseSession>> {
  const { findOrCreateCustomer, createCheckoutLink } = await import("@/lib/payments/asaas");
  const customer = await findOrCreateCustomer({
    workspaceId: opts.workspaceId,
    name: opts.userName,
    email: opts.userEmail,
  });

  const externalRef = `wks=${opts.workspaceId};pack=${opts.pack.id}`;
  const link = await createCheckoutLink({
    customerId: customer.id,
    amountCents: opts.pack.priceCents,
    description: opts.description,
    externalReference: externalRef,
  });

  await adm().from("credit_purchases").insert({
    workspace_id: opts.workspaceId,
    user_id: opts.userId,
    pack_id: opts.pack.id,
    credits: opts.pack.credits,
    amount_cents: opts.pack.priceCents,
    currency: "BRL",
    gateway: "asaas",
    gateway_payment_id: link.paymentId,
    status: "pending",
    invoice_url: link.invoiceUrl,
  } as never);

  revalidatePath("/configuracoes/billing/creditos");

  return {
    ok: true,
    data: {
      invoice_url: link.invoiceUrl,
      payment_id: link.paymentId,
      gateway: "asaas",
      pack_id: opts.pack.id,
      credits: opts.pack.credits,
    },
  };
}

async function startMercadoPagoPurchase(opts: {
  workspaceId: string;
  userId: string;
  userEmail: string;
  pack: { id: string; credits: number; priceCents: number };
  description: string;
  returnUrl?: string;
}): Promise<ActionResult<PurchaseSession>> {
  const env = serverEnv();
  if (!env.MERCADO_PAGO_ACCESS_TOKEN) {
    return { ok: false, error: "MERCADO_PAGO_ACCESS_TOKEN ausente" };
  }
  const externalRef = `wks=${opts.workspaceId};pack=${opts.pack.id}`;
  const successUrl = opts.returnUrl ?? `${publicEnv.NEXT_PUBLIC_APP_URL}/configuracoes/billing/creditos?status=success`;
  const failureUrl = `${publicEnv.NEXT_PUBLIC_APP_URL}/configuracoes/billing/creditos?status=failure`;

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      items: [
        {
          title: opts.description,
          quantity: 1,
          currency_id: "BRL",
          unit_price: opts.pack.priceCents / 100,
        },
      ],
      external_reference: externalRef,
      payer: { email: opts.userEmail || undefined },
      back_urls: { success: successUrl, failure: failureUrl, pending: successUrl },
      auto_return: "approved",
      notification_url: `${publicEnv.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: `Mercado Pago HTTP ${res.status}: ${body.slice(0, 200)}` };
  }
  const json = (await res.json()) as { id?: string; init_point?: string };
  if (!json.id || !json.init_point) {
    return { ok: false, error: "Resposta invalida do Mercado Pago" };
  }

  await adm().from("credit_purchases").insert({
    workspace_id: opts.workspaceId,
    user_id: opts.userId,
    pack_id: opts.pack.id,
    credits: opts.pack.credits,
    amount_cents: opts.pack.priceCents,
    currency: "BRL",
    gateway: "mercadopago",
    gateway_payment_id: json.id,
    status: "pending",
    invoice_url: json.init_point,
  } as never);

  revalidatePath("/configuracoes/billing/creditos");

  return {
    ok: true,
    data: {
      invoice_url: json.init_point,
      payment_id: json.id,
      gateway: "mercadopago",
      pack_id: opts.pack.id,
      credits: opts.pack.credits,
    },
  };
}
