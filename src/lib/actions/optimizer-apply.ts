"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/guards";
import { friendlyError } from "@/lib/errors/friendly";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

interface LogRow {
  id: string;
  workspace_id: string;
  campaign_id: string | null;
  action: string;
  details: Record<string, unknown>;
  status: string;
}

/**
 * Aprova e aplica uma sugestão do otimizador IA.
 *
 * Para MVP: muda status local + aplica patch em ad_sets/campaigns conforme
 * o tipo da ação. Integração real com Meta Marketing API fica como TODO
 * (`syncToMeta`).
 */
export async function applyOptimization(logId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!["admin", "gestor", "media_buyer"].includes(session.role)) {
    return { ok: false, error: "Sem permissão para aplicar otimizações." };
  }
  const sb = session.supabase;

  const { data: row } = await sb
    .from("ai_optimization_logs")
    .select("id, workspace_id, campaign_id, action, details, status")
    .eq("id", logId)
    .maybeSingle();
  const log = row as LogRow | null;
  if (!log) return { ok: false, error: "Sugestão não encontrada." };
  if (log.status !== "pending" && log.status !== "approved") {
    return { ok: false, error: `Sugestão já está em status "${log.status}".` };
  }

  // Snapshot do estado atual (para rollback futuro)
  let before: Record<string, unknown> | null = null;
  if (log.campaign_id) {
    const { data: campRow } = await sb
      .from("campaigns")
      .select("status, daily_budget, lifetime_budget")
      .eq("id", log.campaign_id)
      .maybeSingle();
    before = (campRow as Record<string, unknown> | null) ?? null;
  }

  // Aplica localmente (a sync com Meta fica como TODO)
  try {
    if (log.action === "pause_campaign" && log.campaign_id) {
      await sb
        .from("campaigns")
        .update({ status: "paused" } as never)
        .eq("id", log.campaign_id);
    } else if (log.action === "resume_campaign" && log.campaign_id) {
      await sb
        .from("campaigns")
        .update({ status: "active" } as never)
        .eq("id", log.campaign_id);
    } else if (log.action === "increase_budget" && log.campaign_id) {
      const factor = Number(log.details?.factor ?? 1.2);
      const { data: cur } = await sb
        .from("campaigns")
        .select("daily_budget")
        .eq("id", log.campaign_id)
        .maybeSingle();
      const currentBudget = Number((cur as { daily_budget?: number } | null)?.daily_budget ?? 0);
      const newBudget = Math.max(currentBudget * factor, 5);
      await sb
        .from("campaigns")
        .update({ daily_budget: newBudget } as never)
        .eq("id", log.campaign_id);
    } else if (log.action === "decrease_budget" && log.campaign_id) {
      const factor = Number(log.details?.factor ?? 0.8);
      const { data: cur } = await sb
        .from("campaigns")
        .select("daily_budget")
        .eq("id", log.campaign_id)
        .maybeSingle();
      const currentBudget = Number((cur as { daily_budget?: number } | null)?.daily_budget ?? 0);
      const newBudget = Math.max(currentBudget * factor, 5);
      await sb
        .from("campaigns")
        .update({ daily_budget: newBudget } as never)
        .eq("id", log.campaign_id);
    }
    // pause_ad/resume_ad/adjust_audience: TODO quando integração Meta estiver pronta

    await sb
      .from("ai_optimization_logs")
      .update({
        status: "applied",
        applied_at: new Date().toISOString(),
        details: { ...log.details, _before_snapshot: before },
      } as never)
      .eq("id", logId);

    revalidatePath("/campanhas/otimizador");
    if (log.campaign_id) revalidatePath(`/campanhas/${log.campaign_id}`);
    return { ok: true };
  } catch (err) {
    await sb
      .from("ai_optimization_logs")
      .update({
        status: "failed",
        details: { ...log.details, _error: String(err) },
      } as never)
      .eq("id", logId);
    return { ok: false, error: friendlyError(err, "crud") };
  }
}

/**
 * Rejeita uma sugestão sem aplicar.
 */
export async function rejectOptimization(
  logId: string,
  reason?: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!["admin", "gestor", "media_buyer"].includes(session.role)) {
    return { ok: false, error: "Sem permissão." };
  }
  const { error } = await session.supabase
    .from("ai_optimization_logs")
    .update({
      status: "rejected",
      details: { _reject_reason: reason ?? null },
    } as never)
    .eq("id", logId)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: friendlyError(error, "crud") };
  revalidatePath("/campanhas/otimizador");
  return { ok: true };
}
