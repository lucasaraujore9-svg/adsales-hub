import Link from "next/link";
import type { ReactNode } from "react";
import { LandingNav } from "@/components/landing/nav";
import { LandingFooter } from "@/components/landing/cta-footer";
import { Arrow } from "@/components/landing/icons";

export interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  kicker?: string;
  title: string;
  description?: string;
  updatedAt?: string;
  crumbs?: Crumb[];
  children: ReactNode;
  cta?: { label: string; href: string };
  coverImage?: string;
  readingMinutes?: number;
}

export function ContentLayout({
  kicker,
  title,
  description,
  updatedAt,
  crumbs,
  children,
  cta,
  coverImage,
  readingMinutes,
}: Props) {
  return (
    <div data-theme="light" className="bg-[color:var(--bg)] text-[color:var(--ink)]">
      <LandingNav />
      <article>
        {/* Header */}
        <header className="mx-auto max-w-[860px] px-6 pb-10 pt-16 md:px-8 md:pb-14 md:pt-24">
          {crumbs && crumbs.length > 0 && (
            <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-xs text-[color:var(--ink-4)]">
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {c.href ? (
                    <Link href={c.href} className="hover:text-[color:var(--ink)]">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-[color:var(--ink-3)]">{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && <span>›</span>}
                </span>
              ))}
            </nav>
          )}

          {kicker && (
            <div className="mb-5">
              <span className="kicker">{kicker}</span>
            </div>
          )}
          <h1
            className="m-0 font-semibold leading-[1.04] tracking-[-0.04em]"
            style={{ fontSize: "clamp(36px, 5.4vw, 64px)" }}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-[680px] text-lg leading-[1.55] text-[color:var(--ink-3)]">
              {description}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-[12.5px] text-[color:var(--ink-4)]">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
              AdSales·Hub
            </span>
            {updatedAt && (
              <>
                <span>·</span>
                <span>Atualizado em {updatedAt}</span>
              </>
            )}
            {typeof readingMinutes === "number" && (
              <>
                <span>·</span>
                <span>{readingMinutes} min de leitura</span>
              </>
            )}
          </div>
        </header>

        {/* Cover image */}
        {coverImage && (
          <div className="mx-auto mb-10 max-w-[1100px] px-6 md:mb-14 md:px-8">
            <div
              className="aspect-[1200/630] w-full overflow-hidden rounded-[20px] border border-[color:var(--line)] bg-[color:var(--bg-2)] md:rounded-[28px]"
              style={{ boxShadow: "0 30px 80px -30px rgba(14,14,16,.18)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImage}
                alt={title}
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="mx-auto max-w-[760px] px-6 pb-16 md:px-8 md:pb-24">
          <div className="prose-content text-[16px] leading-[1.75] text-[color:var(--ink-2)]">
            {children}
          </div>

          {cta && (
            <div className="mt-16 rounded-[24px] border border-[color:var(--accent)]/30 bg-[color:var(--accent-soft)] p-8 md:p-10">
              <h3 className="m-0 text-2xl font-semibold tracking-[-0.02em]">
                Pronto pra ver isso operando no seu negócio?
              </h3>
              <p className="mt-2 text-[15px] text-[color:var(--ink-3)]">
                14 dias grátis sem cartão. Setup em 5 minutos. Cancele quando quiser.
              </p>
              <Link
                href={cta.href}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-6 py-3.5 text-sm font-semibold text-white"
              >
                {cta.label}
                <Arrow style={{ width: 14, height: 14 }} />
              </Link>
            </div>
          )}
        </div>
      </article>
      <LandingFooter />
    </div>
  );
}
