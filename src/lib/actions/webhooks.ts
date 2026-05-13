"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const ALL_EVENTS = [
  "deal.created",
  "deal.updated",
  "deal.won",
  "deal.lost",
  "deal.stage_changed",
  "contact.created",
  "contact.updated",
  "lead.captured",
  "campaign.published",
  "campaign.paused",
  "form.submitted",
  "activity.completed",
] as const;

const webhookSchema = z.object({
  name: z.string().min(2).max(120),
  url: z.string().url(),
  secret: z.string().optional().nullable(),
  events: z.array(z.enum(ALL_EVENTS)).min(1),
});

export const webhookEventOptions = ALL_EVENTS;

export async function createWebhook(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = webhookSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const body = {
    workspace_id: session.workspaceId,
    name: parsed.data.name,
    url: parsed.data.url,
    secret: parsed.data.secret ?? null,
    events: parsed.data.events,
    is_active: true,
  };
  const { data, error } = await session.supabase
    .from("webhooks")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/webhooks");
  return { ok: true, data: data as { id: string } };
}

export async function deleteWebhook(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("webhooks")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/webhooks");
  return { ok: true };
}

export async function toggleWebhookActive(id: string, active: boolean): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("webhooks")
    .update({ is_active: active } as never)
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/webhooks");
  return { ok: true };
}
