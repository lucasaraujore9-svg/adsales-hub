import { AlertTriangle, Lightbulb, TrendingUp, Sparkles } from "lucide-react";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import type { InsightRow } from "@/lib/queries/analytics";

const SEVERITY_META = {
  info: { label: "Info", tone: "neutral", icon: Lightbulb },
  warning: { label: "Atencao", tone: "warn", icon: AlertTriangle },
  opportunity: { label: "Oportunidade", tone: "accent", icon: TrendingUp },
  critical: { label: "Critico", tone: "bad", icon: AlertTriangle },
} as const;

const AREA_LABELS = {
  traffic: "Trafego",
  sales: "Vendas",
  social: "Social",
  unified: "Unificado",
} as const;

export function InsightsList({ insights }: { insights: InsightRow[] }) {
  return (
    <WidgetCard
      kicker={`${insights.length} insights`}
      title="Descobertas automaticas"
      description="A IA revisa os dados a cada 48h e destaca o que voce deveria ver"
      padding="none"
    >
      {insights.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
          Nenhum insight ainda. Rode um ciclo manual ou aguarde o cron de 48h.
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--line)]">
          {insights.map((ins) => {
            const meta = SEVERITY_META[ins.severity];
            const Icon = meta.icon;
            return (
              <li key={ins.id} className="flex items-start gap-4 px-5 py-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    ins.severity === "critical"
                      ? "bg-[color:var(--bad)]/10 text-[color:var(--bad)]"
                      : ins.severity === "warning"
                        ? "bg-[color:var(--warn)]/10 text-[color:var(--warn)]"
                        : ins.severity === "opportunity"
                          ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                          : "bg-[color:var(--bg-2)] text-[color:var(--ink-3)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={AREA_LABELS[ins.area]} tone="neutral" />
                    <StatusBadge label={meta.label} tone={meta.tone} />
                    <span className="text-xs text-[color:var(--ink-4)]">{ins.type}</span>
                  </div>
                  <h3 className="mt-2 text-sm font-medium">{ins.title}</h3>
                  <p className="mt-1 text-sm text-[color:var(--ink-2)]">{ins.description}</p>
                  {ins.suggested_action && (
                    <div className="mt-2 flex items-start gap-2 rounded-lg border border-[color:var(--line)] bg-[color:var(--bg)] p-3">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--accent)]" />
                      <span className="text-xs">{ins.suggested_action}</span>
                    </div>
                  )}
                  <div className="mt-2 text-[10px] text-[color:var(--ink-4)]">
                    {new Date(ins.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}
