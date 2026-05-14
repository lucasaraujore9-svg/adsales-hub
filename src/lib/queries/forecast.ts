import "server-only";

export interface ForecastResult {
  /** Soma ponderada (deal.value × stage.probability/100). */
  weighted: number;
  /** Soma absoluta (sem ponderação). */
  raw: number;
  /** Quebra por estágio. */
  byStage: Array<{
    stageId: string;
    stageName: string;
    weighted: number;
    raw: number;
    count: number;
  }>;
}

/**
 * Calcula forecast de receita para deals abertos com `expected_close_date`
 * dentro do período (default 30 dias a partir de hoje).
 */
export async function calculateForecast(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sb: any,
  workspaceId: string,
  options: { periodDays?: number; ownerUserId?: string | null } = {},
): Promise<ForecastResult> {
  const period = options.periodDays ?? 30;
  const end = new Date(Date.now() + period * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  let q = sb
    .from("deals")
    .select("id, value, stage_id, expected_close_date")
    .eq("workspace_id", workspaceId)
    .eq("status", "open")
    .lte("expected_close_date", end);

  if (options.ownerUserId) q = q.eq("owner_user_id", options.ownerUserId);

  const { data: deals } = await q;
  const rows = (deals ?? []) as Array<{
    id: string;
    value: number | null;
    stage_id: string | null;
    expected_close_date: string | null;
  }>;

  const stageIds = Array.from(
    new Set(rows.map((d) => d.stage_id).filter(Boolean)),
  ) as string[];
  let stages: Array<{ id: string; name: string; probability: number | null }> = [];
  if (stageIds.length > 0) {
    const { data } = await sb
      .from("pipeline_stages")
      .select("id, name, probability")
      .in("id", stageIds);
    stages = (data ?? []) as typeof stages;
  }
  const stageMap = new Map(stages.map((s) => [s.id, s]));

  const byStage = new Map<
    string,
    { stageId: string; stageName: string; weighted: number; raw: number; count: number }
  >();
  let weighted = 0;
  let raw = 0;

  for (const d of rows) {
    if (!d.stage_id) continue;
    const stage = stageMap.get(d.stage_id);
    const prob = (stage?.probability ?? 50) / 100;
    const val = Number(d.value ?? 0);
    const w = val * prob;
    weighted += w;
    raw += val;
    const existing = byStage.get(d.stage_id) ?? {
      stageId: d.stage_id,
      stageName: stage?.name ?? "—",
      weighted: 0,
      raw: 0,
      count: 0,
    };
    existing.weighted += w;
    existing.raw += val;
    existing.count += 1;
    byStage.set(d.stage_id, existing);
  }

  return {
    weighted,
    raw,
    byStage: Array.from(byStage.values()).sort((a, b) => b.weighted - a.weighted),
  };
}
