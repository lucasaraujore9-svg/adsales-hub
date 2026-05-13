"use client";

import { useState } from "react";

interface HourlyMetric {
  date: string;
  hour: number;
  leads: number;
  spend: number;
  ctr: number;
}

type Metric = "leads" | "spend" | "ctr";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function aggregateByDayHour(rows: HourlyMetric[], metric: Metric) {
  // 7 weekdays x 24 hours
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const counts: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const r of rows) {
    if (r.hour == null) continue;
    const d = new Date(r.date);
    if (Number.isNaN(d.getTime())) continue;
    const wd = d.getDay();
    const h = r.hour;
    if (h < 0 || h > 23) continue;
    const value = metric === "leads" ? r.leads : metric === "spend" ? r.spend : r.ctr;
    grid[wd][h] += value;
    counts[wd][h] += 1;
  }
  // for ctr we want average, not sum
  if (metric === "ctr") {
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        if (counts[d][h] > 0) grid[d][h] = grid[d][h] / counts[d][h];
      }
    }
  }
  return grid;
}

function formatValue(metric: Metric, value: number): string {
  if (metric === "spend") {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  }
  if (metric === "ctr") return `${value.toFixed(2)}%`;
  return value.toLocaleString("pt-BR");
}

export function PerformanceHeatmap({ rows }: { rows: HourlyMetric[] }) {
  const [metric, setMetric] = useState<Metric>("leads");
  const grid = aggregateByDayHour(rows, metric);
  const flat = grid.flat();
  const max = Math.max(...flat, 1);
  const total = flat.reduce((a, b) => a + b, 0);

  // Find best window
  let bestDay = 0;
  let bestHour = 0;
  let bestValue = 0;
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (grid[d][h] > bestValue) {
        bestValue = grid[d][h];
        bestDay = d;
        bestHour = h;
      }
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-[color:var(--line-2)] bg-[color:var(--panel)] p-10 text-center text-sm text-[color:var(--ink-3)]">
        Sem metricas horárias ainda. Quando o Meta Ads enviar dados granulares, o heatmap aparece
        aqui.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-pill border border-[color:var(--line-2)] p-0.5">
          {(["leads", "spend", "ctr"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={`rounded-pill px-3 py-1 text-xs font-medium transition-colors ${
                metric === m
                  ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                  : "text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
              }`}
            >
              {m === "leads" ? "Leads" : m === "spend" ? "Investimento" : "CTR medio"}
            </button>
          ))}
        </div>
        {bestValue > 0 && (
          <div className="text-xs text-[color:var(--ink-3)]">
            Melhor janela:{" "}
            <strong className="text-[color:var(--ink)]">
              {WEEKDAY_LABELS[bestDay]} {bestHour}h
            </strong>{" "}
            · {formatValue(metric, bestValue)}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        <div className="inline-block min-w-full">
          {/* Hour headers */}
          <div className="ml-12 grid gap-0.5 [grid-template-columns:repeat(24,minmax(0,1fr))]">
            {Array.from({ length: 24 }).map((_, h) => (
              <div
                key={h}
                className="text-center font-mono text-[9px] text-[color:var(--ink-4)]"
                style={{ width: "1.5rem" }}
              >
                {h % 3 === 0 ? `${h}h` : ""}
              </div>
            ))}
          </div>
          {/* Grid */}
          {WEEKDAY_LABELS.map((day, d) => (
            <div key={day} className="mt-0.5 flex items-center gap-1">
              <span className="w-10 text-right font-mono text-[10px] text-[color:var(--ink-3)]">
                {day}
              </span>
              <div className="grid gap-0.5 [grid-template-columns:repeat(24,minmax(0,1fr))]">
                {Array.from({ length: 24 }).map((_, h) => {
                  const value = grid[d][h];
                  const intensity = max > 0 ? value / max : 0;
                  const isBest = d === bestDay && h === bestHour && value > 0;
                  return (
                    <div
                      key={h}
                      title={`${day} ${h}h · ${formatValue(metric, value)}`}
                      className={`h-6 rounded-sm transition-transform hover:scale-125 ${
                        isBest ? "ring-1 ring-[color:var(--ink)]" : ""
                      }`}
                      style={{
                        width: "1.5rem",
                        backgroundColor:
                          intensity === 0
                            ? "var(--bg-2)"
                            : `color-mix(in srgb, var(--accent) ${Math.max(8, intensity * 100)}%, transparent)`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-[color:var(--ink-4)]">
        <div className="flex items-center gap-2">
          <span>Menos</span>
          <div className="flex gap-0.5">
            {[8, 25, 50, 75, 100].map((p) => (
              <div
                key={p}
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor:
                    p === 8
                      ? "var(--bg-2)"
                      : `color-mix(in srgb, var(--accent) ${p}%, transparent)`,
                }}
              />
            ))}
          </div>
          <span>Mais</span>
        </div>
        <span className="font-mono">
          Total: {formatValue(metric, total)} em {flat.filter((v) => v > 0).length} janelas
        </span>
      </div>
    </div>
  );
}
