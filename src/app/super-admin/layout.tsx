import Link from "next/link";
import type { ReactNode } from "react";
import { Shield, ArrowLeft } from "lucide-react";
import { requireStaff } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/super-admin", label: "Visao geral" },
  { href: "/super-admin/workspaces", label: "Workspaces" },
  { href: "/super-admin/users", label: "Usuarios" },
  { href: "/super-admin/staff", label: "Equipe interna" },
  { href: "/super-admin/credits", label: "Creditos" },
  { href: "/super-admin/jobs", label: "Jobs & Cron" },
];

const STAFF_ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  engineering: "Engenharia",
  customer_success: "Customer Success",
  support: "Suporte",
  sales: "Vendas",
};

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
  const session = await requireStaff();
  const staffLabel = session.isSuperAdmin
    ? "Super Admin"
    : session.staffRole
      ? STAFF_ROLE_LABEL[session.staffRole] ?? session.staffRole
      : "Equipe";

  return (
    <div className="min-h-dvh bg-[color:var(--bg)] text-[color:var(--ink)]">
      <header className="sticky top-0 z-30 border-b border-[color:var(--bad)]/30 bg-[color:var(--bg)]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[color:var(--bad)]" />
            <span className="font-mono text-xs uppercase tracking-kicker text-[color:var(--bad)]">
              {staffLabel}
            </span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm text-[color:var(--ink-3)] transition-colors hover:bg-[color:var(--bg-2)] hover:text-[color:var(--ink)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs text-[color:var(--ink-4)] md:inline">
              {session.profile.email}
            </span>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Voltar ao app
              </Link>
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-6 pb-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
