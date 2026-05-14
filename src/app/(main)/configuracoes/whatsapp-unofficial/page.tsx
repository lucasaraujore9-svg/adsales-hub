import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { WhatsappUnofficialForm } from "@/components/settings/whatsapp-unofficial-form";

export const metadata = { title: "WhatsApp não oficial · AdSales Hub" };

interface IntegrationRow {
  display_name: string | null;
  credentials: {
    provider_name?: string;
    base_url?: string;
    instance_id?: string;
    token?: string;
    display_phone?: string;
  } | null;
  status: string;
}

export default async function WhatsappUnofficialPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("integrations")
    .select("display_name, credentials, status")
    .eq("workspace_id", session.workspaceId)
    .eq("provider", "whatsapp_unofficial")
    .maybeSingle();

  const integration = data as IntegrationRow | null;
  const creds = integration?.credentials ?? {};

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="Canais"
        title="WhatsApp não oficial"
        description="Conecte providers como Z-API, UAZAPI, Evolution ou WPPConnect self-hosted."
        actions={
          integration && (
            <StatusBadge
              label={integration.status === "active" ? "Conectado" : integration.status}
              tone={integration.status === "active" ? "good" : "warn"}
            />
          )
        }
      />

      <WidgetCard
        kicker="Provider"
        title={integration ? `${integration.display_name ?? "Conectado"}` : "Configurar"}
      >
        <WhatsappUnofficialForm
          initialProviderName={creds.provider_name ?? ""}
          initialBaseUrl={creds.base_url ?? ""}
          initialInstanceId={creds.instance_id ?? ""}
          initialToken={creds.token ?? ""}
          initialDisplayPhone={creds.display_phone ?? ""}
          hasIntegration={!!integration}
        />
      </WidgetCard>
    </div>
  );
}
