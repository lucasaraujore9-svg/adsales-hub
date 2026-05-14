import "server-only";

/**
 * Recalcula o valor `achieved` de uma meta com base em dados reais
 * do banco. Não depende dos tipos gerados (usa `any` para flexibilidade).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any;

interface GoalRow {
  id: string;
  workspace_id: string;
  scope: "user" | "team" | "workspace";
  owner_user_id: string | null;
  metric: string;
  period_start: string;
  period_end: string;
}

export async function recalculateGoal(sb: DB, goalId: string): Promise<number | null> {
  const { data } = await sb
    .from("goals")
    .select("id, workspace_id, scope, owner_user_id, metric, period_start, period_end")
    .eq("id", goalId)
    .maybeSingle();
  const goal = data as GoalRow | null;
  if (!goal) return null;

  // period_end é DATE no DB; convertemos para timestamp incluindo o dia inteiro.
  const start = `${goal.period_start}T00:00:00.000Z`;
  const end = `${goal.period_end}T23:59:59.999Z`;
  const ws = goal.workspace_id;

  let achieved = 0;

  switch (goal.metric) {
    case "revenue": {
      let q = sb
        .from("deals")
        .select("value")
        .eq("workspace_id", ws)
        .eq("status", "won")
        .gte("closed_at", start)
        .lte("closed_at", end);
      if (goal.scope === "user" && goal.owner_user_id)
        q = q.eq("owner_user_id", goal.owner_user_id);
      const { data: rows } = await q;
      achieved = (rows ?? []).reduce(
        (s: number, d: { value: number | null }) => s + Number(d.value ?? 0),
        0,
      );
      break;
    }
    case "deals_won": {
      let q = sb
        .from("deals")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", ws)
        .eq("status", "won")
        .gte("closed_at", start)
        .lte("closed_at", end);
      if (goal.scope === "user" && goal.owner_user_id)
        q = q.eq("owner_user_id", goal.owner_user_id);
      const { count } = await q;
      achieved = count ?? 0;
      break;
    }
    case "deals_created": {
      let q = sb
        .from("deals")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", ws)
        .gte("created_at", start)
        .lte("created_at", end);
      if (goal.scope === "user" && goal.owner_user_id)
        q = q.eq("owner_user_id", goal.owner_user_id);
      const { count } = await q;
      achieved = count ?? 0;
      break;
    }
    case "activities": {
      let q = sb
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", ws)
        .eq("completed", true)
        .gte("completed_at", start)
        .lte("completed_at", end);
      if (goal.scope === "user" && goal.owner_user_id)
        q = q.eq("user_id", goal.owner_user_id);
      const { count } = await q;
      achieved = count ?? 0;
      break;
    }
    case "calls": {
      // sdr_calls não tem user_id direto; usamos contagem global do workspace.
      const { count } = await sb
        .from("sdr_calls")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", ws)
        .gte("started_at", start)
        .lte("started_at", end);
      achieved = count ?? 0;
      break;
    }
    case "meetings": {
      let q = sb
        .from("activities")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", ws)
        .in("type", ["meeting", "video_meeting", "demo"])
        .eq("completed", true)
        .gte("completed_at", start)
        .lte("completed_at", end);
      if (goal.scope === "user" && goal.owner_user_id)
        q = q.eq("user_id", goal.owner_user_id);
      const { count } = await q;
      achieved = count ?? 0;
      break;
    }
    case "leads": {
      const { count } = await sb
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", ws)
        .gte("created_at", start)
        .lte("created_at", end);
      achieved = count ?? 0;
      break;
    }
    // cpl/roas/spend: dependem de métricas agregadas externas — adiar.
    default:
      return null;
  }

  await sb
    .from("goals")
    .update({
      achieved,
      last_calculated_at: new Date().toISOString(),
    })
    .eq("id", goalId);

  return achieved;
}

/**
 * Recalcula todas as metas com período corrente.
 * Usado pelo cron `goals_recalc`.
 */
export async function recalculateAllActiveGoals(sb: DB): Promise<{
  total: number;
  recalculated: number;
  errors: number;
}> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: rows } = await sb
    .from("goals")
    .select("id")
    .lte("period_start", today)
    .gte("period_end", today);

  const goals = (rows ?? []) as { id: string }[];
  let recalculated = 0;
  let errors = 0;
  for (const g of goals) {
    try {
      await recalculateGoal(sb, g.id);
      recalculated += 1;
    } catch (err) {
      console.error("[goals_recalc] failed", g.id, err);
      errors += 1;
    }
  }
  return { total: goals.length, recalculated, errors };
}

/**
 * Helper para disparar recalc após evento que afeta metas (deal won,
 * activity completed, etc.). Chama em background.
 */
export async function triggerGoalRecalcForMetrics(
  sb: DB,
  workspaceId: string,
  metrics: string[],
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await sb
    .from("goals")
    .select("id")
    .eq("workspace_id", workspaceId)
    .in("metric", metrics)
    .lte("period_start", today)
    .gte("period_end", today);
  const goals = (data ?? []) as { id: string }[];
  for (const g of goals) {
    try {
      await recalculateGoal(sb, g.id);
    } catch (err) {
      console.error("[goals_recalc:trigger]", g.id, err);
    }
  }
}
