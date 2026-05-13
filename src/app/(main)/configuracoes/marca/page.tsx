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
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <PageHeader
        kicker="Personalizacao"
        title="Marca do workspace"
        description="Accent color + logo aplicados em todo o sistema e nos relatorios white-label. Mudancas sao refletidas em tempo real."
      />

      <WidgetCard kicker="Visual" title="Identidade visual">
        <BrandingForm
          accentColor={branding.accent_color}
          accentColorLight={branding.accent_color_light}
          logoUrl={branding.logo_url}
          logoIconUrl={branding.logo_icon_url}
        />
      </WidgetCard>

      <div className="mt-6 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
        <div className="kicker">Preview</div>
        <div className="mt-3 flex items-center gap-3">
          <div
            className="inline-block h-10 w-10 rounded-md"
            style={{ background: branding.accent_color }}
          />
          <div>
            <div className="text-sm font-medium">Botao primario</div>
            <button
              className="mt-2 rounded-pill px-4 py-2 text-xs font-medium text-white"
              style={{ background: branding.accent_color }}
            >
              Ver relatorio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
