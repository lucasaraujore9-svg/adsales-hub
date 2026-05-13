import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { getSession } from "@/lib/auth/guards";
import { AiSettingsForm } from "@/components/settings/ai-settings-form";

export const metadata = { title: "IA geral · AdSales Hub" };

export default async function AiSettingsPage() {
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
        kicker="IA"
        title="IA geral"
        description="Modelo padrao, criatividade, tokens e orcamento mensal. Aplica em todas as features IA do workspace."
      />

      <WidgetCard kicker="Configuracao" title="Modelo e limites">
        <AiSettingsForm
          initialModel={String(settings.ai_default_model ?? "claude-sonnet-4-6")}
          initialTemperature={Number(settings.ai_temperature ?? 0.5)}
          initialMaxTokens={Number(settings.ai_max_tokens ?? 4000)}
          initialMonthlyBudget={Number(settings.ai_monthly_budget_usd ?? 0)}
        />
      </WidgetCard>
    </div>
  );
}
