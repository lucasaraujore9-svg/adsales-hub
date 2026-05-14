import {
  evaluateMetric,
  rangeText,
  SEGMENT_LABELS,
  type Metric,
  type Segment,
  type Verdict,
} from "@/lib/benchmarks";

const verdictStyles: Record<Verdict, string> = {
  good: "text-[color:var(--good)] bg-[color:var(--good)]/10",
  ok: "text-[color:var(--warn)] bg-[color:var(--warn)]/10",
  bad: "text-[color:var(--bad)] bg-[color:var(--bad)]/10",
  unknown: "text-[color:var(--ink-3)] bg-[color:var(--bg-2)]",
};

const verdictIcons: Record<Verdict, string> = {
  good: "✓",
  ok: "~",
  bad: "✗",
  unknown: "·",
};

const verdictMessages: Record<Verdict, string> = {
  good: "Dentro da faixa boa",
  ok: "Pode melhorar",
  bad: "Acima do esperado",
  unknown: "Sem benchmark",
};

/**
 * Badge que mostra o valor de uma métrica com cor/ícone indicando
 * se está bom/médio/ruim em relação ao benchmark do segmento.
 */
export function MetricBadge({
  value,
  displayValue,
  kind,
  segment = "generic",
  className = "",
}: {
  /** Valor numérico da métrica (ex: 45 para CPL R$45). */
  value: number;
  /** Texto formatado para exibição (ex: "R$ 45" ou "2.1x"). */
  displayValue: string;
  /** Tipo da métrica. */
  kind: Metric;
  /** Segmento de indústria do workspace. */
  segment?: Segment;
  className?: string;
}) {
  const verdict = evaluateMetric(value, kind, segment);
  const tooltip = `${verdictMessages[verdict]} para ${SEGMENT_LABELS[segment]}.\n${rangeText(kind, segment)}`;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${verdictStyles[verdict]} ${className}`}
      title={tooltip}
    >
      <span aria-hidden>{verdictIcons[verdict]}</span>
      <span>{displayValue}</span>
    </span>
  );
}
