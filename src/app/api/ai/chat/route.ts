import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/guards";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  thread_id: z.string().uuid().optional(),
  message: z.string().min(1),
});

interface MessageRow {
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

interface ThreadRow {
  id: string;
  workspace_id: string;
}

/**
 * POST /api/ai/chat
 * Body: { thread_id?, message }
 *
 * Streams Claude's response as text chunks (`text/event-stream`-ish,
 * one JSON per line). On the first call without thread_id, a new thread is
 * created and its id is sent as the first chunk with type "thread_id".
 */
export async function POST(request: NextRequest) {
  const { user, supabase } = await requireAuth();

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();

  // Get or create thread
  let threadId = parsed.data.thread_id;
  const { data: userRow } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("id", user.id)
    .single<{ workspace_id: string }>();
  const workspaceId = userRow?.workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: "no_workspace" }, { status: 400 });
  }

  if (!threadId) {
    const title = parsed.data.message.slice(0, 60);
    const { data: created } = await admin
      .from("ai_chat_threads")
      .insert({
        workspace_id: workspaceId,
        user_id: user.id,
        title,
      } as never)
      .select("id")
      .single();
    threadId = (created as unknown as { id: string })?.id;
  }

  if (!threadId) {
    return NextResponse.json({ error: "thread_create_failed" }, { status: 500 });
  }

  // Insert user message
  await admin.from("ai_chat_messages").insert({
    workspace_id: workspaceId,
    thread_id: threadId,
    role: "user",
    content: parsed.data.message,
  } as never);

  // Fetch last ~20 messages for context
  const { data: historyRaw } = await admin
    .from("ai_chat_messages")
    .select("role, content, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(40);
  const history = (historyRaw ?? []) as unknown as MessageRow[];

  // Gather workspace context for Claude
  const [{ data: campRaw }, { data: dealsRaw }] = await Promise.all([
    admin
      .from("campaigns")
      .select("id, name, status")
      .eq("workspace_id", workspaceId)
      .limit(15),
    admin
      .from("deals")
      .select("id, title, status, value")
      .eq("workspace_id", workspaceId)
      .limit(30),
  ]);
  const ctx = {
    campaigns: campRaw ?? [],
    deals: dealsRaw ?? [],
  };

  const systemPrompt = `Voce e o assistente de IA do AdSales Hub, um SaaS de marketing + vendas integrado.
Responda perguntas usando o contexto de dados do workspace do usuario (campanhas, pipeline, social, emails).
Seja conciso, direto e use portugues brasileiro. Cite numeros exatos quando aparecerem no contexto.
Se nao tiver dados suficientes, diga explicitamente qual informacao falta.
Contexto do workspace (parcial):
${JSON.stringify(ctx).slice(0, 4000)}`;

  const encoder = new TextEncoder();
  const hasKey = Boolean(serverEnv().ANTHROPIC_API_KEY);

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      // First event: thread_id
      send({ type: "thread_id", thread_id: threadId });

      let fullAnswer = "";

      try {
        if (hasKey) {
          const { getAnthropic, DEFAULT_MODEL } = await import("@/lib/ai/client");
          const anthropic = getAnthropic();
          const response = await anthropic.messages.stream({
            model: DEFAULT_MODEL,
            max_tokens: 2048,
            temperature: 0.5,
            system: systemPrompt,
            messages: history.map((m) => ({
              role: m.role === "user" ? "user" : "assistant",
              content: m.content,
            })),
          });

          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              fullAnswer += event.delta.text;
              send({ type: "delta", text: event.delta.text });
            }
          }
        } else {
          // Stub mode — stream a canned answer slowly so the UI still feels live
          const canned = [
            "IA em modo demo (sem ANTHROPIC_API_KEY). ",
            "\n\nPergunta recebida: ",
            `"${parsed.data.message}"\n\n`,
            "Para habilitar respostas reais, configure ANTHROPIC_API_KEY no .env.local.\n\n",
            "Dados disponiveis no workspace agora mesmo:\n",
            `- ${ctx.campaigns.length} campanhas\n`,
            `- ${ctx.deals.length} negocios no pipeline\n`,
          ];
          for (const chunk of canned) {
            fullAnswer += chunk;
            send({ type: "delta", text: chunk });
            await new Promise((r) => setTimeout(r, 70));
          }
        }

        // Persist assistant message
        await admin.from("ai_chat_messages").insert({
          workspace_id: workspaceId,
          thread_id: threadId,
          role: "assistant",
          content: fullAnswer,
        } as never);

        // Update thread counters
        await admin
          .from("ai_chat_threads")
          .update({
            last_message_at: new Date().toISOString(),
            message_count: history.length + 1, // history includes the user msg
          } as never)
          .eq("id", threadId);

        send({ type: "done" });
      } catch (err) {
        console.error("[ai/chat] stream failed", err);
        send({
          type: "error",
          message: err instanceof Error ? err.message : "unknown",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-thread-id": threadId,
    },
  });
}
