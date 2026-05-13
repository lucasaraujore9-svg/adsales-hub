import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/cta-footer";
import { Arrow } from "@/components/landing/icons";
import {
  POSTS,
  postsByCategory,
  postCoverUrl,
  CATEGORY_DESCRIPTIONS,
  type PostCategory,
} from "@/lib/content/posts";

const SITE_URL = "https://adsaleshub.7iegroup.com.br";
const URL = `${SITE_URL}/blog`;

export const metadata: Metadata = {
  title: "Blog — guias, comparativos e calculadoras de marketing e vendas",
  description:
    "Conteúdo direto pra PME brasileira: comparativos com RD, Pipedrive, HubSpot e Kommo; calculadoras de ROAS, CAC e CPL; guias práticos de Meta Ads, migração e marketing digital.",
  alternates: { canonical: URL },
  openGraph: {
    url: URL,
    title: "Blog AdSales·Hub",
    description:
      "Guias, comparativos e calculadoras grátis pra operar marketing e vendas como gente grande.",
    images: [
      `${SITE_URL}/api/og?title=Blog%20AdSales%C2%B7Hub&category=Guias&subtitle=Gu%C3%ADas%2C%20comparativos%20e%20calculadoras%20pra%20PME%20brasileira`,
    ],
  },
};

const CATEGORY_ORDER: PostCategory[] = [
  "Guias",
  "Comparativos",
  "Calculadoras",
  "Glossário",
  "Para sua empresa",
];

const CATEGORY_BADGE: Record<PostCategory, { bg: string; fg: string }> = {
  Guias: { bg: "rgba(255,90,31,.12)", fg: "#B4340A" },
  Comparativos: { bg: "rgba(14,14,16,.92)", fg: "#FAFAF7" },
  Calculadoras: { bg: "#F2F1EC", fg: "#0E0E10" },
  Glossário: { bg: "rgba(14,14,16,.06)", fg: "#0E0E10" },
  "Para sua empresa": { bg: "rgba(180,52,10,.10)", fg: "#B4340A" },
};

