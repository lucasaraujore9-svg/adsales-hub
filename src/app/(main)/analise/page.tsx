import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/guards";
import { listInsights } from "@/lib/queries/analytics";
import { ChatLive } from "@/components/analise/chat-live";
import { InsightsList } from "@/components/analise/insights-list";

export const metadata = { title: "Analise com IA · AdSales Hub" };

interface ThreadSummary {
  id: string;
  title: string;
  last_message_at: string;
  message_count: number;
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string }>;
}) {
  const { thread: threadIdParam } = await searchParams;
  const session = await getSession();
  const sb = session.supabase;

  const [insights, { data: threadsRaw }, messages] = await Promise.all([
    listInsights(sb, session.workspaceId),
    sb
      .from("ai_chat_threads")
      .select("id, title, last_message_at, message_count")
      .order("last_message_at", { ascending: false })
      .limit(20),
    threadIdParam
      ? sb
          .from("ai_chat_messages")
          .select("id, role, content, created_at")
          .eq("thread_id", threadIdParam)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [] }),
  ]);

  const threads = (threadsRaw ?? []) as unknown as ThreadSummary[];
  const initialMessages = (messages.data ?? []) as unknown as {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    created_at: string;
  }[];

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Bloco D"
        title="Chat com a IA"
        description="Conversa ao vivo com streaming. A IA tem contexto do seu workspace (campanhas, pipeline, social, email)."
      />

      <ChatLive
        threads={threads}
        initialThreadId={threadIdParam ?? null}
        initialMessages={initialMessages}
      />

      <section className="mt-8">
        <InsightsList insights={insights} />
      </section>
    </div>
  );
}
