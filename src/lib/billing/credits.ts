import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export type CreditKind =
  | "image"
  | "image_premium"
  | "video"
  | "video_premium";

export interface CreditBalance {
  balance: number;
  monthlyAllowance: number;
  monthlyAllowanceRemaining: number;
  totalPurchased: number;
  totalSpent: number;
  lastGrantPeriod: string | null;
  unlimited: boolean;
}

export interface CreditPricing {
  kind: string;
  cost: number;
  display_name: string;
  description: string | null;
  is_active: boolean;
}

export interface ConsumeOk {
  ok: true;
  charged: number;
  balance: number;
  transaction_id: string;
  unlimited?: boolean;
}

export interface ConsumeError {
  ok: false;
  error: "insufficient_credits" | "unknown_kind" | "inactive_kind";
  required?: number;
  balance?: number;
}

export type ConsumeResult = ConsumeOk | ConsumeError;

export async function getCreditBalance(workspaceId: string): Promise<CreditBalance> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("workspace_credits")
    .select(
      "balance, monthly_allowance, monthly_allowance_remaining, total_purchased, total_spent, last_grant_period, unlimited",
    )
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const row = (data ?? null) as {
    balance: number;
    monthly_allowance: number;
    monthly_allowance_remaining: number;
    total_purchased: number;
    total_spent: number;
    last_grant_period: string | null;
    unlimited: boolean | null;
  } | null;

  return {
    balance: row?.balance ?? 0,
    monthlyAllowance: row?.monthly_allowance ?? 0,
    monthlyAllowanceRemaining: row?.monthly_allowance_remaining ?? 0,
    totalPurchased: row?.total_purchased ?? 0,
    totalSpent: row?.total_spent ?? 0,
    lastGrantPeriod: row?.last_grant_period ?? null,
    unlimited: Boolean(row?.unlimited),
  };
}

export async function listCreditPricing(): Promise<CreditPricing[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("credit_pricing")
    .select("kind, cost, display_name, description, is_active")
    .eq("is_active", true)
    .order("cost", { ascending: true });
  return (data ?? []) as unknown as CreditPricing[];
}

export async function getCreditCost(kind: CreditKind): Promise<number | null> {
  const all = await listCreditPricing();
  const row = all.find((r) => r.kind === kind);
  return row?.cost ?? null;
}

export async function consumeCredits(opts: {
  workspaceId: string;
  kind: CreditKind;
  referenceType?: string;
  referenceId?: string;
  meta?: Record<string, unknown>;
}): Promise<ConsumeResult> {
  const { adminRpc } = await import("@/lib/supabase/admin");
  const { data, error } = await adminRpc("consume_credits", {
    p_workspace_id: opts.workspaceId,
    p_kind: opts.kind,
    p_reference_type: opts.referenceType ?? null,
    p_reference_id: opts.referenceId ?? null,
    p_meta: opts.meta ?? {},
  });
  if (error) {
    console.error("[credits] consume_credits rpc error", error);
    return { ok: false, error: "unknown_kind" };
  }
  return data as ConsumeResult;
}

export async function refundCredits(
  transactionId: string,
  reason = "provider_failed",
): Promise<{ ok: boolean; refunded?: number; error?: string }> {
  const { adminRpc } = await import("@/lib/supabase/admin");
  const { data, error } = await adminRpc("refund_credits", {
    p_transaction_id: transactionId,
    p_reason: reason,
  });
  if (error) return { ok: false, error: error.message };
  return data as { ok: boolean; refunded?: number; error?: string };
}

export async function recordCreditPurchase(opts: {
  workspaceId: string;
  amount: number;
  referenceId: string;
  meta?: Record<string, unknown>;
}): Promise<{ ok: boolean; balance?: number; idempotent?: boolean }> {
  const { adminRpc } = await import("@/lib/supabase/admin");
  const { data, error } = await adminRpc("purchase_credits", {
    p_workspace_id: opts.workspaceId,
    p_amount: opts.amount,
    p_reference_id: opts.referenceId,
    p_meta: opts.meta ?? {},
  });
  if (error) return { ok: false };
  return data as { ok: boolean; balance?: number; idempotent?: boolean };
}

export interface CreditTxRow {
  id: string;
  type: "grant" | "spend" | "refund" | "purchase" | "expire" | "adjust";
  amount: number;
  kind: string | null;
  reference_type: string | null;
  reference_id: string | null;
  refunded: boolean;
  meta: Record<string, unknown>;
  created_at: string;
}

export async function listCreditTransactions(
  workspaceId: string,
  limit = 50,
): Promise<CreditTxRow[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("credit_transactions")
    .select(
      "id, type, amount, kind, reference_type, reference_id, refunded, meta, created_at",
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as CreditTxRow[];
}

/**
 * Predefined credit packs for purchase. Pricing is in BRL cents.
 * Charges are created via Asaas (or Mercado Pago) at purchase time using
 * `priceCents`; the gateway price IDs are not required.
 */
export interface CreditPack {
  id: "small" | "medium" | "large";
  credits: number;
  priceCents: number;
  badge?: string;
}

export function listCreditPacks(): CreditPack[] {
  return [
    { id: "small",  credits: 100,  priceCents: 2900 },
    { id: "medium", credits: 500,  priceCents: 9900,  badge: "Mais vendido" },
    { id: "large",  credits: 2000, priceCents: 29900, badge: "Melhor valor" },
  ];
}

export function findCreditPack(id: string): CreditPack | undefined {
  return listCreditPacks().find((p) => p.id === id);
}
