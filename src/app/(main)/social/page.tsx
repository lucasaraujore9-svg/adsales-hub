import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/guards";
import { listSocialAccounts, listSocialPosts } from "@/lib/queries/content";
import { getCreditBalance, getCreditCost } from "@/lib/billing/credits";
import { SocialComposerButton } from "@/components/content/social-composer-button";

export const metadata = { title: "Social Media · AdSales Hub" };

const STATUS_META = {
  idea: { label: "Ideia", tone: "neutral" },
  draft: { label: "Rascunho", tone: "neutral" },
  pending_approval: { label: "Aprovacao", tone: "warn" },
  approved: { label: "Aprovado", tone: "accent" },
  scheduled: { label: "Agendado", tone: "accent" },
  publishing: { label: "Publicando", tone: "warn" },
  published: { label: "Publicado", tone: "good" },
  failed: { label: "Falha", tone: "bad" },
  rejected: { label: "Rejeitado", tone: "bad" },
} as const;

const GRADIENTS = [
  "linear-gradient(135deg,#FF5E1A,#F59E0B)",
  "linear-gradient(135deg,#3B82F6,#6366F1)",
  "linear-gradient(135deg,#10B981,#059669)",
  "linear-gradient(135deg,#EC4899,#F43F5E)",
  "linear-gradient(135deg,#A855F7,#D946EF)",
];

function platformLabel(p: string) {
  return ({
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    tiktok: "TikTok",
    youtube: "YouTube",
    pinterest: "Pinterest",
  } as Record<string, string>)[p] ?? p;
}

export default async function SocialPage() {
  const session = await getSession();
  const [accounts, posts, creditBal, imageCost, videoCost] = await Promise.all([
    listSocialAccounts(session.supabase, session.workspaceId),
    listSocialPosts(session.supabase, session.workspaceId),
    getCreditBalance(session.workspaceId),
    getCreditCost("image"),
    getCreditCost("video"),
  ]);

  const published = posts.filter((p) => p.status === "published");
  const scheduled = posts.filter((p) => p.status === "scheduled");
  const pending = posts.filter((p) => p.status === "pending_approval");

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Bloco C · Social"
        title="Social Media"
        description="Calendario, criador de post, aprovacao externa, publicacao automatica multi-rede"
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/social/calendario">
                <CalendarDays className="mr-1 h-4 w-4" /> Calendario
              </Link>
            </Button>
            <SocialComposerButton
              accounts={accounts.map((a) => ({ platform: a.platform, status: a.status }))}
              credits={{
                balance: creditBal.balance,
                monthlyAllowanceRemaining: creditBal.monthlyAllowanceRemaining,
                imageCost: imageCost ?? 10,
                videoCost: videoCost ?? 100,
                unlimited: creditBal.unlimited,
              }}
            />
          </>
        }
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Contas ativas" value={String(accounts.filter((a) => a.status === "active").length)} hint={`${accounts.length} conectadas`} />
        <MetricCard label="Posts publicados" value={String(published.length)} />
        <MetricCard label="Agendados" value={String(scheduled.length)} emphasis="inverse" />
        <MetricCard label="Aprovacao" value={String(pending.length)} hint="aguardam revisao" />
      </section>

      <section className="mb-8">
        <WidgetCard kicker="Contas" title="Redes conectadas">
          <div className="flex flex-wrap gap-2">
            {accounts.map((a) => (
              <div
                key={a.id}
                className={`flex items-center gap-2 rounded-pill border px-3 py-1.5 text-sm ${
                  a.status === "active"
                    ? "border-[color:var(--line-2)]"
                    : "border-[color:var(--bad)]/30 bg-[color:var(--bad)]/5"
                }`}
              >
                <span className="text-xs text-[color:var(--ink-3)]">{platformLabel(a.platform)}</span>
                <span className="font-medium">{a.account_name}</span>
                {a.status !== "active" && <StatusBadge label={a.status} tone="bad" />}
              </div>
            ))}
            <Button asChild variant="outline" size="sm">
              <Link href="/social/contas">
                <Plus className="mr-1 h-4 w-4" /> Conectar
              </Link>
            </Button>
          </div>
        </WidgetCard>
      </section>

      {posts.length === 0 ? (
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-10 text-center text-sm text-[color:var(--ink-3)]">
          Nenhum post ainda. Crie um com IA.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {posts.map((p, i) => {
            const meta = STATUS_META[p.status as keyof typeof STATUS_META] ?? STATUS_META.draft;
            const plats = Array.isArray(p.platforms) ? p.platforms : [];
            return (
              <article key={p.id} className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
                <div className="relative aspect-square" style={{ background: GRADIENTS[i % GRADIENTS.length] }}>
                  <div className="absolute left-2 top-2">
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </div>
                  <div className="absolute right-2 top-2 flex gap-0.5">
                    {plats.map((pl: string) => (
                      <div key={pl} className="rounded-full bg-black/40 px-1.5 py-0.5 text-[9px] font-medium uppercase text-white">
                        {pl.slice(0, 2)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <p className="line-clamp-3 text-sm">{p.content_text}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(p.hashtags ?? []).slice(0, 3).map((h) => (
                      <span key={h} className="text-[10px] text-[color:var(--accent)]">{h}</span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
