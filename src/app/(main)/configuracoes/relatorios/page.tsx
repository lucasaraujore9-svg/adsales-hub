import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { getSession } from "@/lib/auth/guards";
import { ReportsBrandingForm } from "@/components/settings/reports-branding-form";

export const metadata = { title: "Relatorios white-label · AdSales Hub" };

export default async function ReportsBrandingPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("workspaces")
    .select("settings")
    .eq("id", session.workspaceId)
    .maybeSingle();
  const settings =
    ((data as { settings?: Record<string, unknown> } | null)?.settings ?? {}) as Record<
      string,
      unknown
    >;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="Relatorios"
        title="Relatorios white-label"
        description="Personalizacao visual dos PDFs gerados. Aplica em todos os relatorios exportados via /relatorios."
      />

      <WidgetCard kicker="Branding" title="Visual do PDF">
        <ReportsBrandingForm
          initialLogoUrl={String(settings.reports_logo_url ?? "")}
          initialAccent={String(settings.reports_accent_color ?? "")}
          initialFooter={String(settings.reports_footer ?? "")}
          initialContactEmail={String(settings.reports_contact_email ?? "")}
        />
      </WidgetCard>
    </div>
  );
}
