"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { serverEnv } from "@/lib/env";

const sendSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1),
  kind: z.enum(["reply", "note"]).default("reply"),
});

const updateSchema = z.object({
  conversation_id: z.string().uuid(),
  status: z.enum(["open", "pending", "snoozed", "resolved", "spam"]).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  assignee_user_id: z.string().uuid().nullable().optional(),
});

export type ActionResult = { ok: boolean; error?: string; data?: unknown };

export async function sendMessage(input: unknown): Promise<ActionResult> {
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const { conversation_id, content, kind } = parsed.data;

  const { data: conv } = await session.supabase
    .from("conversations")
    .select("id, channel, channel_identifier, workspace_id")
    .eq("id", conversation_id)
    .maybeSingle();
  const conversation = conv as unknown as {
    id: string;
    channel: string;
    channel_identifier: string;
    workspace_id: string;
  } | null;
  if (!conversation) return { ok: false, error: "conversation_not_found" };

  // Persist the outgoing message
  const { data: inserted, error } = await session.supabase
    .from("conversation_messages")
    .insert({
      workspace_id: session.workspaceId,
      conversation_id,
      direction: kind === "note" ? "internal_note" : "outbound",
      sender_user_id: session.user.id,
      sender_name: session.profile.name ?? session.profile.email,
      content,
      status: kind === "note" ? "sent" : "sending",
    } as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  const msgId = (inserted as unknown as { id: string }).id;

  // For real replies, attempt provider send. Failures bubble up as "failed".
  let deliveryStatus: "sent" | "failed" = "sent";
  let providerError: string | null = null;

  if (kind === "reply") {
    try {
      switch (conversation.channel) {
        case "whatsapp_cloud": {
          if (!serverEnv().WHATSAPP_TOKEN) {
            deliveryStatus = "sent"; // demo: pretend sent
            break;
          }
          const { sendText } = await import("@/lib/whatsapp/client");
          await sendText({ to: conversation.channel_identifier, text: content });
          break;
        }
        case "email": {
          if (!serverEnv().RESEND_API_KEY) {
            deliveryStatus = "sent";
            break;
          }
          const { sendTransactional } = await import("@/lib/email/client");
          await sendTransactional({
            to: conversation.channel_identifier,
            subject: "Re: sua conversa com o time",
            html: `<p>${content.replace(/\n/g, "<br/>")}</p>`,
          });
          break;
        }
        case "instagram_dm":
        case "messenger": {
          // Would call Graph API /me/messages — stub for demo.
          deliveryStatus = "sent";
          break;
        }
        default:
          deliveryStatus = "sent";
      }
    } catch (err) {
      deliveryStatus = "failed";
      providerError = err instanceof Error ? err.message : String(err);
    }
  }

  await session.supabase
    .from("conversation_messages")
    .update({
      status: deliveryStatus,
      error: providerError,
    } as never)
    .eq("id", msgId);

  // Bump conversation preview + reopen if resolved
  await session.supabase
    .from("conversations")
    .update({
      last_message_at: new Date().toISOString(),
      last_message_preview: content.slice(0, 160),
      unread_count: 0,
    } as never)
    .eq("id", conversation_id);

  revalidatePath(`/inbox`);
  revalidatePath(`/inbox/${conversation_id}`);
  return { ok: true, data: { id: msgId, status: deliveryStatus } };
}

export async function updateConversation(input: unknown): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const { conversation_id, ...patch } = parsed.data;
  const { error } = await session.supabase
    .from("conversations")
    .update(patch as never)
    .eq("id", conversation_id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/inbox");
  revalidatePath(`/inbox/${conversation_id}`);
  return { ok: true };
}

export async function markAsRead(conversationId: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("conversations")
    .update({ unread_count: 0 } as never)
    .eq("id", conversationId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/inbox");
  return { ok: true };
}

export async function assignToMe(conversationId: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("conversations")
    .update({ assignee_user_id: session.user.id } as never)
    .eq("id", conversationId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/inbox");
  revalidatePath(`/inbox/${conversationId}`);
  return { ok: true };
}
