import "server-only";

import { serverEnv } from "@/lib/env";

const DEFAULT_BASE = "https://api.asaas.com/v3";
const SANDBOX_BASE = "https://sandbox.asaas.com/api/v3";

function asaasBase(): string {
  const env = serverEnv();
  if (env.ASAAS_BASE_URL) return env.ASAAS_BASE_URL.replace(/\/$/, "");
  return DEFAULT_BASE;
}

function asaasKey(): string {
  const key = serverEnv().ASAAS_API_KEY;
  if (!key) throw new Error("ASAAS_API_KEY não configurado");
  return key;
}

interface AsaasFetchOpts {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: object;
  query?: Record<string, string | number | undefined>;
}

async function asaasFetch<T>(path: string, opts: AsaasFetchOpts = {}): Promise<T> {
  const url = new URL(`${asaasBase()}${path.startsWith("/") ? path : `/${path}`}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      access_token: asaasKey(),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  const json = text ? (JSON.parse(text) as unknown) : null;
  if (!res.ok) {
    const errMsg =
      (json as { errors?: { description?: string }[] } | null)?.errors?.[0]?.description ??
      `Asaas HTTP ${res.status}`;
    throw new Error(errMsg);
  }
  return json as T;
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string | null;
}

export async function findOrCreateCustomer(opts: {
  workspaceId: string;
  name: string;
  email: string;
  cpfCnpj?: string;
}): Promise<AsaasCustomer> {
  const search = await asaasFetch<{ data: AsaasCustomer[] }>("/customers", {
    query: { externalReference: opts.workspaceId },
  });
  if (search.data?.[0]) return search.data[0];

  const created = await asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    body: {
      name: opts.name,
      email: opts.email,
      cpfCnpj: opts.cpfCnpj,
      externalReference: opts.workspaceId,
      notificationDisabled: false,
    },
  });
  return created;
}

export type AsaasBillingType = "PIX" | "CREDIT_CARD" | "BOLETO" | "UNDEFINED";

export interface AsaasPayment {
  id: string;
  status: string;
  invoiceUrl: string | null;
  bankSlipUrl?: string | null;
  pixTransaction?: string | null;
  value: number;
  netValue?: number;
  externalReference?: string | null;
  billingType: AsaasBillingType;
  customer: string;
  description?: string | null;
}

export async function createCharge(opts: {
  customerId: string;
  amountCents: number;
  description: string;
  externalReference: string;
  billingType?: AsaasBillingType;
  dueDateIso?: string;
}): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    body: {
      customer: opts.customerId,
      billingType: opts.billingType ?? "UNDEFINED",
      value: opts.amountCents / 100,
      dueDate: opts.dueDateIso ?? new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10),
      description: opts.description,
      externalReference: opts.externalReference,
      postalService: false,
    },
  });
}

export interface CheckoutLink {
  invoiceUrl: string;
  paymentId: string;
}

/**
 * Hosted checkout: create a charge with billingType=UNDEFINED so customer can
 * choose PIX, card, or boleto. Returns the Asaas-hosted invoice URL.
 */
export async function createCheckoutLink(opts: {
  customerId: string;
  amountCents: number;
  description: string;
  externalReference: string;
}): Promise<CheckoutLink> {
  const payment = await createCharge({
    customerId: opts.customerId,
    amountCents: opts.amountCents,
    description: opts.description,
    externalReference: opts.externalReference,
    billingType: "UNDEFINED",
  });
  if (!payment.invoiceUrl) {
    throw new Error("Asaas não retornou invoiceUrl");
  }
  return { invoiceUrl: payment.invoiceUrl, paymentId: payment.id };
}

export interface AsaasWebhookEvent {
  event: string;
  payment?: AsaasPayment;
}

const PAID_STATUSES = new Set([
  "RECEIVED",
  "CONFIRMED",
  "RECEIVED_IN_CASH",
  "PAYMENT_CONFIRMED",
]);

export function isPaidEvent(evt: AsaasWebhookEvent): boolean {
  if (!evt.payment) return false;
  if (
    evt.event === "PAYMENT_RECEIVED" ||
    evt.event === "PAYMENT_CONFIRMED" ||
    evt.event === "PAYMENT_RECEIVED_IN_CASH"
  ) {
    return true;
  }
  return PAID_STATUSES.has(evt.payment.status);
}

/**
 * Validate Asaas webhook token. Asaas posts the configured token in the
 * `asaas-access-token` header.
 */
export function verifyAsaasWebhook(headerToken: string | null): boolean {
  const expected = serverEnv().ASAAS_WEBHOOK_TOKEN;
  if (!expected) return true; // dev mode: allow if not configured
  return headerToken === expected;
}
