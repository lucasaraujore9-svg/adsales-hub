import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { getSession } from "@/lib/auth/guards";
import { TrackingForm } from "@/components/settings/tracking-form";

export const metadata = { title: "Pixel e tracking · AdSales Hub" };

export default async function PixelPage() {
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
        kicker="Marketing"
        title="Pixel e tracking"
        description="IDs de tracking aplicados em landing pages e Conversions API."
      />

      <WidgetCard kicker="IDs" title="Cole os identificadores">
        <TrackingForm
          initialMetaPixel={String(settings.tracking_meta_pixel_id ?? "")}
          initialGa4={String(settings.tracking_ga4_measurement_id ?? "")}
          initialGtm={String(settings.tracking_gtm_container_id ?? "")}
        />
      </WidgetCard>
    </div>
  );
}
