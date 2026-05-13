"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

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
  if (error) return { ok: false, error: error.message };
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  return { ok: true };
}
