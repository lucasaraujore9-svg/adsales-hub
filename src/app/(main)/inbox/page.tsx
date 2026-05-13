import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
import { Inbox, Plug } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth/guards";
import {
  listConversations,
  conversationCounts,
} from "@/lib/queries/inbox";

export const metadata = { title: "Caixa de entrada · AdSales Hub" };

export default async function InboxIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; channel?: string; assignee?: string }>;
}) {
  const { status, channel, assignee } = await searchParams;
  const session = await getSession();
  const sb = session.supabase;

  const statusFilter = status as
    | "open"
    | "pending"
    | "snoozed"
    | "resolved"
    | "spam"
    | "all"
    | undefined;

  const validChannels = [
    "whatsapp_cloud",
    "whatsapp_unofficial",
    "instagram_dm",
    "messenger",
    "email",
    "sms",
    "live_chat",
    "telegram",
  ] as const;
  type ChannelKey = (typeof validChannels)[number];
  const channelFilter =
    channel && (validChannels as readonly string[]).includes(channel)
      ? (channel as ChannelKey)
      : undefined;

  const [conversations, counts] = await Promise.all([
    listConversations(sb, session.workspaceId, {
      status: statusFilter ?? "open",
      channel: channelFilter,
      assigneeId:
        assignee === "me"
          ? session.user.id
          : assignee === "unassigned"
            ? null
            : assignee && assignee.length > 0
              ? assignee
              : undefined,
    }),
    conversationCounts(sb, session.workspaceId),
  ]);

  if (conversations[0]) {
    const q = new URLSearchParams();
    if (status) q.set("status", status);
    if (channel) q.set("channel", channel);
    if (assignee) q.set("assignee", assignee);
    redirect(
      `/inbox/${conversations[0].id}${q.size > 0 ? `?${q.toString()}` : ""}`,
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <PageHeader
        kicker="Vendas + suporte"
        title="Caixa de entrada"
        description="Gerencia todas as conversas do time em um unico lugar, integrado ao pipeline."
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Abertas" value={String(counts.byStatus.open ?? 0)} />
        <MetricCard
          label="Nao lidas"
          value={String(counts.totalUnread)}
          emphasis="inverse"
        />
        <MetricCard label="Sem responsavel" value={String(counts.unassigned)} />
        <MetricCard
          label="Resolvidas"
          value={String(counts.byStatus.resolved ?? 0)}
          hint="historico"
        />
      </section>

      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-10 text-center">
        <Inbox className="mx-auto h-10 w-10 text-[color:var(--ink-4)]" />
        <h3 className="mt-4 text-lg font-medium">Nenhuma conversa com esses filtros</h3>
        <p className="mt-2 text-sm text-[color:var(--ink-3)]">
          Conecte seus canais (WhatsApp, Instagram, Messenger, Email, Chat do site) em{" "}
          <Link href="/configuracoes/integracoes" className="text-[color:var(--accent)]">
            Configuracoes {">"} Integracoes
          </Link>{" "}
          para receber mensagens aqui.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/inbox">Ver todas as conversas</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/configuracoes/integracoes">
              <Plug className="mr-1 h-4 w-4" /> Conectar canal
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
