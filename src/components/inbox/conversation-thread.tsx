"use client";

import {
  useState,
  useRef,
  useEffect,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Check, CheckCheck, Send, StickyNote, Paperclip, Smile } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ConversationRow, MessageRow } from "@/lib/queries/inbox";
import { sendMessage } from "@/lib/actions/inbox";

interface Props {
  conversation: ConversationRow;
  messages: MessageRow[];
  currentUserId: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Hoje";
  const yesterday = new Date(today.getTime() - 864e5);
  if (d.toDateString() === yesterday.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" });
}

export function ConversationThread({ conversation, messages: initial, currentUserId }: Props) {
  const [messages, setMessages] = useState(initial);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"reply" | "note">("reply");
  const [pending, start] = useTransition();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setMessages(initial);
  }, [initial]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  function submit() {
    const content = input.trim();
    if (!content || pending) return;
    const tempId = crypto.randomUUID();
    const optimistic: MessageRow = {
      id: tempId,
      conversation_id: conversation.id,
      direction: mode === "note" ? "internal_note" : "outbound",
      sender_user_id: currentUserId,
      sender_name: "Voce",
      content,
      media_urls: null,
      status: "sending",
      provider_message_id: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    start(async () => {
      const res = await sendMessage({
        conversation_id: conversation.id,
        content,
        kind: mode,
      });
      if (!res.ok) {
        toast.error(res.error ?? "Falha ao enviar");
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        return;
      }
      router.refresh();
    });
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  // Group by day
  const groups = new Map<string, MessageRow[]>();
  for (const m of messages) {
    const key = m.created_at.slice(0, 10);
    const arr = groups.get(key) ?? [];
    arr.push(m);
    groups.set(key, arr);
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[color:var(--bg)] px-6 py-4">
        {[...groups.entries()].map(([day, msgs]) => (
          <div key={day} className="mb-4">
            <div className="mb-3 flex items-center justify-center">
              <span className="rounded-pill bg-[color:var(--bg-2)] px-3 py-1 text-[10px] font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
                {formatDay(msgs[0]!.created_at)}
              </span>
            </div>
            <ul className="space-y-2">
              {msgs.map((m) => {
                const isOutbound = m.direction !== "inbound";
                const isNote = m.direction === "internal_note";
                return (
                  <li
                    key={m.id}
                    className={cn("flex gap-2", isOutbound && "flex-row-reverse")}
                  >
                    <div
                      className={cn(
                        "max-w-[72%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words",
                        isNote
                          ? "border border-dashed border-[color:var(--warn)]/50 bg-[color:var(--warn)]/10 text-[color:var(--ink-2)]"
                          : isOutbound
                            ? "bg-[color:var(--ink)] text-[color:var(--bg)] rounded-tr-sm"
                            : "bg-[color:var(--panel)] text-[color:var(--ink-2)] rounded-tl-sm border border-[color:var(--line)]",
                      )}
                    >
                      {isNote && (
                        <div className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-kicker text-[color:var(--warn)]">
                          <StickyNote className="h-3 w-3" /> Nota interna
                        </div>
                      )}
                      <p>{m.content}</p>
                      <div
                        className={cn(
                          "mt-1 flex items-center gap-1 text-[10px]",
                          isOutbound && !isNote
                            ? "justify-end text-[color:var(--bg)]/60"
                            : "text-[color:var(--ink-4)]",
                        )}
                      >
                        <span>{formatTime(m.created_at)}</span>
                        {isOutbound && !isNote && (
                          <>
                            {m.status === "sending" && <Check className="h-3 w-3" />}
                            {m.status === "sent" && <Check className="h-3 w-3" />}
                            {m.status === "delivered" && <CheckCheck className="h-3 w-3" />}
                            {m.status === "read" && <CheckCheck className="h-3 w-3" />}
                            {m.status === "failed" && (
                              <span className="text-[color:var(--bad)]">· falhou</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="py-20 text-center text-sm text-[color:var(--ink-3)]">
            Conversa vazia. Envie a primeira mensagem abaixo.
          </p>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={onSubmit}
        className={cn(
          "border-t border-[color:var(--line)] bg-[color:var(--panel)] px-4 pb-3 pt-2",
          mode === "note" && "bg-[color:var(--warn)]/5",
        )}
      >
        <div className="mb-2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode("reply")}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              mode === "reply"
                ? "bg-[color:var(--bg)] text-[color:var(--ink)] shadow-sm"
                : "text-[color:var(--ink-3)] hover:text-[color:var(--ink)]",
            )}
          >
            Responder
          </button>
          <button
            type="button"
            onClick={() => setMode("note")}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              mode === "note"
                ? "bg-[color:var(--warn)]/10 text-[color:var(--warn)] shadow-sm"
                : "text-[color:var(--ink-3)] hover:text-[color:var(--ink)]",
            )}
          >
            <StickyNote className="mr-1 inline h-3 w-3" /> Nota interna
          </button>
        </div>
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder={
            mode === "note"
              ? "Anotacao privada — não e enviada pro cliente"
              : "Digite sua resposta... (Enter envia, Shift+Enter quebra linha)"
          }
          className="resize-none border-transparent bg-transparent focus-visible:border-transparent focus-visible:ring-0"
        />
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-md p-1.5 text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
              aria-label="Anexar"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-md p-1.5 text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
              aria-label="Emoji"
            >
              <Smile className="h-4 w-4" />
            </button>
          </div>
          <Button type="submit" size="sm" disabled={pending || !input.trim()}>
            <Send className="mr-1 h-3.5 w-3.5" />
            {mode === "note" ? "Salvar nota" : "Enviar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
