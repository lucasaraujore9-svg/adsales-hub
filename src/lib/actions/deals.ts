"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { friendlyError } from "@/lib/errors/friendly";

const createSchema = z.object({
  title: z.string().min(2),
  value: z.coerce.number().nonnegative(),
  pipeline_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  contact_id: z.string().uuid().optional(),
  company_id: z.string().uuid().optional(),
  source: z.string().optional(),
  expected_close_date: z.string().optional(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(2).optional(),
  value: z.coerce.number().nonnegative().optional(),
  stage_id: z.string().uuid().optional(),
  status: z.enum(["open", "won", "lost"]).optional(),
  expected_close_date: z.string().optional(),
  loss_reason_id: z.string().uuid().optional().nullable(),
  loss_reason_notes: z.string().optional(),
});

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

export async function createDeal(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const insertBody = {
    ...parsed.data,
    workspace_id: session.workspaceId,
    owner_user_id: session.user.id,
    stage_entered_at: new Date().toISOString(),
  };
  const { data, error } = await session.supabase
    .from("deals")
    .insert(insertBody as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");

  const created = data as { id: string };
  void (async () => {
    const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
    await dispatchWebhook(session.workspaceId, "deal.created", {
      deal_id: created.id,
      title: parsed.data.title,
      value: parsed.data.value,
      pipeline_id: parsed.data.pipeline_id,
      stage_id: parsed.data.stage_id,
      contact_id: parsed.data.contact_id,
      source: parsed.data.source,
    });
    // Auto-recalc metas que dependem de deals_created (issue 027)
    try {
      const { triggerGoalRecalcForMetrics } = await import("@/lib/goals/recalculate");
      const { createAdminSupabaseClient } = await import("@/lib/supabase/admin");
      await triggerGoalRecalcForMetrics(createAdminSupabaseClient(), session.workspaceId, [
        "deals_created",
      ]);
    } catch (e) {
      console.error("[deals.createDeal] goal recalc failed", e);
    }
  })();

  return { ok: true, data: created };
}

export async function updateDeal(input: unknown): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();

  const { id, ...patch } = parsed.data;

  // Read previous state to know what changed (stage / status)
  const { data: prevData } = await session.supabase
    .from("deals")
    .select("stage_id, status")
    .eq("id", id)
    .maybeSingle();
  const prev = prevData as { stage_id: string; status: string } | null;

  const body: Record<string, unknown> = { ...patch };
  if (patch.status === "won" || patch.status === "lost") {
    body.closed_at = new Date().toISOString();
  }
  if (patch.stage_id) body.stage_entered_at = new Date().toISOString();

  const { error } = await session.supabase.from("deals").update(body as never).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/pipeline");
  revalidatePath(`/negocios/${id}`);
  revalidatePath("/dashboard");

  void (async () => {
    const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
    if (patch.status === "won" && prev?.status !== "won") {
      await dispatchWebhook(session.workspaceId, "deal.won", { deal_id: id });
      // Auto-recalc das metas (issue 027)
      try {
        const { triggerGoalRecalcForMetrics } = await import("@/lib/goals/recalculate");
        const { createAdminSupabaseClient } = await import("@/lib/supabase/admin");
        await triggerGoalRecalcForMetrics(createAdminSupabaseClient(), session.workspaceId, [
          "revenue",
          "deals_won",
        ]);
      } catch (e) {
        console.error("[deals.updateDeal] goal recalc failed", e);
      }
    } else if (patch.status === "lost" && prev?.status !== "lost") {
      await dispatchWebhook(session.workspaceId, "deal.lost", {
        deal_id: id,
        loss_reason_id: patch.loss_reason_id ?? null,
      });
    } else if (patch.stage_id && prev?.stage_id !== patch.stage_id) {
      await dispatchWebhook(session.workspaceId, "deal.stage_changed", {
        deal_id: id,
        from_stage_id: prev?.stage_id ?? null,
        to_stage_id: patch.stage_id,
      });
    } else {
      await dispatchWebhook(session.workspaceId, "deal.updated", {
        deal_id: id,
        changes: Object.keys(patch),
      });
    }
  })();

  return { ok: true };
}

export async function moveDealStage(dealId: string, stageId: string): Promise<ActionResult> {
  return updateDeal({ id: dealId, stage_id: stageId });
}

export async function deleteDeal(dealId: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase.from("deals").delete().eq("id", dealId);
  if (error) return { ok: false, error: friendlyError(error, "crud") };
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  return { ok: true };
}

const bulkReassignSchema = z.object({
  dealIds: z.array(z.string().uuid()).min(1).max(500),
  newOwnerId: z.string().uuid(),
});

/**
 * Reatribui múltiplos negócios para outro vendedor (admin/gestor only).
 */
export async function bulkReassignDeals(
  input: unknown,
): Promise<ActionResult<{ count: number }>> {
  const parsed = bulkReassignSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  if (!["admin", "gestor"].includes(session.role)) {
    return { ok: false, error: "Apenas admins e gestores podem reatribuir em massa." };
  }
  const sb = session.supabase;

  // Verifica que o novo owner pertence ao workspace
  const { data: newOwnerRow } = await sb
    .from("users")
    .select("id")
    .eq("id", parsed.data.newOwnerId)
    .eq("workspace_id", session.workspaceId)
    .maybeSingle();
  if (!newOwnerRow) {
    return { ok: false, error: "Vendedor de destino não pertence ao workspace." };
  }

  const { data, error } = await sb
    .from("deals")
    .update({ owner_user_id: parsed.data.newOwnerId } as never)
    .in("id", parsed.data.dealIds)
    .eq("workspace_id", session.workspaceId)
    .select("id");

  if (error) return { ok: false, error: friendlyError(error, "crud") };

  revalidatePath("/pipeline");
  return { ok: true, data: { count: (data as { id: string }[] | null)?.length ?? 0 } };
}

const reassignFromUserSchema = z.object({
  fromOwnerId: z.string().uuid(),
  toOwnerId: z.string().uuid(),
  onlyOpen: z.boolean().default(true),
});

/**
 * Reatribui todos os negócios abertos (ou todos) de um vendedor para outro.
 * Caso de uso típico: vendedor saiu da empresa.
 */
export async function reassignAllDealsFromUser(
  input: unknown,
): Promise<ActionResult<{ count: number }>> {
  const parsed = reassignFromUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  if (!["admin", "gestor"].includes(session.role)) {
    return { ok: false, error: "Apenas admins e gestores podem reatribuir em massa." };
  }
  if (parsed.data.fromOwnerId === parsed.data.toOwnerId) {
    return { ok: false, error: "Vendedor de origem e destino são iguais." };
  }
  const sb = session.supabase;

  let q = sb
    .from("deals")
    .update({ owner_user_id: parsed.data.toOwnerId } as never)
    .eq("workspace_id", session.workspaceId)
    .eq("owner_user_id", parsed.data.fromOwnerId);
  if (parsed.data.onlyOpen) {
    q = q.eq("status", "open");
  }
  const { data, error } = await q.select("id");
  if (error) return { ok: false, error: friendlyError(error, "crud") };

  revalidatePath("/pipeline");
  return { ok: true, data: { count: (data as { id: string }[] | null)?.length ?? 0 } };
}

const duplicateSchema = z.object({
  dealId: z.string().uuid(),
  newTitle: z.string().min(1).optional(),
  copyContact: z.boolean().default(true),
  copyNotes: z.boolean().default(false),
});

/**
 * Duplica um negócio existente, criando uma cópia no primeiro estágio
 * do pipeline original com status `open`. Útil para renovações,
 * upsell ou split de oportunidade.
 */
export async function duplicateDeal(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = duplicateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const sb = session.supabase;

  const { data: origRow } = await sb
    .from("deals")
    .select(
      "id, workspace_id, pipeline_id, stage_id, title, value, currency, contact_id, company_id, owner_user_id, source, expected_close_date",
    )
    .eq("id", parsed.data.dealId)
    .maybeSingle();
  const orig = origRow as
    | {
        id: string;
        workspace_id: string;
        pipeline_id: string;
        stage_id: string;
        title: string;
        value: number;
        currency: string | null;
        contact_id: string | null;
        company_id: string | null;
        owner_user_id: string | null;
        source: string | null;
        expected_close_date: string | null;
      }
    | null;

  if (!orig) return { ok: false, error: "Negócio não encontrado." };

  // Primeiro estágio do pipeline (para começar do zero)
  const { data: firstStageRow } = await sb
    .from("pipeline_stages")
    .select("id")
    .eq("pipeline_id", orig.pipeline_id)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();
  const firstStage = (firstStageRow as { id?: string } | null) ?? null;
  const startStageId = firstStage?.id ?? orig.stage_id;

  const { data: insertedRow, error } = await sb
    .from("deals")
    .insert({
      workspace_id: orig.workspace_id,
      pipeline_id: orig.pipeline_id,
      stage_id: startStageId,
      title: parsed.data.newTitle ?? `${orig.title} (cópia)`,
      value: orig.value,
      currency: orig.currency,
      contact_id: parsed.data.copyContact ? orig.contact_id : null,
      company_id: parsed.data.copyContact ? orig.company_id : null,
      owner_user_id: orig.owner_user_id ?? session.user.id,
      source: orig.source,
      expected_close_date: orig.expected_close_date,
      status: "open",
      stage_entered_at: new Date().toISOString(),
      metadata: {
        duplicated_from: orig.id,
        duplicated_at: new Date().toISOString(),
      },
    } as never)
    .select("id")
    .single();

  if (error || !insertedRow) {
    return { ok: false, error: friendlyError(error, "crud") };
  }

  const inserted = insertedRow as { id: string };

  // Copia notas opcionais
  if (parsed.data.copyNotes) {
    const { data: notes } = await sb
      .from("notes")
      .select("content, type")
      .eq("deal_id", orig.id);
    const rows = (notes ?? []) as { content: string; type: string | null }[];
    if (rows.length > 0) {
      await sb.from("notes").insert(
        rows.map((n) => ({
          deal_id: inserted.id,
          workspace_id: orig.workspace_id,
          content: n.content,
          type: n.type,
          author_user_id: session.user.id,
        })) as never,
      );
    }
  }

  revalidatePath("/pipeline");
  revalidatePath(`/negocios/${inserted.id}`);

  void (async () => {
    const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
    await dispatchWebhook(orig.workspace_id, "deal.created", {
      deal_id: inserted.id,
      duplicated_from: orig.id,
    });
  })();

  return { ok: true, data: inserted };
}

/**
 * Reabre um negócio que estava marcado como `lost` ou `won`.
 * Volta o status para `open`, limpa motivos de perda e mantém o estágio atual
 * (vendedor pode mover depois).
 */
export async function reopenDeal(dealId: string): Promise<ActionResult> {
  const session = await getSession();

  const { data: prev } = await session.supabase
    .from("deals")
    .select("status, pipeline_id, stage_id")
    .eq("id", dealId)
    .maybeSingle();
  const prevDeal = prev as { status: string; pipeline_id: string; stage_id: string } | null;
  if (!prevDeal) return { ok: false, error: "Negócio não encontrado." };
  if (prevDeal.status === "open") return { ok: true };

  const { error } = await session.supabase
    .from("deals")
    .update({
      status: "open",
      closed_at: null,
      loss_reason_id: null,
      loss_reason_notes: null,
      stage_entered_at: new Date().toISOString(),
    } as never)
    .eq("id", dealId);
  if (error) return { ok: false, error: friendlyError(error, "crud") };

  revalidatePath("/pipeline");
  revalidatePath(`/negocios/${dealId}`);
  revalidatePath("/dashboard");

  void (async () => {
    const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
    await dispatchWebhook(session.workspaceId, "deal.updated", {
      deal_id: dealId,
      changes: ["status", "reopened"],
      previous_status: prevDeal.status,
    });
  })();

  return { ok: true };
}
