import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/guards";
import { getWorkspaceAccess, canAccess } from "@/lib/billing/feature-gate";

const MODULE_LABELS: Record<string, string> = {
  ads: "Trafego Pago com IA",
  social: "Social Media",
  msg: "Mensagens (Email + WhatsApp)",
  sdr: "SDR + Agente de Voz IA",
  bi: "BI / Analytics",
  site: "Landing Pages",
  sign: "Contratos / E-signature",
};

/**
 * Server component that renders `children` when the given module slug is
 * active for the current workspace, otherwise an upsell CTA pointing to
 * /upgrade. Useful to gate entire pages without needing the proxy rewrite.
 */
export async function ModuleGate({
  module: slug,
  children,
}: {
  module: string;
  children: ReactNode;
}) {
  const session = await getSession();
  const access = await getWorkspaceAccess(session.workspaceId);

  if (access && canAccess(access, slug)) {
    return <>{children}</>;
  }

  const label = MODULE_LABELS[slug] ?? slug;
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
        ⚡
      </div>
      <h1 className="mt-6 text-3xl font-medium tracking-tighter2">
        {label} nao esta incluido na sua cesta
      </h1>
      <p className="mt-4 text-sm text-[color:var(--ink-3)]">
        Contrate o modulo individualmente ou faca upgrade para uma cesta que ja o inclua.
      </p>
      <Button asChild className="mt-6">
        <Link href={`/upgrade?module=${slug}`}>Ver opcoes</Link>
      </Button>
    </div>
  );
}
