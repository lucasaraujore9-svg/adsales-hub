import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { WhatsappConfigForm } from "@/components/settings/whatsapp-config-form";

export const metadata = { title: "WhatsApp Cloud API · AdSales Hub" };

interface IntegrationRow {
  id: string;
  display_name: string | null;
  credentials: {
    phone_number_id?: string;
    business_account_id?: string;
    access_token?: string;
    verify_token?: string;
  } | null;
  status: string;
  last_sync_at: string | null;
}

export default async function WhatsappPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("integrations")
    .select("id, display_name, credentials, status, last_sync_at")
    .eq("workspace_id", session.workspaceId)
    .eq("provider", "whatsapp_cloud")
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
        title="WhatsApp Cloud API"
        description="Conecte sua conta Meta WhatsApp Business para receber e enviar mensagens via inbox unificado."
        actions={
          integration && (
            <StatusBadge
              label={integration.status === "active" ? "Conectado" : integration.status}
              tone={integration.status === "active" ? "good" : "warn"}
            />
          )
        }
      />

      <WidgetCard kicker="Credenciais Meta" title="WhatsApp Business Cloud API">
        <WhatsappConfigForm
          initialPhoneNumberId={creds.phone_number_id ?? ""}
          initialBusinessAccountId={creds.business_account_id ?? ""}
          initialAccessToken={creds.access_token ?? ""}
          initialVerifyToken={creds.verify_token ?? ""}
          initialDisplayName={integration?.display_name ?? ""}
          hasIntegration={!!integration}
        />
      </WidgetCard>
    </div>
  );
}
