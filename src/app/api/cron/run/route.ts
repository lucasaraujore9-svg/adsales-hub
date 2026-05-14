import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Generic cron runner. Protected by CRON_SECRET (pass as Authorization: Bearer
 * <secret>, or ?secret=<secret>). Each `task` flag runs a different job:
 *
 * /api/cron/run?task=metrics_collect   — pull Meta insights for last 2 days
 * /api/cron/run?task=ai_optimize       — Claude -> ai_optimization_logs
 * /api/cron/run?task=ai_insights       — Claude -> ai_insights
 * /api/cron/run?task=trial_expiry      — expire trials past trial_end
 * /api/cron/run?task=social_publish    — publish scheduled social posts due now
 * /api/cron/run?task=dunning           — dunning emails 1/3/7 days after failure
 */
export async function POST(request: NextRequest) {
  return handle(request);
}
export async function GET(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest) {
  const secret = serverEnv().CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization") ?? "";
    const header = auth.replace(/^Bearer\s+/i, "");
    const query = request.nextUrl.searchParams.get("secret");
    if (header !== secret && query !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const task = request.nextUrl.searchParams.get("task") ?? "all";
  const results: Record<string, unknown> = {};

  if (task === "metrics_collect" || task === "all") {
    results.metrics_collect = await collectMetaMetrics();
  }
  if (task === "ai_optimize" || task === "all") {
    results.ai_optimize = await runAiOptimization();
  }
  if (task === "ai_insights" || task === "all") {
    results.ai_insights = await runAiInsights();
  }
  if (task === "trial_expiry" || task === "all") {
    results.trial_expiry = await expireTrials();
  }
  if (task === "social_publish" || task === "all") {
    results.social_publish = await runSocialPublish();
  }
  if (task === "recording_purge" || task === "all") {
    results.recording_purge = await runRecordingPurge();
  }
  if (task === "goals_recalc" || task === "all") {
    results.goals_recalc = await runGoalsRecalc();
  }
  if (task === "proposal_reminders" || task === "all") {
    results.proposal_reminders = await runProposalReminders();
  }
  if (task === "email_dispatch" || task === "all") {
    results.email_dispatch = await runEmailDispatch();
  }
  if (task === "weekly_digest") {
    // Apenas via task=weekly_digest (rodar 1x/semana no schedule externo).
    results.weekly_digest = await runWeeklyDigest();
  }

  return NextResponse.json({ ok: true, task, results });
}

async function runWeeklyDigest() {
  try {
    const { sendWeeklyDigests } = await import("@/lib/digest/weekly");
    return await sendWeeklyDigests();
  } catch (err) {
    console.error("[cron/weekly_digest]", err);
    return { error: err instanceof Error ? err.message : "Falha desconhecida" };
  }
}

async function runEmailDispatch() {
  try {
    const { createAdminSupabaseClient } = await import("@/lib/supabase/admin");
    const { dispatchEmailCampaign } = await import("@/lib/email/dispatcher");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminSupabaseClient() as any;
    const now = new Date().toISOString();
    const { data: rows } = await admin
      .from("email_campaigns")
      .select("id")
      .eq("status", "scheduled")
      .lte("scheduled_at", now)
      .limit(10);
    const ids = ((rows ?? []) as { id: string }[]).map((r) => r.id);
    const results: Array<unknown> = [];
    for (const id of ids) {
      try {
        results.push({ id, ...(await dispatchEmailCampaign(id)) });
      } catch (e) {
        results.push({ id, error: String(e) });
      }
    }
    return { scheduled: ids.length, results };
  } catch (err) {
    console.error("[cron/email_dispatch]", err);
    return {
      error: err instanceof Error ? err.message : "Falha desconhecida",
    };
  }
}

async function runProposalReminders() {
  try {
    const { sendProposalReminders } = await import("@/lib/contracts/reminders");
    return await sendProposalReminders();
  } catch (err) {
    console.error("[cron/proposal_reminders]", err);
    return {
      error: err instanceof Error ? err.message : "Falha desconhecida",
    };
  }
}

async function runGoalsRecalc() {
  try {
    const { createAdminSupabaseClient } = await import("@/lib/supabase/admin");
    const { recalculateAllActiveGoals } = await import("@/lib/goals/recalculate");
    return await recalculateAllActiveGoals(createAdminSupabaseClient());
  } catch (err) {
    console.error("[cron/goals_recalc] erro", err);
    return {
      error: err instanceof Error ? err.message : "Falha desconhecida",
    };
  }
}

async function runRecordingPurge() {
  try {
    const { createAdminSupabaseClient } = await import("@/lib/supabase/admin");
    const admin = createAdminSupabaseClient() as unknown as {
      from: (t: string) => {
        select: (cols: string) => {
          lt: (col: string, val: string) => {
            not: (col: string, op: string, val: unknown) => {
              is: (col: string, val: unknown) => Promise<{
                data: Array<{ id: string; recording_url: string }> | null;
              }>;
            };
          };
        };
        update: (body: Record<string, unknown>) => {
          eq: (col: string, val: unknown) => Promise<{ error: { message?: string } | null }>;
        };
      };
    };
    const now = new Date().toISOString();
    const { data: expired } = await admin
      .from("sdr_calls")
      .select("id, recording_url")
      .lt("recording_retention_until", now)
      .not("recording_url", "is", null)
      .is("recording_purged_at", null);
    const rows = expired ?? [];
    let purged = 0;
    for (const row of rows) {
      const { error } = await admin
        .from("sdr_calls")
        .update({
          recording_url: null,
          recording_purged_at: now,
        })
        .eq("id", row.id);
      if (!error) purged += 1;
    }
    return { found: rows.length, purged };
  } catch (err) {
    console.error("[cron/recording_purge] erro", err);
    return {
      error: err instanceof Error ? err.message : "Falha desconhecida",
    };
  }
}

async function runSocialPublish() {
  try {
    const { publishDueSocialPosts } = await import("@/lib/social/publisher");
    return await publishDueSocialPosts({ limit: 25 });
  } catch (err) {
    console.error("[cron/social_publish] erro", err);
    return {
      error: err instanceof Error ? err.message : "Falha desconhecida",
    };
  }
}

async function collectMetaMetrics() {
  if (!serverEnv().META_APP_SECRET) return { skipped: "META_APP_SECRET not configured" };
  const admin = createAdminSupabaseClient();
  const { data: accounts } = await admin
    .from("ad_accounts")
    .select("id")
    .eq("provider", "meta")
    .eq("status", "active");
  const rows = (accounts ?? []) as unknown as { id: string }[];
  let ok = 0;
  for (const a of rows) {
    try {
      const { getMetaToken } = await import("@/lib/meta/token-manager");
      const { fetchInsights, normalizeInsight } = await import("@/lib/meta/insights");
      const token = await getMetaToken(a.id);
      const res = await fetchInsights(token.accessToken, a.id, {
        level: "account",
        date_preset: "last_3d",
        time_increment: 1,
      });
      // persistence would join campaign/adset/ad ids; placeholder here
      ok += res.data.map(normalizeInsight).length;
    } catch (err) {
      console.error("[cron/metrics] failed for", a.id, err);
    }
  }
  return { collected: ok, accounts: rows.length };
}

async function runAiOptimization() {
  if (!serverEnv().ANTHROPIC_API_KEY) return { skipped: "ANTHROPIC_API_KEY not configured" };
  const admin = createAdminSupabaseClient();
  const { data: wsRows } = await admin.from("workspaces").select("id").limit(25);
  const workspaces = (wsRows ?? []) as unknown as { id: string }[];
  let created = 0;
  for (const w of workspaces) {
    try {
      const { optimizeCampaigns } = await import("@/lib/ai");
      const { campaignsWithMetrics } = await import("@/lib/queries/marketing");
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const sb = await createServerSupabaseClient();
      const campaigns = await campaignsWithMetrics(sb, w.id);
      if (campaigns.length === 0) continue;
      const plan = await optimizeCampaigns(
        { metrics: campaigns, automationLevel: "suggestion_only" },
        { workspaceId: w.id },
      );
      for (const action of plan.actions) {
        await admin.from("ai_optimization_logs").insert({
          workspace_id: w.id,
          campaign_id: action.target.scope === "campaign" ? action.target.id : null,
          type: action.type,
          action: action.action,
          details: action as unknown as Record<string, unknown>,
          status: "pending",
        } as never);
        created++;
      }
    } catch (err) {
      console.error("[cron/ai_optimize] workspace", w.id, err);
    }
  }
  return { created };
}

async function runAiInsights() {
  if (!serverEnv().ANTHROPIC_API_KEY) return { skipped: "ANTHROPIC_API_KEY not configured" };
  const admin = createAdminSupabaseClient();
  const { data: wsRows } = await admin.from("workspaces").select("id").limit(25);
  const workspaces = (wsRows ?? []) as unknown as { id: string }[];
  let created = 0;
  for (const w of workspaces) {
    try {
      const { generateInsights } = await import("@/lib/ai");
      const { campaignsWithMetrics } = await import("@/lib/queries/marketing");
      const { dealStats } = await import("@/lib/queries/crm");
      const { createServerSupabaseClient } = await import("@/lib/supabase/server");
      const sb = await createServerSupabaseClient();
      const [campaigns, stats] = await Promise.all([
        campaignsWithMetrics(sb, w.id),
        dealStats(sb, w.id),
      ]);
      if (campaigns.length === 0) continue;
      const response = await generateInsights(
        { campaigns: campaigns.slice(0, 10), pipeline: stats },
        { workspaceId: w.id },
      );
      for (const ins of response.insights) {
        await admin.from("ai_insights").insert({
          workspace_id: w.id,
          area: ins.area,
          type: ins.type,
          title: ins.title,
          description: ins.description,
          severity: ins.severity,
          suggested_action: ins.suggested_action ?? null,
          action_type: ins.action_type ?? null,
          details: ins.details ?? null,
          valid_until: ins.valid_until ?? null,
        } as never);
        created++;
      }
    } catch (err) {
      console.error("[cron/ai_insights] workspace", w.id, err);
    }
  }
  return { created };
}

async function expireTrials() {
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("subscriptions")
    .select("id, workspace_id, trial_end")
    .eq("status", "trialing");
  const rows = (data ?? []) as unknown as {
    id: string;
    workspace_id: string;
    trial_end: string | null;
  }[];
  const now = Date.now();
  let expired = 0;
  for (const s of rows) {
    if (s.trial_end && new Date(s.trial_end).getTime() < now) {
      await admin
        .from("subscriptions")
        .update({ status: "past_due" } as never)
        .eq("id", s.id);
      expired++;
    }
  }
  return { expired, checked: rows.length };
}
