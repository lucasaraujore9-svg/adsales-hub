import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { EmailProviderForm } from "@/components/settings/email-provider-form";

export const metadata = { title: "Email · AdSales Hub" };

interface IntegrationRow {
  provider: string;
  display_name: string | null;
  credentials: {
    api_key?: string;
    from_email?: string;
    from_name?: string;
    reply_to?: string;
  } | null;
  status: string;
}

export default async function GmailPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("integrations")
    .select("provider, display_name, credentials, status")
    .eq("workspace_id", session.workspaceId)
    .in("provider", ["resend", "smtp", "gmail"])
    .maybeSingle();

  const integration = data as IntegrationRow | null;
  const creds = integration?.credentials ?? {};
  const provider = (integration?.provider ?? "resend") as "resend" | "smtp" | "gmail";

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
        title="Email do time"
        description="Provider para envio de emails do CRM (sequencias, follow-ups, automacoes). Resend recomendado pra produção."
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
        title={integration ? `Conectado via ${provider}` : "Configurar envio"}
      >
        <EmailProviderForm
          initialProvider={provider}
          initialApiKey={creds.api_key ?? ""}
          initialFromEmail={creds.from_email ?? ""}
          initialFromName={creds.from_name ?? ""}
          initialReplyTo={creds.reply_to ?? ""}
          hasIntegration={!!integration}
          currentProvider={integration?.provider ?? null}
        />
      </WidgetCard>
    </div>
  );
}
