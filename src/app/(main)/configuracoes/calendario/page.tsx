import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { CalendarForm } from "@/components/settings/calendar-form";

export const metadata = { title: "Calendario · AdSales Hub" };

interface IntegrationRow {
  provider: string;
  display_name: string | null;
  credentials: {
    client_id?: string;
    client_secret?: string;
    calendar_id?: string;
    ical_url?: string;
  } | null;
  status: string;
}

export default async function CalendarPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("integrations")
    .select("provider, display_name, credentials, status")
    .eq("workspace_id", session.workspaceId)
    .in("provider", ["calendar_google", "calendar_outlook", "calendar_ical"])
    .maybeSingle();

  const integration = data as IntegrationRow | null;
  const creds = integration?.credentials ?? {};
  const provider = (integration?.provider?.replace("calendar_", "") ?? "google") as
    | "google"
    | "outlook"
    | "ical";

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
        title="Calendario"
        description="Conecte Google Calendar/Outlook para o SDR IA agendar reunioes diretamente na agenda do vendedor."
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
        title={integration ? `Conectado via ${provider}` : "Configurar agenda"}
      >
        <CalendarForm
          initialProvider={provider}
          initialClientId={creds.client_id ?? ""}
          initialClientSecret={creds.client_secret ?? ""}
          initialCalendarId={creds.calendar_id ?? ""}
          initialIcalUrl={creds.ical_url ?? ""}
          hasIntegration={!!integration}
          currentProvider={integration?.provider ?? null}
        />
      </WidgetCard>
    </div>
  );
}
