import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/**
 * Tenta encontrar contato existente no workspace por phone/whatsapp/email.
 * Retorna o ID do contato mais recente ou null.
 */
async function findContactByChannel(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  workspaceId: string,
  channel: InboundMessage["channel"],
  channelIdentifier: string,
): Promise<string | null> {
  const value = channelIdentifier.trim();
  if (!value) return null;

  // Normaliza phone: só dígitos
  const normalizedPhone = value.replace(/\D/g, "");

  if (channel === "whatsapp_cloud" || channel === "whatsapp_unofficial") {
    const filters = [`whatsapp.eq.${normalizedPhone}`];
    if (normalizedPhone.length >= 10) filters.push(`phone.eq.${normalizedPhone}`);
    const { data } = await admin
      .from("contacts")
      .select("id")
      .eq("workspace_id", workspaceId)
      .or(filters.join(","))
      .order("last_activity_at", { ascending: false, nullsFirst: false })
      .limit(1);
    return (data?.[0]?.id as string | undefined) ?? null;
  }

  if (channel === "sms") {
    if (!normalizedPhone) return null;
    const { data } = await admin
      .from("contacts")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("phone", normalizedPhone)
      .order("last_activity_at", { ascending: false, nullsFirst: false })
      .limit(1);
    return (data?.[0]?.id as string | undefined) ?? null;
  }

  if (channel === "email") {
    const { data } = await admin
      .from("contacts")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("email", value.toLowerCase())
      .order("last_activity_at", { ascending: false, nullsFirst: false })
      .limit(1);
    return (data?.[0]?.id as string | undefined) ?? null;
  }

  return null;
}

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

  // Auto-vincular contato (issue 026)
  let resolvedContactId = msg.contactId ?? null;
  if (!resolvedContactId) {
    resolvedContactId = await findContactByChannel(
      admin,
      msg.workspaceId,
      msg.channel,
      msg.channelIdentifier,
    );
  }

  let conversationId: string;
  if (existing) {
    conversationId = existing.id;
    const updatePayload: Record<string, unknown> = {
      last_message_at: new Date().toISOString(),
      last_message_preview: msg.content.slice(0, 160),
      unread_count: existing.unread_count + 1,
      status: "open",
    };
    // Vincula contato se ainda não estiver vinculado
    if (resolvedContactId) updatePayload.contact_id = resolvedContactId;
    await admin
      .from("conversations")
      .update(updatePayload as never)
      .eq("id", existing.id);
  } else {
    const { data: created } = await admin
      .from("conversations")
      .insert({
        workspace_id: msg.workspaceId,
        channel: msg.channel,
        channel_identifier: msg.channelIdentifier,
        external_conversation_id: msg.externalConversationId,
        contact_id: resolvedContactId,
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
