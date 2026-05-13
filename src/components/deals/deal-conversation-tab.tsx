"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, ExternalLink, Inbox } from "lucide-react";
import type { ConversationRow, MessageRow } from "@/lib/queries/inbox";
import { ChannelIcon, channelLabel } from "@/components/inbox/channel-icon";
import { ConversationThread } from "@/components/inbox/conversation-thread";
import { cn } from "@/lib/utils";

interface Props {
  dealId: string;
  conversations: ConversationRow[];
  initialMessages: MessageRow[];
  currentUserId: string;
}

export function DealConversationTab({
  dealId,
  conversations,
  initialMessages,
  currentUserId,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(
    conversations[0]?.id ?? null,
  );
  const [messages, setMessages] = useState<MessageRow[]>(initialMessages);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeId || activeId === conversations[0]?.id) {
      setMessages(initialMessages);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/deals/${dealId}/messages?conversation_id=${activeId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMessages(data.messages ?? []);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [activeId, dealId, initialMessages, conversations]);

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-10 text-center">
        <Inbox className="h-8 w-8 text-[color:var(--ink-4)]" />
        <h4 className="mt-4 text-sm font-medium">Nenhuma conversa ainda</h4>
        <p className="mt-1 max-w-xs text-xs text-[color:var(--ink-3)]">
          Quando este lead mandar uma mensagem por WhatsApp, Instagram, email ou
          chat do site, a conversa aparece aqui em tempo real.
        </p>
        <Link
          href="/configuracoes/integracoes"
          className="mt-4 inline-flex items-center gap-1 text-xs text-[color:var(--accent)] hover:underline"
        >
          Conectar canais <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0]!;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
      {/* Channel switcher — only if multiple conversations */}
      {conversations.length > 1 && (
        <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-[color:var(--line)] bg-[color:var(--bg-2)] px-3 py-2">
          {conversations.map((c) => {
            const isActive = c.id === active.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs transition-colors",
                  isActive
                    ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                    : "text-[color:var(--ink-3)] hover:bg-[color:var(--panel)] hover:text-[color:var(--ink)]",
                )}
              >
                <ChannelIcon channel={c.channel} className="h-3 w-3" />
                <span>{channelLabel(c.channel)}</span>
                {c.unread_count > 0 && (
                  <span className={cn(
                    "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                    isActive ? "bg-[color:var(--bg)] text-[color:var(--ink)]" : "bg-[color:var(--accent)] text-white",
                  )}>
                    {c.unread_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-[color:var(--line)] px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <ChannelIcon channel={active.channel} className="h-3.5 w-3.5 text-[color:var(--ink-3)]" />
          <span className="truncate text-xs text-[color:var(--ink-3)]">
            {channelLabel(active.channel)} · {active.channel_identifier}
          </span>
        </div>
        <Link
          href={`/inbox/${active.id}`}
          className="inline-flex items-center gap-1 text-[10px] text-[color:var(--ink-4)] hover:text-[color:var(--accent)]"
        >
          Abrir no inbox <ExternalLink className="h-2.5 w-2.5" />
        </Link>
      </div>

      {/* Thread (reuses the same composer + messages UI from /inbox) */}
      <div className="min-h-0 flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-[color:var(--ink-4)]">
            <MessageCircle className="mr-2 h-4 w-4 animate-pulse" />
            Carregando mensagens...
          </div>
        ) : (
          <ConversationThread
            key={active.id}
            conversation={active}
            messages={messages}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
}
