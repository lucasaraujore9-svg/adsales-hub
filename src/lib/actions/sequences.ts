"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const sequenceSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().optional().nullable(),
  target_entity: z.enum(["contact", "deal"]).default("contact"),
});

export async function createSequence(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = sequenceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const body = {
    workspace_id: session.workspaceId,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    target_entity: parsed.data.target_entity,
    is_active: false,
  };
  const { data, error } = await session.supabase
    .from("sequences")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/sequencias");
  return { ok: true, data: data as { id: string } };
}

export async function deleteSequence(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("sequences")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/sequencias");
  return { ok: true };
}

export async function toggleSequenceActive(id: string, active: boolean): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("sequences")
    .update({ is_active: active } as never)
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/sequencias");
  return { ok: true };
}

const stepSchema = z.object({
  sequence_id: z.string().uuid(),
  channel: z.enum(["email", "whatsapp", "call", "task", "sms"]),
  delay_days: z.coerce.number().int().min(0).max(365).default(0),
  delay_hours: z.coerce.number().int().min(0).max(23).default(0),
  template_id: z.string().uuid().optional().nullable(),
  subject: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
});

async function ownsSequence(
  supabase: Awaited<ReturnType<typeof getSession>>["supabase"],
  workspaceId: string,
  sequenceId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("sequences")
    .select("id")
    .eq("id", sequenceId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return !!data;
}

export async function createSequenceStep(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = stepSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  if (!(await ownsSequence(session.supabase, session.workspaceId, parsed.data.sequence_id))) {
    return { ok: false, error: "Sequencia não encontrada" };
  }

  const { data: existingSteps } = await session.supabase
    .from("sequence_steps")
    .select("position")
    .eq("sequence_id", parsed.data.sequence_id);
  const nextPosition =
    ((existingSteps as { position: number }[] | null) ?? []).reduce(
      (max, s) => Math.max(max, s.position),
      0,
    ) + 1;

  const body = {
    sequence_id: parsed.data.sequence_id,
    channel: parsed.data.channel,
    delay_days: parsed.data.delay_days,
    delay_hours: parsed.data.delay_hours,
    template_id: parsed.data.template_id ?? null,
    subject: parsed.data.subject ?? null,
    body: parsed.data.body ?? null,
    position: nextPosition,
  };
  const { data, error } = await session.supabase
    .from("sequence_steps")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/configuracoes/sequencias/${parsed.data.sequence_id}`);
  return { ok: true, data: data as { id: string } };
}

export async function deleteSequenceStep(stepId: string): Promise<ActionResult> {
  const session = await getSession();
  const { data: step } = await session.supabase
    .from("sequence_steps")
    .select("id, sequence_id")
    .eq("id", stepId)
    .maybeSingle();
  const seq = step as { id: string; sequence_id: string } | null;
  if (!seq) return { ok: false, error: "Passo não encontrado" };
  if (!(await ownsSequence(session.supabase, session.workspaceId, seq.sequence_id))) {
    return { ok: false, error: "Sequencia não encontrada" };
  }
  const { error } = await session.supabase
    .from("sequence_steps")
    .delete()
    .eq("id", stepId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/configuracoes/sequencias/${seq.sequence_id}`);
  return { ok: true };
}

export async function reorderSequenceSteps(
  sequenceId: string,
  stepIds: string[],
): Promise<ActionResult> {
  const session = await getSession();
  if (!(await ownsSequence(session.supabase, session.workspaceId, sequenceId))) {
    return { ok: false, error: "Sequencia não encontrada" };
  }
  for (let i = 0; i < stepIds.length; i++) {
    await session.supabase
      .from("sequence_steps")
      .update({ position: i + 1 } as never)
      .eq("id", stepIds[i])
      .eq("sequence_id", sequenceId);
  }
  revalidatePath(`/configuracoes/sequencias/${sequenceId}`);
  return { ok: true };
}
