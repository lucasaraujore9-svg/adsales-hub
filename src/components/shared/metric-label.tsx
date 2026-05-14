"use client";

import { Info } from "lucide-react";
import { metricTooltip } from "@/lib/labels";

/**
 * Renderiza um nome de métrica técnica (CPL, ROAS, etc.) com tooltip
 * explicativo em pt-BR para usuário leigo.
 */
export function MetricLabel({
  metric,
  className = "",
}: {
  metric: string;
  className?: string;
}) {
  const tip = metricTooltip(metric);
  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      title={tip}
    >
      {metric.toUpperCase()}
      <Info className="h-3 w-3 opacity-60" aria-hidden />
    </span>
  );
}
