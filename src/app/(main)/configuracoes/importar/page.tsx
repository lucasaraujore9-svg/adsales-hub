import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ExternalLink,
  Search,
  Upload,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Importar dados · AdSales Hub" };

const SOURCES = [
  {
    title: "Importar contatos via CSV",
    description: "Use o wizard em /contatos com upload de planilha. Cria empresas novas e dedup por email.",
    href: "/contatos",
    cta: "Abrir wizard",
    icon: Users,
    status: "available" as const,
  },
  {
    title: "Prospeccao por CNAE / cidade",
    description: "Base oficial brasileira. Aguardando integração com Receita Federal (issue 069).",
    href: "/prospeccao",
    cta: "Configurar busca",
    icon: Search,
    status: "in_progress" as const,
  },
  {
    title: "Importar empresas (CNPJ batch)",
    description: "Cole lista de CNPJs e o sistema enriquece via API de consulta.",
    href: null,
    cta: "Em breve",
    icon: Building2,
    status: "coming_soon" as const,
  },
  {
    title: "Migrar de Pipedrive / HubSpot / RD Station",
    description: "Importador com mapeamento automatico de campos + preservacao de historico.",
    href: null,
    cta: "Em breve",
    icon: Upload,
    status: "coming_soon" as const,
  },
];

const TONES: Record<string, "good" | "warn" | "neutral"> = {
  available: "good",
  in_progress: "warn",
  coming_soon: "neutral",
};

const LABELS: Record<string, string> = {
  available: "Disponivel",
  in_progress: "Em desenvolvimento",
  coming_soon: "Em breve",
};

export default function ImportHubPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="CRM"
        title="Importar dados"
        description="Hub de importacao para popular seu workspace rápido."
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {SOURCES.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[color:var(--bg-2)] text-[color:var(--ink-3)]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium">{s.title}</h3>
                    <StatusBadge label={LABELS[s.status]} tone={TONES[s.status]} />
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--ink-3)]">{s.description}</p>
                  {s.href ? (
                    <Button asChild size="sm" variant="outline" className="mt-3">
                      <Link href={s.href}>
                        {s.cta} <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="mt-3" disabled>
                      {s.cta}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <WidgetCard
        kicker="API"
        title="Importacao via API"
        className="mt-6"
        description="Para volumes acima de 10k registros ou integração continua."
      >
        <p className="text-sm text-[color:var(--ink-2)]">
          Use os endpoints REST com sua API key:
        </p>
        <div className="mt-3 space-y-2 text-xs">
          <code className="block rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 font-mono">
            POST /api/v1/contacts/bulk
          </code>
          <code className="block rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 font-mono">
            POST /api/v1/deals/bulk
          </code>
          <code className="block rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 font-mono">
            POST /api/v1/companies/bulk
          </code>
        </div>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/configuracoes/api">
            <ExternalLink className="mr-1 h-3 w-3" /> Gerenciar API keys
          </Link>
        </Button>
      </WidgetCard>
    </div>
  );
}
