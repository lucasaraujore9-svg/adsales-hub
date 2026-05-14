import { TrendingUp } from "lucide-react";
import type { ForecastResult } from "@/lib/queries/forecast";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function ForecastCard({
  period,
  forecast,
}: {
  period: number;
  forecast: ForecastResult;
}) {
  return (
    <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
          Forecast {period} dias
        </p>
        <TrendingUp className="h-4 w-4 text-[color:var(--accent)]" />
      </div>
      <p
        className="mt-2 text-2xl font-medium"
        title={`Soma ponderada (valor × probabilidade do estágio) dos deals abertos com fechamento esperado em até ${period} dias.`}
      >
        {brl(forecast.weighted)}
      </p>
      <p className="text-xs text-[color:var(--ink-3)]">
        {brl(forecast.raw)} em pipeline bruto
      </p>

      {forecast.byStage.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {forecast.byStage.slice(0, 4).map((s) => {
            const pct = forecast.weighted > 0 ? (s.weighted / forecast.weighted) * 100 : 0;
            return (
              <div key={s.stageId} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="truncate text-[color:var(--ink-3)]">{s.stageName}</span>
                  <span className="font-medium">{brl(s.weighted)}</span>
                </div>
                <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-[color:var(--bg-2)]">
                  <div
                    className="h-full bg-[color:var(--accent)]"
                    style={{ width: `${pct.toFixed(1)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
