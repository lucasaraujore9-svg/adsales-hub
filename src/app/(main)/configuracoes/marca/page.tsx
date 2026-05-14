import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { getSession } from "@/lib/auth/guards";
import { getBranding } from "@/lib/queries/branding";
import { BrandingForm } from "@/components/branding/branding-form";

export const metadata = { title: "Marca · AdSales Hub" };

export default async function BrandingPage() {
  const session = await getSession();
  const branding = await getBranding(session.supabase, session.workspaceId);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PageHeader
        kicker="Personalização"
        title="Marca do workspace"
        description="Cor de destaque e logo aplicados em todo o sistema, emails e relatórios white-label. Veja o preview ao vivo enquanto edita."
      />

      <WidgetCard kicker="Identidade visual" title="Edite e veja o resultado em tempo real">
        <BrandingForm
          accentColor={branding.accent_color}
          accentColorLight={branding.accent_color_light}
          logoUrl={branding.logo_url}
          logoIconUrl={branding.logo_icon_url}
          workspaceName={session.workspaceName}
        />
      </WidgetCard>
    </div>
  );
}
