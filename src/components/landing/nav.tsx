"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Arrow, Logo, Wordmark } from "./icons";
import { useMagnetic, useSlideDownOnMount } from "@/lib/animations";

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const headerRef = useSlideDownOnMount<HTMLElement>({ duration: 750, distance: 28 });
  const ctaRef = useMagnetic<HTMLAnchorElement>({ strength: 10 });

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // On landing, use plain "#anchor" (smooth scroll). Elsewhere, use "/#anchor"
  // so Next routes to landing page first and then jumps to the anchor.
  const anchor = (id: string) => (isLanding ? `#${id}` : `/#${id}`);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 transition-all"
      style={{
        background: scrolled
          ? "color-mix(in oklab, var(--bg) 80%, transparent)"
          : "transparent",
        backdropFilter: scrolled ? "saturate(180%) blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 md:px-8 md:py-[18px]">
        <Link
          href={isLanding ? "#top" : "/"}
          className="flex items-center gap-2.5 text-[color:var(--ink)]"
        >
          <Logo size={26} />
          <Wordmark size={17} />
        </Link>
        <nav className="hidden gap-8 text-[13.5px] font-normal text-[color:var(--ink-3)] md:flex">
          <Link href={anchor("módulos")} className="hover:text-[color:var(--ink)]">
            Plataforma
          </Link>
          <Link href={anchor("módulos")} className="hover:text-[color:var(--ink)]">
            Módulos
          </Link>
          <Link href={anchor("como")} className="hover:text-[color:var(--ink)]">
            Como funciona
          </Link>
          <Link href={anchor("precos")} className="hover:text-[color:var(--ink)]">
            Preços
          </Link>
          <Link href="/blog" className="hover:text-[color:var(--ink)]">
            Blog
          </Link>
          <Link href={anchor("faq")} className="hover:text-[color:var(--ink)]">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-[13.5px] text-[color:var(--ink-2)] hover:text-[color:var(--ink)]"
          >
            Entrar
          </Link>
          <Link
            ref={ctaRef}
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--ink)] bg-[color:var(--ink)] px-5 py-3 text-sm font-medium text-[color:var(--bg)] hover:opacity-90"
          >
            Começar grátis
            <Arrow style={{ width: 14, height: 14 }} />
          </Link>
        </div>
      </div>
    </header>
  );
}
