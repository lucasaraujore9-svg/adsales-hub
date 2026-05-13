import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ingestInboundMessage } from "@/lib/inbox/ingest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  session_id: z.string().min(3),
  name: z.string().optional(),
  email: z.string().email().optional(),
  message: z.string().min(1),
});

/**
 * Public endpoint for the embeddable live chat widget. No auth — protected
 * via the per-workspace token baked in the widget script. Creates/updates a
 * conversation in the workspace's inbox.
 *
 * POST /api/chat-widget/{token}
 * Body: { session_id, name?, email?, message }
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { data: widget } = await admin
    .from("live_chat_widgets")
    .select("workspace_id, is_active")
    .eq("token", token)
    .maybeSingle();
  const w = widget as unknown as {
    workspace_id: string;
    is_active: boolean;
  } | null;
  if (!w || !w.is_active) {
    return NextResponse.json({ error: "widget_not_found" }, { status: 404 });
  }

  // Find or create a lightweight contact
  let contactId: string | undefined;
  if (parsed.data.email) {
    const { data: existing } = await admin
      .from("contacts")
      .select("id")
      .eq("workspace_id", w.workspace_id)
      .eq("email", parsed.data.email)
      .maybeSingle();
    const existingId = (existing as unknown as { id: string } | null)?.id;
    if (existingId) {
      contactId = existingId;
    } else {
      const { data: created } = await admin
        .from("contacts")
        .insert({
          workspace_id: w.workspace_id,
          name: parsed.data.name ?? parsed.data.email,
          email: parsed.data.email,
          source: "website",
          lifecycle_stage: "lead",
        } as never)
        .select("id")
        .single();
      contactId = (created as unknown as { id: string })?.id;
    }
  }

  const result = await ingestInboundMessage({
    workspaceId: w.workspace_id,
    channel: "live_chat",
    channelIdentifier: parsed.data.session_id,
    senderName: parsed.data.name ?? "Visitante",
    content: parsed.data.message,
    contactId,
  });

  return NextResponse.json({ ok: true, conversation_id: result.conversation_id });
}
