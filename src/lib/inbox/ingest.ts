import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export interface InboundMessage {
  workspaceId: string;
  channel:
    | "whatsapp_cloud"
    | "whatsapp_unofficial"
    | "instagram_dm"
    | "messenger"
    | "email"
    | "sms"
    | "live_chat"
    | "telegram";
  channelIdentifier: string;
  externalConversationId?: string;
  senderName?: string;
  content: string;
  providerMessageId?: string;
  mediaUrls?: unknown;
  contactId?: string;
}

/**
 * Idempotent: creates a conversation for (workspace_id, channel,
 * channel_identifier) if needed, appends the inbound message, bumps
 * last_message_at + unread_count.
 *
 * Intended to be called from every webhook receiver so the unified inbox is
 * always in sync.
 */
export async function ingestInboundMessage(msg: InboundMessage): Promise<{
  conversation_id: string;
  message_id: string | null;
}> {
  const admin = createAdminSupabaseClient();

  // Upsert conversation
  const { data: existingRaw } = await admin
    .from("conversations")
    .select("id, unread_count")
    .eq("workspace_id", msg.workspaceId)
    .eq("channel", msg.channel)
    .eq("channel_identifier", msg.channelIdentifier)
    .maybeSingle();
  const existing = existingRaw as unknown as {
    id: string;
    unread_count: number;
  } | null;

  let conversationId: string;
  if (existing) {
    conversationId = existing.id;
    await admin
      .from("conversations")
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: msg.content.slice(0, 160),
        unread_count: existing.unread_count + 1,
        status: "open",
      } as never)
      .eq("id", existing.id);
  } else {
    const { data: created } = await admin
      .from("conversations")
      .insert({
        workspace_id: msg.workspaceId,
        channel: msg.channel,
        channel_identifier: msg.channelIdentifier,
        external_conversation_id: msg.externalConversationId,
        contact_id: msg.contactId ?? null,
        status: "open",
        priority: "normal",
        unread_count: 1,
        last_message_at: new Date().toISOString(),
        last_message_preview: msg.content.slice(0, 160),
      } as never)
      .select("id")
      .single();
    conversationId = (created as unknown as { id: string })?.id;
    if (!conversationId) return { conversation_id: "", message_id: null };
  }

  const { data: inserted } = await admin
    .from("conversation_messages")
    .insert({
      workspace_id: msg.workspaceId,
      conversation_id: conversationId,
      direction: "inbound",
      sender_name: msg.senderName,
      content: msg.content,
      media_urls: msg.mediaUrls ?? null,
      status: "sent",
      provider_message_id: msg.providerMessageId,
    } as never)
    .select("id")
    .single();

  return {
    conversation_id: conversationId,
    message_id: (inserted as unknown as { id: string } | null)?.id ?? null,
  };
}
