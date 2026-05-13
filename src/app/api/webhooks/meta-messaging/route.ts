import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ingestInboundMessage } from "@/lib/inbox/ingest";
import { requireServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Webhook para Instagram DMs + Messenger (Meta Graph).
 *
 * Subscreva os campos `messages` + `messaging_postbacks` no app do Meta e
 * aponte pra: https://seu-dominio/api/webhooks/meta-messaging
 *
 * GET  = verification challenge
 * POST = eventos de mensagem
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");
  const verify = requireServerEnv("META_WEBHOOK_VERIFY_TOKEN");
  if (mode === "subscribe" && token === verify && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

interface MessagingEntry {
  id: string; // page id OR instagram business id
  messaging?: Array<{
    sender: { id: string };
    recipient: { id: string };
    timestamp: number;
    message?: {
      mid: string;
      text?: string;
      attachments?: Array<{ type: string; payload: { url?: string } }>;
    };
  }>;
  changes?: Array<{
    field: string;
    value: {
      from: { id: string; username?: string };
      text?: string;
      media?: { id: string; media_product_type?: string };
      timestamp?: number;
    };
  }>;
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as
    | { object: "instagram" | "page"; entry: MessagingEntry[] }
    | null;
  if (!payload?.entry) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const channel = payload.object === "instagram" ? "instagram_dm" : "messenger";

  for (const entry of payload.entry) {
    // Resolve workspace via social_accounts
    const { data: accountRow } = await admin
      .from("social_accounts")
      .select("workspace_id")
      .eq("account_id", entry.id)
      .maybeSingle();
    const account = accountRow as unknown as { workspace_id: string } | null;
    if (!account) continue;

    const incoming = entry.messaging ?? [];
    for (const m of incoming) {
      if (!m.message?.text) continue;
      await ingestInboundMessage({
        workspaceId: account.workspace_id,
        channel,
        channelIdentifier: m.sender.id,
        content: m.message.text,
        providerMessageId: m.message.mid,
      });
    }

    // Instagram uses `changes` for some events
    for (const ch of entry.changes ?? []) {
      if (ch.field !== "messages") continue;
      if (!ch.value.text) continue;
      await ingestInboundMessage({
        workspaceId: account.workspace_id,
        channel,
        channelIdentifier: ch.value.from.id,
        senderName: ch.value.from.username,
        content: ch.value.text,
      });
    }
  }

  return NextResponse.json({ received: true });
}