const CATEGORY_TITLE: Record<PostCategory, string> = {
  Guias: "Guias práticos · passo a passo",
  Comparativos: "AdSales·Hub vs alternativas",
  Calculadoras: "Calculadoras grátis",
  Glossário: "O vocabulário da operação",
  "Para sua empresa": "Casos de uso por setor",
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function CollectionJsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${URL}#blog`,
    url: URL,
    name: "Blog AdSales·Hub",
    description:
      "Guias, comparativos e calculadoras de marketing e vendas pra PME brasileira.",
    inLanguage: "pt-BR",
    publisher: {
      "@type": "Organization",
      name: "AdSales·Hub",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand-assets/png/lockup-horizontal-primary-2x.png`,
      },
    },
    blogPost: POSTS.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      url: `${SITE_URL}${p.href}`,
      datePublished: p.publishedAt,
      dateModified: p.publishedAt,
      inLanguage: "pt-BR",
      image: `${SITE_URL}${postCoverUrl(p)}`,
      author: { "@type": "Organization", name: "AdSales·Hub" },
      articleSection: p.category,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export default function BlogPage() {
  const grouped = postsByCategory();
  const featured = POSTS.find((p) => p.featured) ?? POSTS[0];
  const recents = POSTS.filter((p) => p.slug !== featured.slug).slice(0, 6);

  return (
    <>
      <CollectionJsonLd />
      <div data-theme="light" className="bg-[color:var(--bg)] text-[color:var(--ink)]">
        <LandingNav />
        <main>
          {/* Hero */}
          <section className="border-b border-[color:var(--line)] py-16 md:py-24">
            <div className="mx-auto max-w-[1240px] px-6 md:px-8">
              <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-[1.4fr_1fr]">
                <div>
                  <div className="mb-5">
                    <span className="kicker">Blog · {POSTS.length} artigos</span>
                  </div>
                  <h1
                    className="m-0 max-w-[820px] font-semibold leading-[1.04] tracking-[-0.045em]"
                    style={{ fontSize: "clamp(40px, 5.6vw, 72px)" }}
                  >
                    O blog da{" "}
                    <span className="text-[color:var(--accent)]">PME que opera</span>{" "}
                    marketing como gente grande.
                  </h1>
                  <p className="mt-6 max-w-[640px] text-lg leading-[1.55] text-[color:var(--ink-3)]">
                    Sem listicle, sem opinião de quem nunca operou. Conteúdo real
                    pra quem decide onde investir verba, qual ferramenta escolher e
                    como medir resultado.
                  </p>
                </div>
                <div className="flex flex-col gap-2 text-sm text-[color:var(--ink-3)] md:items-end md:text-right">
                  <span className="kicker">Categorias</span>
                  <div className="mt-1 flex flex-wrap gap-2 md:justify-end">
                    {CATEGORY_ORDER.map((c) => {
                      const palette = CATEGORY_BADGE[c];
                      const count = (grouped[c] ?? []).length;
                      return (
                        <a
                          key={c}
                          href={`#${c.replace(/\s/g, "-").toLowerCase()}`}
                          className="rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-opacity hover:opacity-80"
                          style={{ background: palette.bg, color: palette.fg }}
                        >
                          {c} · {count}
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured + recent grid */}
          <section className="border-b border-[color:var(--line)] py-16">
            <div className="mx-auto max-w-[1240px] px-6 md:px-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
                {/* Featured */}
                <Link
                  href={featured.href}
                  className="group block overflow-hidden rounded-[26px] border border-[color:var(--line)] bg-[color:var(--panel)] transition-all hover:border-[color:var(--accent)]/40"
                >
                  <div className="aspect-[1200/630] w-full overflow-hidden bg-[color:var(--bg-2)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={postCoverUrl(featured)}
                      alt={featured.title}
                      className="h-full w-full object-cover"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                  <div className="p-7 md:p-9">
                    <div className="flex items-center gap-2 text-[12px] font-medium text-[color:var(--ink-4)]">
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[.1em]"
                        style={{
                          background: CATEGORY_BADGE[featured.category].bg,
                          color: CATEGORY_BADGE[featured.category].fg,
                        }}
                      >
                        ★ Destaque · {featured.category}
                      </span>
                      <span>·</span>
                      <span>{featured.readingMinutes} min de leitura</span>
                      <span>·</span>
                      <span>{formatDate(featured.publishedAt)}</span>
                    </div>
                    <h2
                      className="mt-3 m-0 font-semibold leading-[1.1] tracking-[-0.03em] group-hover:text-[color:var(--accent-ink)]"
                      style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
                    >
                      {featured.title}
                    </h2>
                    <p className="mt-3 text-[15.5px] leading-[1.55] text-[color:var(--ink-3)]">
                      {featured.description}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--accent-ink)]">
                      Ler artigo completo
                      <Arrow style={{ width: 14, height: 14 }} />
                    </div>
                  </div>
                </Link>

                {/* Recent compact list */}
                <div>
                  <div className="mb-4">
                    <span className="kicker">Recém-publicados</span>
                  </div>
                  <div className="flex flex-col divide-y divide-[color:var(--line)] rounded-[20px] border border-[color:var(--line)] bg-[color:var(--panel)]">
                    {recents.map((p) => (
                      <Link
                        key={p.href}
                        href={p.href}
                        className="group flex gap-4 p-4 transition-colors hover:bg-[color:var(--bg-2)]"
                      >
                        <div className="h-[82px] w-[82px] shrink-0 overflow-hidden rounded-[12px] bg-[color:var(--bg-2)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={postCoverUrl(p)}
                            alt={p.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[color:var(--ink-4)]">
                            {p.category} · {p.readingMinutes} min
                          </div>
                          <div className="mt-1 text-[14.5px] font-semibold leading-[1.3] tracking-[-0.015em] group-hover:text-[color:var(--accent-ink)]">
                            {p.title}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Por categoria */}
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat] ?? [];
            if (items.length === 0) return null;
            const id = cat.replace(/\s/g, "-").toLowerCase();
            return (
              <section
                key={cat}
                id={id}
                className="border-b border-[color:var(--line)] py-16 md:py-20"
              >
                <div className="mx-auto max-w-[1240px] px-6 md:px-8">
                  <div className="mb-2">
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[.12em]"
                      style={{
                        background: CATEGORY_BADGE[cat].bg,
                        color: CATEGORY_BADGE[cat].fg,
                      }}
                    >
                      {cat}
                    </span>
                  </div>
                  <h2
                    className="mt-4 m-0 max-w-[760px] font-semibold leading-[1.08] tracking-[-0.035em]"
                    style={{ fontSize: "clamp(28px, 3.4vw, 44px)" }}
                  >
                    {CATEGORY_TITLE[cat]}
                  </h2>
                  <p className="mt-3 max-w-[660px] text-[15.5px] leading-[1.55] text-[color:var(--ink-3)]">
                    {CATEGORY_DESCRIPTIONS[cat]}
                  </p>

                  <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => (
                      <Link
                        key={p.href}
                        href={p.href}
                        className="group flex flex-col overflow-hidden rounded-[18px] border border-[color:var(--line)] bg-[color:var(--panel)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--accent)]/40 hover:shadow-[0_24px_48px_-24px_rgba(14,14,16,0.12)]"
                      >
                        <div className="aspect-[1200/630] w-full overflow-hidden bg-[color:var(--bg-2)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={postCoverUrl(p)}
                            alt={p.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-6">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.1em] text-[color:var(--ink-4)]">
                            <span>{p.readingMinutes} min</span>
                            <span>·</span>
                            <span>
                              {new Date(p.publishedAt).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                          </div>
                          <h3 className="mt-3 m-0 text-[18px] font-semibold leading-[1.25] tracking-[-0.02em] text-[color:var(--ink)] group-hover:text-[color:var(--accent-ink)]">
                            {p.title}
                          </h3>
                          <p className="mt-2.5 flex-1 text-[14px] leading-[1.55] text-[color:var(--ink-3)]">
                            {p.description}
                          </p>
                          <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--accent-ink)]">
                            Ler artigo
                            <Arrow style={{ width: 13, height: 13 }} />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}

          {/* CTA */}
          <section className="py-20">
            <div className="mx-auto max-w-[1240px] px-6 md:px-8">
              <div className="rounded-[28px] border border-[color:var(--accent)]/30 bg-[color:var(--accent-soft)] p-10 md:p-14">
                <div className="kicker mb-3">Aplicar na prática</div>
                <h3
                  className="m-0 max-w-[640px] font-semibold leading-[1.1] tracking-[-0.03em]"
                  style={{ fontSize: "clamp(26px, 3.4vw, 40px)" }}
                >
                  Já entendeu a teoria. Hora de operar.
                </h3>
                <p className="mt-4 max-w-[560px] text-[15.5px] leading-[1.55] text-[color:var(--ink-3)]">
                  14 dias grátis sem cartão. Setup em 5 minutos. Cancele quando
                  quiser.
                </p>
                <Link
                  href="/signup"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-7 py-4 text-[15px] font-semibold text-white"
                >
                  Testar AdSales·Hub grátis
                  <Arrow style={{ width: 15, height: 15 }} />
                </Link>
              </div>
            </div>
          </section>
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
