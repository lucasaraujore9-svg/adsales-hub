import Link from "next/link";
import { Globe } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { landingPageStats } from "@/lib/queries/content";
import { LandingCardActions } from "@/components/content/landing-card-actions";
import { NewLandingButton } from "@/components/content/new-landing-button";

export const metadata = { title: "Landing Pages · AdSales Hub" };

const GRADIENTS = [
  "linear-gradient(135deg,#FF5E1A,#F59E0B)",
  "linear-gradient(135deg,#3B82F6,#6366F1)",
  "linear-gradient(135deg,#10B981,#059669)",
  "linear-gradient(135deg,#EC4899,#F43F5E)",
  "linear-gradient(135deg,#A855F7,#D946EF)",
];

export default async function LandingPagesPage() {
  const session = await getSession();
  const pages = await landingPageStats(session.supabase, session.workspaceId);
  const published = pages.filter((p) => p.published);
  const totalSubs = pages.reduce((a, p) => a + p.submissions, 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Bloco C · Conteudo"
        title="Landing Pages"
        description={`${published.length} publicadas · ${pages.length - published.length} rascunhos`}
        actions={<NewLandingButton />}
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Landings" value={String(pages.length)} />
        <MetricCard label="Publicadas" value={String(published.length)} />
        <MetricCard label="Submissoes 30d" value={totalSubs.toLocaleString("pt-BR")} emphasis="inverse" />
        <MetricCard label="Conv. media" value={pages.length > 0 ? `${((totalSubs / pages.length)).toFixed(1)}/LP` : "—"} />
      </section>

      {pages.length === 0 ? (
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-10 text-center text-sm text-[color:var(--ink-3)]">
          Nenhuma LP criada ainda. Clique em "Nova landing" para comecar.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((lp, i) => (
            <div key={lp.id} className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
              <div className="relative aspect-video" style={{ background: GRADIENTS[i % GRADIENTS.length] }}>
                <div className="absolute left-2 top-2 flex gap-1">
                  <StatusBadge label={lp.published ? "Publicada" : "Rascunho"} tone={lp.published ? "good" : "neutral"} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-white/60" />
                </div>
              </div>
              <div className="p-4">
                <Link
                  href={`/marketing/landing-pages/${lp.id}`}
                  className="block truncate text-sm font-medium hover:text-[color:var(--accent)]"
                >
                  {lp.name}
                </Link>
                <div className="text-xs text-[color:var(--ink-3)]">{lp.domain ?? "—"}/{lp.slug}</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="kicker">Submissoes</div>
                    <div className="font-mono font-medium">{lp.submissions}</div>
                  </div>
                  <div>
                    <div className="kicker">Atualizado</div>
                    <div className="font-mono font-medium text-[color:var(--ink-3)]">
                      {new Date(lp.updated_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
                <LandingCardActions
                  landingId={lp.id}
                  previewUrl={
                    lp.published && lp.domain
                      ? `https://${lp.domain}/${lp.slug}`
                      : null
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
