"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { ConversationRow, MessageRow } from "@/lib/queries/inbox";
import type { ContactRow, DealRow, UserRow } from "@/lib/queries/crm";
import type { WorkloadItem } from "@/lib/inbox/types";
import { Input } from "@/components/ui/input";
import { InboxFilters } from "@/components/inbox/inbox-filters";
import { TeamWorkloadWrapper } from "@/components/inbox/team-workload";
import { ConversationCard } from "@/components/inbox/conversation-card";
import { ConversationThread } from "@/components/inbox/conversation-thread";
import { CRMContextCard } from "@/components/inbox/crm-context-card";
import { ConversationSidePanel } from "@/components/inbox/conversation-side-panel";

interface Props {
  conversation: ConversationRow;
  conversations: ConversationRow[];
  messages: MessageRow[];
  counts: {
    byStatus: Record<string, number>;
    byChannel: Record<string, number>;
    unassigned: number;
    totalUnread: number;
    total: number;
  };
  contacts: ContactRow[];
  users: UserRow[];
  workload: WorkloadItem[];
  deal: DealRow | null;
  contact: ContactRow | null;
  filters: { status: string; channel: string; assignee: string };
  currentUserId: string;
}

export function InboxShell({
  conversation,
  conversations,
  messages,
  counts,
  contacts,
  users,
  workload,
  deal,
  contact,
  filters,
  currentUserId,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");

  const contactById = useMemo(() => new Map(contacts.map((c) => [c.id, c])), [contacts]);
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const assignee = conversation.assignee_user_id
    ? userById.get(conversation.assignee_user_id)
    : undefined;

  const filtered = useMemo(() => {
    let list = conversations;
    if (filters.channel) {
      list = list.filter((c) => c.channel === filters.channel);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => {
        const cc = c.contact_id ? contactById.get(c.contact_id) : null;
        const name = cc?.name?.toLowerCase() ?? c.channel_identifier.toLowerCase();
        return (
          name.includes(q) ||
          (c.last_message_preview ?? "").toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [conversations, filters.channel, search, contactById]);

  const searchParams = new URLSearchParams();
  if (filters.status && filters.status !== "open") searchParams.set("status", filters.status);
  if (filters.channel) searchParams.set("channel", filters.channel);
  if (filters.assignee) searchParams.set("assignee", filters.assignee);
  const qs = searchParams.size > 0 ? `?${searchParams.toString()}` : "";

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[color:var(--bg)]">
      <InboxFilters filters={filters} counts={counts} />
      <TeamWorkloadWrapper
        workload={workload}
        filterValue={filters.assignee}
        currentUserId={currentUserId}
      />

      <div className="flex min-h-0 min-w-0 flex-1">
        {/* Left — conversation list */}
        <div className="flex w-[340px] min-w-0 shrink-0 flex-col border-r border-[color:var(--line)] bg-[color:var(--panel)]">
          <div className="border-b border-[color:var(--line)] p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--ink-4)]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar contato, mensagem..."
                className="h-8 border-[color:var(--line)] pl-8 text-xs"
              />
            </div>
          </div>
          <ul className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-10 text-center text-xs text-[color:var(--ink-4)]">
                Nenhuma conversa encontrada.
              </li>
            ) : (
              filtered.map((c) => {
                const cc = c.contact_id ? contactById.get(c.contact_id) ?? null : null;
                const ass = c.assignee_user_id ? userById.get(c.assignee_user_id) : undefined;
                return (
                  <li key={c.id}>
                    <ConversationCard
                      conversation={c}
                      contact={cc}
                      assignee={ass}
                      active={c.id === conversation.id}
                      href={`/inbox/${c.id}${qs}`}
                    />
                  </li>
                );
              })
            )}
          </ul>
          <div className="border-t border-[color:var(--line)] bg-[color:var(--bg-2)] px-3 py-1.5 text-[10px] text-[color:var(--ink-4)]">
            {filtered.length} de {conversations.length} conversas
          </div>
        </div>

        {/* Main — context + thread */}
        <div className="flex min-w-0 flex-1 flex-col bg-[color:var(--bg)]">
          <CRMContextCard
            conversation={conversation}
            contact={contact}
            deal={deal}
            assignee={assignee}
            users={users}
            onTogglePanel={() => setPanelOpen((v) => !v)}
            panelOpen={panelOpen}
          />
          <div className="flex-1 overflow-hidden">
            <ConversationThread
              conversation={conversation}
              messages={messages}
              currentUserId={currentUserId}
            />
          </div>
        </div>

        {/* Right — collapsible side panel */}
        {panelOpen && (
          <ConversationSidePanel
            conversation={conversation}
            contact={contact}
            deal={deal}
            users={users}
          />
        )}
      </div>
    </div>
  );
}
