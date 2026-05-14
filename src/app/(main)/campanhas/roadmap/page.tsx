import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata = { title: "Roadmap de plataformas · AdSales Hub" };

const PLATFORMS = [
  { name: "Meta (Facebook + Instagram)", status: "live", desc: "Campaigns, ad_sets, ads, lead forms, audiences, insights, Conversions API — issue 028", tone: "good" as const },
  { name: "Google Ads", status: "q3 2026", desc: "Search + Display + YouTube In-stream via Google Ads API v18. Mesmo fluxo de briefing IA - issue 074.", tone: "warn" as const },
  { name: "TikTok Ads", status: "q3 2026", desc: "Spark Ads + performance audiencias semelhantes. Brand takeovers opcionais.", tone: "warn" as const },
  { name: "LinkedIn Ads", status: "q4 2026", desc: "Sponsored Content + Message Ads. Targeting B2B.", tone: "neutral" as const },
];

export default function RoadmapPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <PageHeader
        kicker="Bloco B · Roadmap"
        title="Mais plataformas em breve"
        description="Estamos expandindo para além de Meta. Mesmo fluxo de briefing IA aplicado em cada rede."
      />

      <div className="grid grid-cols-1 gap-3">
        {PLATFORMS.map((p) => (
          <WidgetCard
            key={p.name}
            kicker={p.status}
            title={p.name}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-[color:var(--ink-2)]">{p.desc}</p>
              <StatusBadge
                label={p.status === "live" ? "Disponivel" : "Em breve"}
                tone={p.tone}
              />
            </div>
          </WidgetCard>
        ))}
      </div>
    </div>
  );
}
