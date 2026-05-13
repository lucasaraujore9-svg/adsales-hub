import Link from "next/link";
import type { ReactNode } from "react";

const BILLING_TABS = [
  { href: "/configuracoes/billing", label: "Plano atual" },
  { href: "/configuracoes/billing/creditos", label: "Creditos" },
  { href: "/configuracoes/billing/faturas", label: "Faturas" },
  { href: "/configuracoes/billing/uso", label: "Uso" },
  { href: "/configuracoes/billing/pagamento", label: "Dados de pagamento" },
];

export default function BillingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="mb-8">
        <span className="kicker">Billing</span>
        <h1 className="mt-2 text-3xl font-medium tracking-tighter2">
          Plano, uso e pagamentos
        </h1>
      </header>
      <nav className="mb-6 flex flex-wrap items-center gap-1 border-b border-[color:var(--line)]">
        {BILLING_TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-4 py-2 text-sm text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink)] data-[active=true]:border-b-2 data-[active=true]:border-[color:var(--accent)] data-[active=true]:text-[color:var(--ink)]"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
