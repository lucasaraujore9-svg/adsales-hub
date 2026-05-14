"use server";

import { getSession } from "@/lib/auth/guards";

export type PreviewResponse = {
  ok: boolean;
  immediateCharge?: number;
  nextChargeAmount?: number;
  nextChargeDate?: string | null;
  currency?: string;
  error?: string;
  simulated?: boolean;
};

/**
 * Pre-visualiza mudança de plano via Stripe. Se Stripe não estiver
 * configurado, retorna estimativa baseada no valor configurado no plano.
 */
export async function previewPlanChange(input: {
  newPlanId: "operacao" | "crescimento" | "escala";
  interval: "month" | "year";
}): Promise<PreviewResponse> {
  await getSession();

  const { PLANS } = await import("@/lib/billing/plans");
  const plan = PLANS.find((p) => p.id === input.newPlanId);
  if (!plan) return { ok: false, error: "Plano inválido." };

  const priceMonthly = input.interval === "year" ? plan.yearly : plan.monthly;
  const total = priceMonthly * (input.interval === "year" ? 12 : 1);

  // Em fase MVP sem subscriptionId real: simulação determinística baseada
  // no dia do mês atual.
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - today.getDate();
  const prorationFactor = daysRemaining / daysInMonth;
  const immediateCharge = Math.round(priceMonthly * prorationFactor * 100);

  const nextDate = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString();

  return {
    ok: true,
    simulated: true,
    immediateCharge,
    nextChargeAmount: Math.round(total * 100),
    nextChargeDate: nextDate,
    currency: "BRL",
  };
}
