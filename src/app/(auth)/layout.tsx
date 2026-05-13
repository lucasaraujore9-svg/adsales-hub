import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
        <aside className="hidden lg:flex flex-col justify-between border-r border-[color:var(--line)] p-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="kicker">AdSales Hub</span>
          </Link>
          <div>
            <h1 className="text-5xl font-medium tracking-tighter2">
              Marketing com IA + CRM de vendas.{" "}
              <span className="italic text-[color:var(--ink-3)]">
                Tudo num lugar.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-[color:var(--ink-3)]">
              Substitua a agencia. Rode trafego pago com IA, pipeline de vendas,
              social media, landing pages e relatorios white-label — numa unica
              plataforma.
            </p>
          </div>
          <p className="text-xs text-[color:var(--ink-4)]">
            © {new Date().getFullYear()} AdSales Hub
          </p>
        </aside>
        <main className="flex items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
