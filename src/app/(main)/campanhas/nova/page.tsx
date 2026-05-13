import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateCampaignWithAI } from "@/lib/actions/campaigns";
import { serverEnv } from "@/lib/env";

export const metadata = { title: "Nova campanha · AdSales Hub" };

export default async function NovaCampanhaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const hasKey = Boolean(serverEnv().ANTHROPIC_API_KEY);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <Link href="/campanhas" className="text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]">
        ← Hub de campanhas
      </Link>
      <PageHeader
        kicker="Criar campanha"
        title="Briefing em texto → campanha completa"
        description="Escreva o que voce quer e a IA monta ad_sets, ads, lead form e salva como rascunho."
      />

      {!hasKey && (
        <div className="mb-4 rounded-lg border border-[color:var(--warn)]/30 bg-[color:var(--warn)]/10 p-3 text-xs text-[color:var(--warn)]">
          <Sparkles className="mr-1 inline h-3 w-3" /> ANTHROPIC_API_KEY nao configurada. A campanha sera criada com config stub (voce pode rodar a IA depois).
        </div>
      )}

      {error === "briefing_curto" && (
        <div className="mb-4 rounded-lg border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/10 p-3 text-xs text-[color:var(--bad)]">
          Briefing precisa ter pelo menos 10 caracteres.
        </div>
      )}

      <WidgetCard kicker="1. Briefing" title="Conte para a IA o que voce quer">
        <form action={generateCampaignWithAI} className="space-y-4">
          <Textarea
            name="briefing"
            className="min-h-[200px] resize-none"
            defaultValue="Quero gerar leads qualificados de gestores de marketing de empresas B2B SaaS com 50-500 funcionarios. Budget: R$ 150/dia por 30 dias. Oferta: trial de 14 dias do AdSales Hub. Tom: direto, com foco em ROI e reducao de custo vs agencia."
          />
          <div className="flex items-center gap-2 text-xs text-[color:var(--ink-3)]">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--accent)]" />
            Dica: seja especifico em publico, oferta, tom de voz e CTA.
          </div>
          <div className="flex justify-end">
            <Button type="submit">
              Gerar e salvar rascunho <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </form>
      </WidgetCard>
    </div>
  );
}
