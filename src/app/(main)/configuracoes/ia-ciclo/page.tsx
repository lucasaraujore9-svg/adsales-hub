import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { getSession } from "@/lib/auth/guards";
import { OptimizationLevelForm } from "@/components/settings/optimization-level-form";

export const metadata = { title: "Motor de IA · AdSales Hub" };

type Level = "manual" | "semi" | "full";

export default async function OptimizationCyclePage() {
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
  const level: Level =
    (settings.optimization_level as Level) ?? "manual";
  const maxBudget = Number(settings.optimization_max_daily_budget ?? 0);
  const maxCpl = Number(settings.optimization_max_cpl ?? 0);
  const minRoas = Number(settings.optimization_min_roas ?? 0);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="Marketing"
        title="Motor de IA"
        description="Define o quanto o otimizador IA pode agir sozinho. O motor analisa campanhas a cada 48h e gera sugestões ou aplica ações conforme o nível."
      />

      <WidgetCard kicker="Nivel de automação" title="Quanto a IA pode decidir por você">
        <OptimizationLevelForm
          initialLevel={level}
          initialMaxDailyBudget={maxBudget}
          initialMaxCpl={maxCpl}
          initialMinRoas={minRoas}
        />
      </WidgetCard>
    </div>
  );
}
