"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

const schema = z.object({
  type: z.enum([
    "call",
    "email",
    "whatsapp",
    "meeting",
    "task",
    "note",
    "sms",
    "video_meeting",
    "demo",
    "follow_up",
    "linkedin",
  ]),
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  deal_id: z.string().uuid().optional().nullable(),
  contact_id: z.string().uuid().optional().nullable(),
  company_id: z.string().uuid().optional().nullable(),
});

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

export async function createActivity(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const insertBody = {
    ...parsed.data,
    workspace_id: session.workspaceId,
    user_id: session.user.id,
  };
  const { data, error } = await session.supabase
    .from("activities")
    .insert(insertBody as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/atividades");
  if (parsed.data.deal_id) revalidatePath(`/negocios/${parsed.data.deal_id}`);
  return { ok: true, data: data as { id: string } };
}

export async function toggleActivityComplete(id: string, completed: boolean): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("activities")
    .update({
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    } as never)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/atividades");
  revalidatePath("/dashboard");

  if (completed) {
    void (async () => {
      const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
      await dispatchWebhook(session.workspaceId, "activity.completed", {
        activity_id: id,
      });
    })();
  }

  return { ok: true };
}

export async function deleteActivity(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase.from("activities").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/atividades");
  return { ok: true };
}
