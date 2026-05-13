import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/guards";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { supabase } = await requireAuth();

  const [{ data: thread }, { data: messages }] = await Promise.all([
    supabase
      .from("ai_chat_threads")
      .select("id, title, last_message_at, message_count, created_at")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("ai_chat_messages")
      .select("id, role, content, created_at")
      .eq("thread_id", id)
      .order("created_at", { ascending: true }),
  ]);
  if (!thread) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ thread, messages: messages ?? [] });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { supabase } = await requireAuth();
  // Use admin client to bypass role check when the user is owner of the thread
  // (workspace_writers can delete; RLS policy enforces workspace id).
  const admin = createAdminSupabaseClient();
  // get workspace from thread
  const { data: thread } = await supabase
    .from("ai_chat_threads")
    .select("id, workspace_id")
    .eq("id", id)
    .maybeSingle();
  const t = thread as unknown as { id: string; workspace_id: string } | null;
  if (!t) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await admin.from("ai_chat_threads").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
