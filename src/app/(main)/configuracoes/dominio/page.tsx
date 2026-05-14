import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { getSession } from "@/lib/auth/guards";
import { DomainForm } from "@/components/settings/domain-form";

export const metadata = { title: "Dominio · AdSales Hub" };

interface WorkspaceRow {
  subdomain: string | null;
  domain: string | null;
}

export default async function DomainPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("workspaces")
    .select("subdomain, domain")
    .eq("id", session.workspaceId)
    .maybeSingle();
  const ws = (data ?? { subdomain: null, domain: null }) as WorkspaceRow;

  const publicAppDomain =
    process.env.NEXT_PUBLIC_APP_DOMAIN ?? "adsaleshub.7iegroup.com.br";

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="Marketing"
        title="Dominio custom"
        description="Hospede landing pages e o app em subdominio proprio + dominio customizado."
      />

      <WidgetCard kicker="Subdomain + dominio" title="Onde você será publicado">
        <DomainForm
          initialSubdomain={ws.subdomain ?? ""}
          initialDomain={ws.domain ?? ""}
          publicAppDomain={publicAppDomain}
        />
      </WidgetCard>
    </div>
  );
}
