import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/guards";
import {
  getConversation,
  listConversations,
  listMessages,
  conversationCounts,
} from "@/lib/queries/inbox";
import {
  getContact,
  listContacts,
  listWorkspaceUsers,
  getDeal,
} from "@/lib/queries/crm";
import { listTeamWorkload } from "@/lib/queries/inbox-workload";
import { InboxShell } from "@/components/inbox/inbox-shell";

export const metadata = { title: "Caixa de entrada · AdSales Hub" };

export default async function InboxConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; channel?: string; assignee?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const session = await getSession();
  const sb = session.supabase;

  const conversation = await getConversation(sb, id);
  if (!conversation) notFound();

  const statusFilter = (sp.status ?? "open") as
    | "open"
    | "pending"
    | "snoozed"
    | "resolved"
    | "spam"
    | "all";

  const [conversations, messages, counts, contacts, users, workload, deal, contact] =
    await Promise.all([
      listConversations(sb, session.workspaceId, {
        status: statusFilter,
        assigneeId:
          sp.assignee === "me"
            ? session.user.id
            : sp.assignee === "unassigned"
              ? null
              : sp.assignee && sp.assignee.length > 0
                ? sp.assignee
                : undefined,
        limit: 100,
      }),
      listMessages(sb, id),
      conversationCounts(sb, session.workspaceId),
      listContacts(sb, session.workspaceId),
      listWorkspaceUsers(sb, session.workspaceId),
      listTeamWorkload(sb, session.workspaceId),
      conversation.deal_id ? getDeal(sb, conversation.deal_id) : Promise.resolve(null),
      conversation.contact_id ? getContact(sb, conversation.contact_id) : Promise.resolve(null),
    ]);

  return (
    <InboxShell
      conversation={conversation}
      conversations={conversations}
      messages={messages}
      counts={counts}
      contacts={contacts}
      users={users}
      workload={workload}
      deal={deal}
      contact={contact}
      filters={{
        status: (sp.status as string) ?? "open",
        channel: sp.channel ?? "",
        assignee: sp.assignee ?? "",
      }}
      currentUserId={session.user.id}
    />
  );
}
