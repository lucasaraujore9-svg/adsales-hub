import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/guards";
import { listMessages } from "@/lib/queries/inbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const conversationId = req.nextUrl.searchParams.get("conversation_id");
  if (!conversationId) {
    return NextResponse.json({ error: "missing_conversation_id" }, { status: 400 });
  }
  const session = await getSession();
  const sb = session.supabase;

  const { data: conv } = await sb
    .from("conversations")
    .select("id, workspace_id, deal_id, contact_id")
    .eq("id", conversationId)
    .maybeSingle();
  const c = conv as unknown as {
    id: string;
    workspace_id: string;
    deal_id: string | null;
    contact_id: string | null;
  } | null;
  if (!c || c.workspace_id !== session.workspaceId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  void id;

  const messages = await listMessages(sb, conversationId);
  return NextResponse.json({ messages });
}
