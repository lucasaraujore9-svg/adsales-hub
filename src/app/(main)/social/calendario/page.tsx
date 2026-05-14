import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/guards";
import { listSocialAccounts, listSocialPosts } from "@/lib/queries/content";
import { getCreditBalance, getCreditCost } from "@/lib/billing/credits";
import { SocialComposerButton } from "@/components/content/social-composer-button";
import { SocialCalendar } from "@/components/social/social-calendar";

export const metadata = { title: "Calendario · Social Media · AdSales Hub" };

export default async function SocialCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  const [accounts, posts, creditBal, imageCost, videoCost] = await Promise.all([
    listSocialAccounts(session.supabase, session.workspaceId),
    listSocialPosts(session.supabase, session.workspaceId),
    getCreditBalance(session.workspaceId),
    getCreditCost("image"),
    getCreditCost("video"),
  ]);

  const scheduled = posts.filter((p) => p.status === "scheduled");
  const published = posts.filter((p) => p.status === "published");
  const drafts = posts.filter((p) => p.status === "draft" || p.status === "idea");
  const aiCreated = posts.filter((p) => !p.created_by_user_id);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Bloco C · Social"
        title="Calendario de postagens"
        description="Visualize agendados, publicados e rascunhos. Crie posts manuais ou gere com IA."
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/social">
                <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
              </Link>
            </Button>
            <SocialComposerButton
              accounts={accounts.map((a) => ({
                platform: a.platform,
                status: a.status,
              }))}
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
        <MetricCard
          label="Agendados"
          value={String(scheduled.length)}
          emphasis="inverse"
          hint="aguardam publicação"
        />
        <MetricCard label="Publicados" value={String(published.length)} />
        <MetricCard label="Rascunhos" value={String(drafts.length)} />
        <MetricCard
          label="Gerados por IA"
          value={String(aiCreated.length)}
          hint={`${posts.length} no total`}
        />
      </section>

      {posts.length === 0 ? (
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-10 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-[color:var(--ink-4)]" />
          <p className="mt-3 text-sm text-[color:var(--ink-3)]">
            Nenhum post ainda. Crie manualmente ou peca a IA gerar.
          </p>
        </div>
      ) : (
        <SocialCalendar posts={posts} monthParam={sp.month ?? null} />
      )}
    </div>
  );
}
