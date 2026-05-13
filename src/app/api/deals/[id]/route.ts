import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth/guards";
import {
  getDeal,
  getContact,
  listActivities,
  listPipelinesAndStages,
  listCompanies,
  listWorkspaceUsers,
} from "@/lib/queries/crm";
import type { ConversationRow, MessageRow } from "@/lib/queries/inbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const session = await getSession();
  const sb = session.supabase;

  const deal = await getDeal(sb, id);
  if (!deal) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [contact, activities, { stages }, companies, users] = await Promise.all([
    deal.contact_id ? getContact(sb, deal.contact_id) : Promise.resolve(null),
    listActivities(sb, session.workspaceId, { dealId: deal.id }),
    listPipelinesAndStages(sb, session.workspaceId),
    listCompanies(sb, session.workspaceId),
    listWorkspaceUsers(sb, session.workspaceId),
  ]);

  const stage = stages.find((s) => s.id === deal.stage_id) ?? null;
  const company = deal.company_id
    ? companies.find((c) => c.id === deal.company_id) ?? null
    : null;
  const owner = deal.owner_user_id
    ? users.find((u) => u.id === deal.owner_user_id) ?? null
    : null;

  let conversations: ConversationRow[] = [];
  let messages: MessageRow[] = [];

  const orClauses: string[] = [`deal_id.eq.${deal.id}`];
  if (deal.contact_id) orClauses.push(`contact_id.eq.${deal.contact_id}`);
  const { data: convs } = await sb
    .from("conversations")
    .select(
      "id, channel, channel_identifier, contact_id, deal_id, assignee_user_id, team, status, priority, unread_count, last_message_at, last_message_preview, last_inbound_at, tags, created_at, updated_at",
    )
    .eq("workspace_id", session.workspaceId)
    .or(orClauses.join(","))
    .order("last_message_at", { ascending: false })
    .limit(20);
  conversations = (convs ?? []) as unknown as ConversationRow[];

  if (conversations[0]) {
    const { data: msgs } = await sb
      .from("conversation_messages")
      .select(
        "id, conversation_id, direction, sender_user_id, sender_name, content, media_urls, status, provider_message_id, created_at",
      )
      .eq("conversation_id", conversations[0].id)
      .order("created_at", { ascending: true });
    messages = (msgs ?? []) as unknown as MessageRow[];
  }

  return NextResponse.json({
    deal,
    contact,
    stage,
    company,
    owner,
    activities,
    conversations,
    messages,
    currentUserId: session.user.id,
  });
}
