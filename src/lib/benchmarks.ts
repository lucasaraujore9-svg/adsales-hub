/**
 * Benchmarks de métricas de marketing por segmento de indústria.
 *
 * Permite avaliar se um valor de CPL, ROAS, CTR, etc. está bom/médio/ruim
 * relativamente ao esperado para o segmento.
 *
 * Valores são estimativas e devem ser revisados periodicamente.
 */

export type Segment =
  | "saas"
  | "ecommerce"
  | "services"
  | "education"
  | "health"
  | "real_estate"
  | "b2b"
  | "generic";

export type Metric =
  | "cpl"
  | "cpa"
  | "roas"
  | "ctr"
  | "cpm"
  | "cpc"
  | "conversion_rate";

export type Verdict = "good" | "ok" | "bad" | "unknown";

type Range = {
  good: number;
  ok: number;
  bad: number;
  /** lower=better (CPL/CPA/CPM/CPC); higher=better (ROAS/CTR/conversion_rate). */
  direction: "lower" | "higher";
};

export const benchmarks: Record<Segment, Partial<Record<Metric, Range>>> = {
  saas: {
    cpl: { good: 30, ok: 80, bad: 150, direction: "lower" },
    cpa: { good: 200, ok: 500, bad: 1000, direction: "lower" },
    roas: { good: 4, ok: 2, bad: 1, direction: "higher" },
    ctr: { good: 0.025, ok: 0.015, bad: 0.008, direction: "higher" },
    cpc: { good: 2, ok: 5, bad: 10, direction: "lower" },
    cpm: { good: 25, ok: 60, bad: 120, direction: "lower" },
    conversion_rate: { good: 0.05, ok: 0.025, bad: 0.01, direction: "higher" },
  },
  ecommerce: {
    cpl: { good: 5, ok: 20, bad: 40, direction: "lower" },
    cpa: { good: 30, ok: 80, bad: 150, direction: "lower" },
    roas: { good: 6, ok: 3, bad: 1.5, direction: "higher" },
    ctr: { good: 0.018, ok: 0.012, bad: 0.006, direction: "higher" },
    cpc: { good: 1, ok: 2.5, bad: 5, direction: "lower" },
    cpm: { good: 18, ok: 35, bad: 80, direction: "lower" },
    conversion_rate: { good: 0.04, ok: 0.02, bad: 0.008, direction: "higher" },
  },
  services: {
    cpl: { good: 25, ok: 60, bad: 120, direction: "lower" },
    cpa: { good: 150, ok: 400, bad: 800, direction: "lower" },
    roas: { good: 5, ok: 2.5, bad: 1.2, direction: "higher" },
    ctr: { good: 0.02, ok: 0.012, bad: 0.006, direction: "higher" },
    conversion_rate: { good: 0.06, ok: 0.03, bad: 0.012, direction: "higher" },
  },
  education: {
    cpl: { good: 15, ok: 40, bad: 80, direction: "lower" },
    cpa: { good: 80, ok: 200, bad: 500, direction: "lower" },
    roas: { good: 5, ok: 2.5, bad: 1.2, direction: "higher" },
    ctr: { good: 0.022, ok: 0.013, bad: 0.007, direction: "higher" },
  },
  health: {
    cpl: { good: 20, ok: 55, bad: 110, direction: "lower" },
    roas: { good: 4, ok: 2, bad: 1, direction: "higher" },
    ctr: { good: 0.02, ok: 0.012, bad: 0.006, direction: "higher" },
  },
  real_estate: {
    cpl: { good: 35, ok: 90, bad: 200, direction: "lower" },
    roas: { good: 8, ok: 4, bad: 2, direction: "higher" },
    ctr: { good: 0.015, ok: 0.009, bad: 0.005, direction: "higher" },
  },
  b2b: {
    cpl: { good: 50, ok: 150, bad: 350, direction: "lower" },
    cpa: { good: 500, ok: 1500, bad: 3500, direction: "lower" },
    roas: { good: 3, ok: 1.5, bad: 0.8, direction: "higher" },
    ctr: { good: 0.018, ok: 0.01, bad: 0.005, direction: "higher" },
  },
  generic: {
    cpl: { good: 20, ok: 50, bad: 100, direction: "lower" },
    cpa: { good: 100, ok: 300, bad: 600, direction: "lower" },
    roas: { good: 4, ok: 2, bad: 1, direction: "higher" },
    ctr: { good: 0.02, ok: 0.012, bad: 0.006, direction: "higher" },
    cpc: { good: 1.5, ok: 4, bad: 8, direction: "lower" },
    cpm: { good: 20, ok: 50, bad: 100, direction: "lower" },
    conversion_rate: { good: 0.04, ok: 0.02, bad: 0.008, direction: "higher" },
  },
};

export function evaluateMetric(
  value: number,
  kind: Metric,
  segment: Segment = "generic",
): Verdict {
  if (!Number.isFinite(value)) return "unknown";
  const range = benchmarks[segment]?.[kind] ?? benchmarks.generic[kind];
  if (!range) return "unknown";
  if (range.direction === "lower") {
    if (value <= range.good) return "good";
    if (value <= range.ok) return "ok";
    return "bad";
  } else {
    if (value >= range.good) return "good";
    if (value >= range.ok) return "ok";
    return "bad";
  }
}

export function rangeText(kind: Metric, segment: Segment = "generic"): string {
  const r = benchmarks[segment]?.[kind] ?? benchmarks.generic[kind];
  if (!r) return "";
  const fmt = (n: number) =>
    kind === "ctr" || kind === "conversion_rate"
      ? `${(n * 100).toFixed(1)}%`
      : kind === "roas"
        ? `${n.toFixed(1)}x`
        : `R$ ${n.toFixed(0)}`;
  return r.direction === "lower"
    ? `Bom: ≤ ${fmt(r.good)} · Ruim: > ${fmt(r.bad)}`
    : `Bom: ≥ ${fmt(r.good)} · Ruim: < ${fmt(r.bad)}`;
}

export const SEGMENT_LABELS: Record<Segment, string> = {
  saas: "SaaS",
  ecommerce: "E-commerce",
  services: "Serviços",
  education: "Educação",
  health: "Saúde",
  real_estate: "Imobiliário",
  b2b: "B2B",
  generic: "Geral",
};
