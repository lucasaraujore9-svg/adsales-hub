import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  kicker: string;
  title: string;
  updatedAt: string;
  children: ReactNode;
}

export function LegalLayout({ kicker, title, updatedAt, children }: Props) {
  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]">
      <header className="border-b border-[color:var(--line)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-sm font-medium tracking-tighter2">
            AdSales Hub
          </Link>
          <nav className="flex items-center gap-4 text-xs text-[color:var(--ink-3)]">
            <Link href="/privacy" className="hover:text-[color:var(--ink)]">
              Privacidade
            </Link>
            <Link href="/terms" className="hover:text-[color:var(--ink)]">
              Termos
            </Link>
            <Link
              href="/login"
              className="rounded-pill border border-[color:var(--line-2)] px-3 py-1 text-[color:var(--ink)] hover:bg-[color:var(--bg-2)]"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="kicker">{kicker}</div>
        <h1 className="mt-2 text-4xl font-medium tracking-tighter2">{title}</h1>
        <p className="mt-2 text-sm text-[color:var(--ink-4)]">
          Ultima atualizacao: {updatedAt}
        </p>

        <article className="prose-legal mt-10 space-y-6 text-sm leading-relaxed text-[color:var(--ink-2)]">
          {children}
        </article>
      </main>

      <footer className="mt-16 border-t border-[color:var(--line)] py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 px-6 text-xs text-[color:var(--ink-4)] sm:flex-row">
          <span>© {new Date().getFullYear()} AdSales Hub. Todos os direitos reservados.</span>
          <span>
            Contato:{" "}
            <a
              href="mailto:suporte@7iegroup.com.br"
              className="text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
            >
              suporte@7iegroup.com.br
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
