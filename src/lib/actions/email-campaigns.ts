"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const campaignSchema = z.object({
  name: z.string().min(2).max(160),
  subject: z.string().min(2).max(200),
  preview_text: z.string().max(150).optional().nullable(),
  from_name: z.string().min(2).max(80),
  from_email: z.string().email(),
  reply_to: z.string().email().optional().nullable(),
  template_id: z.string().uuid().optional().nullable(),
  content: z.string().min(2),
  segment_lifecycle: z.string().optional().nullable(),
  segment_source: z.string().optional().nullable(),
  scheduled_at: z.string().optional().nullable(),
});

export async function createEmailCampaign(input: unknown): Promise<
  ActionResult<{ id: string }>
> {
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();

  const status = parsed.data.scheduled_at ? "scheduled" : "draft";
  const body = {
    workspace_id: session.workspaceId,
    name: parsed.data.name,
    subject: parsed.data.subject,
    preview_text: parsed.data.preview_text ?? null,
    from_name: parsed.data.from_name,
    from_email: parsed.data.from_email,
    reply_to: parsed.data.reply_to ?? null,
    template_id: parsed.data.template_id ?? null,
    content: parsed.data.content,
    segment_config: {
      lifecycle: parsed.data.segment_lifecycle ?? null,
      source: parsed.data.segment_source ?? null,
    },
    status,
    scheduled_at: parsed.data.scheduled_at ?? null,
  };

  const { data, error } = await session.supabase
    .from("email_campaigns")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/emails");
  return { ok: true, data: data as { id: string } };
}

export async function deleteEmailCampaign(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("email_campaigns")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/emails");
  return { ok: true };
}

export async function cancelEmailCampaign(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("email_campaigns")
    .update({ status: "canceled", scheduled_at: null } as never)
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/emails");
  return { ok: true };
}
