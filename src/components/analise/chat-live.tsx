"use client";

import {
  useState,
  useRef,
  useEffect,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  BrainCircuit,
  Send,
  Plus,
  Trash2,
  Sparkles,
  MessageSquare,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ThreadSummary {
  id: string;
  title: string;
  last_message_at: string;
  message_count: number;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  pending?: boolean;
}

interface Props {
  threads: ThreadSummary[];
  initialThreadId: string | null;
  initialMessages: Message[];
}

const QUICK_PROMPTS = [
  "Qual publico tem melhor ROAS nos ultimos 30 dias?",
  "Quais campanhas estao com CPL acima de R$ 20?",
  "Projete meu faturamento para o proximo trimestre",
  "Quais vendedores tem taxa de conversao acima da media?",
  "Quanto gastei em Meta Ads este mes e quantos leads gerei?",
];

export function ChatLive({ threads, initialThreadId, initialMessages }: Props) {
  const router = useRouter();
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, streaming]);

  // Load a different thread
  async function loadThread(id: string) {
    const res = await fetch(`/api/ai/threads/${id}`);
    if (!res.ok) {
      toast.error("Nao foi possivel carregar a conversa");
      return;
    }
    const data = await res.json();
    setThreadId(id);
    setMessages(data.messages);
    router.replace(`/analise?thread=${id}`, { scroll: false });
  }

  function newThread() {
    setThreadId(null);
    setMessages([]);
    router.replace("/analise", { scroll: false });
    inputRef.current?.focus();
  }

  async function deleteThread(id: string) {
    if (!confirm("Apagar esta conversa?")) return;
    const res = await fetch(`/api/ai/threads/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Falha ao apagar");
      return;
    }
    toast.success("Conversa apagada");
    if (threadId === id) {
      newThread();
    }
    startTransition(() => router.refresh());
  }

  async function send(messageOverride?: string) {
    const text = (messageOverride ?? input).trim();
    if (!text || streaming) return;

    const userMsgId = crypto.randomUUID();
    const assistantMsgId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: text, created_at: new Date().toISOString() },
      { id: assistantMsgId, role: "assistant", content: "", created_at: new Date().toISOString(), pending: true },
    ]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          thread_id: threadId ?? undefined,
          message: text,
        }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentThreadId = threadId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line);
            if (event.type === "thread_id") {
              currentThreadId = event.thread_id;
              setThreadId(event.thread_id);
              router.replace(`/analise?thread=${event.thread_id}`, { scroll: false });
            } else if (event.type === "delta") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + event.text, pending: true }
                    : m,
                ),
              );
            } else if (event.type === "done") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, pending: false } : m,
                ),
              );
            } else if (event.type === "error") {
              toast.error(event.message ?? "Erro no chat");
            }
          } catch (err) {
            console.error("parse event failed", err, line);
          }
        }
      }

      // Refresh thread list in sidebar
      if (currentThreadId && !threadId) {
        startTransition(() => router.refresh());
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: m.content + `\n\n[Erro: ${err instanceof Error ? err.message : "falha"}]`, pending: false }
            : m,
        ),
      );
      toast.error("Falha no chat");
    } finally {
      setStreaming(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr] lg:h-[calc(100dvh-220px)] lg:min-h-[560px]">
      {/* Sidebar de threads */}
      <aside className="flex min-h-0 flex-col rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        <div className="flex shrink-0 items-center justify-between border-b border-[color:var(--line)] px-4 py-3">
          <div className="text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
            Conversas
          </div>
          <Button size="sm" variant="outline" onClick={newThread} aria-label="Nova conversa">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <li className="px-4 py-6 text-center text-xs text-[color:var(--ink-3)]">
              Nenhuma conversa ainda. Mande a primeira pergunta →
            </li>
          ) : (
            threads.map((t) => (
              <li key={t.id} className="group flex items-center gap-2 border-b border-[color:var(--line)] px-3 py-2.5 last:border-b-0">
                <button
                  onClick={() => loadThread(t.id)}
                  className={cn(
                    "flex-1 min-w-0 text-left transition-colors hover:text-[color:var(--ink)]",
                    threadId === t.id ? "text-[color:var(--ink)]" : "text-[color:var(--ink-3)]",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3 shrink-0 text-[color:var(--ink-4)]" />
                    <span className="truncate text-xs font-medium">{t.title}</span>
                  </div>
                  <div className="mt-0.5 text-[10px] text-[color:var(--ink-4)]">
                    {t.message_count} msgs · {new Date(t.last_message_at).toLocaleDateString("pt-BR")}
                  </div>
                </button>
                <button
                  onClick={() => deleteThread(t.id)}
                  className="opacity-0 transition-opacity hover:text-[color:var(--bad)] group-hover:opacity-100"
                  aria-label="Apagar"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>

      {/* Chat */}
      <div className="flex h-[560px] min-h-0 flex-col rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] lg:h-full">
        {/* Header */}
        <div className="flex shrink-0 items-center gap-2 border-b border-[color:var(--line)] px-4 py-3">
          <BrainCircuit className="h-4 w-4 text-[color:var(--accent)]" />
          <span className="text-sm font-medium">
            {threadId ? threads.find((t) => t.id === threadId)?.title ?? "Conversa" : "Nova conversa"}
          </span>
          {streaming && (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-[color:var(--ink-3)]">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--accent)]" />
              pensando...
            </span>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Pergunte qualquer coisa</h3>
                <p className="mt-1 text-xs text-[color:var(--ink-3)]">
                  A IA tem acesso a campanhas, pipeline, contatos e historico do seu workspace.
                </p>
              </div>
              <div className="grid w-full max-w-md gap-2">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    disabled={streaming}
                    className="group inline-flex items-center gap-2 rounded-pill border border-[color:var(--line-2)] bg-[color:var(--bg-2)] px-4 py-2 text-left text-xs text-[color:var(--ink-2)] transition-colors hover:border-[color:var(--accent)]/40 hover:bg-[color:var(--accent)]/5 disabled:opacity-40"
                  >
                    <Sparkles className="h-3 w-3 shrink-0 text-[color:var(--accent)]" />
                    <span className="flex-1 truncate">{p}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {messages.map((m) => (
                <li key={m.id} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      m.role === "user"
                        ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                        : "bg-[color:var(--bg-2)] text-[color:var(--accent)]",
                    )}
                  >
                    {m.role === "user" ? <User className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
                  </div>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-card px-4 py-3 text-sm whitespace-pre-wrap break-words",
                      m.role === "user"
                        ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                        : "border border-[color:var(--line)] bg-[color:var(--bg-2)] text-[color:var(--ink-2)]",
                    )}
                  >
                    {m.content || (m.pending ? (
                      <span className="inline-flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--accent)]" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--accent)]" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--accent)]" style={{ animationDelay: "300ms" }} />
                      </span>
                    ) : null)}
                    {m.pending && m.content && (
                      <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-current align-middle" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Input */}
        <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-[color:var(--line)] px-4 py-3">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Pergunte qualquer coisa sobre suas campanhas, pipeline ou metas..."
            rows={1}
            disabled={streaming}
            className="min-h-10 max-h-40 flex-1 resize-none"
          />
          <Button type="submit" size="sm" disabled={streaming || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
