import "server-only";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any;

/**
 * Tempo médio em dias entre criação e fechamento de deals ganhos no período.
 */
export async function calculateTimeToClose(
  sb: DB,
  workspaceId: string,
  period: { start: string; end: string },
): Promise<number | null> {
  const { data } = await sb
    .from("deals")
    .select("created_at, closed_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "won")
    .not("closed_at", "is", null)
    .gte("closed_at", period.start)
    .lte("closed_at", period.end);
  const rows = (data ?? []) as Array<{ created_at: string; closed_at: string }>;
  if (rows.length === 0) return null;
  const totalMs = rows.reduce(
    (s, d) => s + (new Date(d.closed_at).getTime() - new Date(d.created_at).getTime()),
    0,
  );
  return totalMs / rows.length / (24 * 60 * 60 * 1000);
}

/**
 * Win rate = won / (won + lost + open com expected_close < hoje).
 */
export async function calculateWinRate(
  sb: DB,
  workspaceId: string,
  period: { start: string; end: string },
): Promise<{ wonCount: number; lostCount: number; rate: number }> {
  const [{ count: wonCount }, { count: lostCount }] = await Promise.all([
    sb
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "won")
      .gte("closed_at", period.start)
      .lte("closed_at", period.end),
    sb
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "lost")
      .gte("closed_at", period.start)
      .lte("closed_at", period.end),
  ]);
  const won = wonCount ?? 0;
  const lost = lostCount ?? 0;
  const total = won + lost;
  return {
    wonCount: won,
    lostCount: lost,
    rate: total > 0 ? won / total : 0,
  };
}

/**
 * Sales velocity simplificada: deals ganhos por dia no período.
 */
export async function calculateSalesVelocity(
  sb: DB,
  workspaceId: string,
  period: { start: string; end: string },
): Promise<number> {
  const { count } = await sb
    .from("deals")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "won")
    .gte("closed_at", period.start)
    .lte("closed_at", period.end);
  const days = Math.max(
    1,
    (new Date(period.end).getTime() - new Date(period.start).getTime()) /
      (24 * 60 * 60 * 1000),
  );
  return (count ?? 0) / days;
}

/**
 * Pipeline stuck: deals open com `stage_entered_at` < threshold.
 */
export async function getStuckDeals(
  sb: DB,
  workspaceId: string,
  thresholdDays = 30,
): Promise<
  Array<{ id: string; title: string; value: number | null; stage_id: string; stage_entered_at: string }>
> {
  const cutoff = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await sb
    .from("deals")
    .select("id, title, value, stage_id, stage_entered_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "open")
    .lte("stage_entered_at", cutoff)
    .order("stage_entered_at", { ascending: true })
    .limit(50);
  return (data ?? []) as Array<{
    id: string;
    title: string;
    value: number | null;
    stage_id: string;
    stage_entered_at: string;
  }>;
}

/**
 * Cohort de contatos: para cada mês N (criação), quantos % ainda estão
 * vinculados a deals abertos ou ganhos nos meses N+1..N+M.
 */
export async function getContactCohortRetention(
  sb: DB,
  workspaceId: string,
  monthsBack = 6,
): Promise<Array<{ cohort: string; months: number[] }>> {
  const now = new Date();
  const cohorts: Array<{ cohort: string; start: string; end: string }> = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
    cohorts.push({
      cohort: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      start,
      end,
    });
  }

  const results: Array<{ cohort: string; months: number[] }> = [];
  for (const c of cohorts) {
    const { data } = await sb
      .from("contacts")
      .select("id, created_at")
      .eq("workspace_id", workspaceId)
      .gte("created_at", c.start)
      .lt("created_at", c.end);
    const contactIds = ((data ?? []) as Array<{ id: string }>).map((r) => r.id);
    if (contactIds.length === 0) {
      results.push({ cohort: c.cohort, months: [] });
      continue;
    }

    const monthsArr: number[] = [contactIds.length];
    // M+1..M+monthsBack
    for (let m = 1; m < monthsBack; m++) {
      const checkStart = new Date(c.start);
      checkStart.setMonth(checkStart.getMonth() + m);
      const checkEnd = new Date(checkStart);
      checkEnd.setMonth(checkEnd.getMonth() + 1);
      const { data: actives } = await sb
        .from("deals")
        .select("contact_id")
        .in("contact_id", contactIds)
        .gte("created_at", checkStart.toISOString())
        .lt("created_at", checkEnd.toISOString());
      const uniq = new Set(((actives ?? []) as Array<{ contact_id: string }>).map((d) => d.contact_id));
      monthsArr.push(uniq.size);
    }
    results.push({ cohort: c.cohort, months: monthsArr });
  }

  return results;
}
