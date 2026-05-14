import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { listOptimizationLogs } from "@/lib/queries/marketing";
import { OptimizationRowActions } from "@/components/campaigns/optimization-row-actions";
import { RunOptimizationButton } from "@/components/campaigns/run-optimization-button";

export const metadata = { title: "Otimizador IA · AdSales Hub" };

const PRIORITY_TONES = {
  critical: "bad",
  high: "warn",
  medium: "accent",
  low: "neutral",
} as const;

export default async function OptimizerPage() {
  const session = await getSession();
  const logs = await listOptimizationLogs(session.supabase, session.workspaceId);
  const pending = logs.filter((s) => s.status === "pending").length;
  const applied = logs.filter((s) => s.status === "applied").length;
  const approved = logs.filter((s) => s.status === "approved").length;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Motor de IA"
        title="Otimizador com IA"
        description="Analisa campanhas a cada 48h. Sugere ou aplica ações conforme o nível configurado."
        actions={<RunOptimizationButton />}
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Pendentes" value={String(pending)} hint="aguardam sua revisão" />
        <MetricCard label="Aprovadas" value={String(approved)} hint="na próxima execução" />
        <MetricCard label="Aplicadas" value={String(applied)} hint="nos últimos 30 dias" />
        <MetricCard label="Total" value={String(logs.length)} emphasis="inverse" />
      </section>

      <WidgetCard kicker="Sugestoes" title={`${pending} ações aguardando revisão`} padding="none">
        {logs.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhuma sugestao ainda. O ciclo roda automaticamente quando cron_jobs estiverem configurados.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {logs.map((s) => {
              const priority = (s.details?.priority as string) ?? "medium";
              const tone = PRIORITY_TONES[priority as keyof typeof PRIORITY_TONES] ?? "neutral";
              return (
                <li key={s.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge label={s.action.replace(/_/g, " ")} tone="accent" />
                        <StatusBadge label={priority} tone={tone} />
                        <span className="text-[10px] uppercase tracking-kicker text-[color:var(--ink-4)]">
                          {s.type}
                        </span>
                      </div>
                      <h3 className="mt-2 text-sm font-medium">
                        {String((s.details?.target as string) ?? "—")}
                      </h3>
                      <p className="mt-1 text-sm text-[color:var(--ink-2)]">
                        {String((s.details?.rationale as string) ?? (s.details?.reason as string) ?? "")}
                      </p>
                      <p className="mt-2 text-[10px] text-[color:var(--ink-4)]">
                        {new Date(s.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {s.status === "pending" ? (
                        <OptimizationRowActions id={s.id} />
                      ) : (
                        <StatusBadge
                          label={s.status}
                          tone={
                            s.status === "applied"
                              ? "good"
                              : s.status === "approved"
                                ? "accent"
                                : "bad"
                          }
                        />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </WidgetCard>
    </div>
  );
}
