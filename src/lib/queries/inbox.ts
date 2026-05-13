import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type SB = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export type ConversationChannel =
  | "whatsapp_cloud"
  | "whatsapp_unofficial"
  | "instagram_dm"
  | "messenger"
  | "email"
  | "sms"
  | "live_chat"
  | "telegram";

export type ConversationStatus = "open" | "pending" | "snoozed" | "resolved" | "spam";

export interface ConversationRow {
  id: string;
  channel: ConversationChannel;
  channel_identifier: string;
  contact_id: string | null;
  deal_id: string | null;
  assignee_user_id: string | null;
  team: string | null;
  status: ConversationStatus;
  priority: "low" | "normal" | "high" | "urgent";
  unread_count: number;
  last_message_at: string;
  last_message_preview: string | null;
  last_inbound_at: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  direction: "inbound" | "outbound" | "internal_note";
  sender_user_id: string | null;
  sender_name: string | null;
  content: string | null;
  media_urls: unknown;
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  provider_message_id: string | null;
  created_at: string;
}

export async function listConversations(
  supabase: SB,
  workspaceId: string,
  opts: { status?: ConversationStatus | "all"; channel?: ConversationChannel; assigneeId?: string | null; limit?: number } = {},
): Promise<ConversationRow[]> {
  let q = supabase
    .from("conversations")
    .select(
      "id, channel, channel_identifier, contact_id, deal_id, assignee_user_id, team, status, priority, unread_count, last_message_at, last_message_preview, last_inbound_at, tags, created_at, updated_at",
    )
    .eq("workspace_id", workspaceId)
    .order("last_message_at", { ascending: false })
    .limit(opts.limit ?? 100);
  if (opts.status && opts.status !== "all") q = q.eq("status", opts.status);
  if (opts.channel) q = q.eq("channel", opts.channel);
  if (opts.assigneeId === null) q = q.is("assignee_user_id", null);
  else if (opts.assigneeId) q = q.eq("assignee_user_id", opts.assigneeId);
  const { data } = await q;
  return (data ?? []) as unknown as ConversationRow[];
}

export async function getConversation(
  supabase: SB,
  id: string,
): Promise<ConversationRow | null> {
  const { data } = await supabase
    .from("conversations")
    .select(
      "id, channel, channel_identifier, contact_id, deal_id, assignee_user_id, team, status, priority, unread_count, last_message_at, last_message_preview, last_inbound_at, tags, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as ConversationRow | null) ?? null;
}

export async function listMessages(
  supabase: SB,
  conversationId: string,
): Promise<MessageRow[]> {
  const { data } = await supabase
    .from("conversation_messages")
    .select(
      "id, conversation_id, direction, sender_user_id, sender_name, content, media_urls, status, provider_message_id, created_at",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as MessageRow[];
}

export async function conversationCounts(supabase: SB, workspaceId: string) {
  const { data } = await supabase
    .from("conversations")
    .select("status, channel, assignee_user_id, unread_count")
    .eq("workspace_id", workspaceId);
  const rows = (data ?? []) as unknown as {
    status: string;
    channel: string;
    assignee_user_id: string | null;
    unread_count: number;
  }[];
  const byStatus = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  const byChannel = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.channel] = (acc[r.channel] ?? 0) + 1;
    return acc;
  }, {});
  const unassigned = rows.filter((r) => !r.assignee_user_id && r.status === "open").length;
  const totalUnread = rows.reduce((a, r) => a + r.unread_count, 0);
  return { byStatus, byChannel, unassigned, totalUnread, total: rows.length };
}
