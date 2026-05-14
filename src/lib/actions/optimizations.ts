"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/guards";
import { campaignsWithMetrics } from "@/lib/queries/marketing";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

export async function setOptimizationStatus(
  id: string,
  status: "approved" | "rejected" | "applied",
) {
  const session = await getSession();
  const patch: Record<string, unknown> = { status };
  if (status === "applied") patch.applied_at = new Date().toISOString();
  const { error } = await session.supabase
    .from("ai_optimization_logs")
    .update(patch as never)
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/campanhas/otimizador");
  revalidatePath("/dashboard");
  return { ok: true };
}

interface OptimizationSeed {
  campaign_id: string;
  type: "suggestion";
  action:
    | "pause_ad"
    | "resume_ad"
    | "increase_budget"
    | "decrease_budget"
    | "new_creative"
    | "adjust_audience"
    | "pause_campaign"
    | "resume_campaign"
    | "custom";
  priority: "low" | "medium" | "high" | "critical";
  target: string;
  rationale: string;
}

export async function runOptimizationCycle(): Promise<
  ActionResult<{ created: number }>
> {
  const session = await getSession();
  const sb = session.supabase;
  const campaigns = await campaignsWithMetrics(sb, session.workspaceId);
  if (campaigns.length === 0) return { ok: true, data: { created: 0 } };

  const cplValues = campaigns
    .filter((c) => c.cpl > 0 && c.spend > 0)
    .map((c) => c.cpl)
    .sort((a, b) => a - b);
  const medianCpl =
    cplValues.length > 0 ? cplValues[Math.floor(cplValues.length / 2)] : 0;

  const seeds: OptimizationSeed[] = [];

  for (const c of campaigns) {
    if (c.status === "active" && c.cpl > 0 && medianCpl > 0 && c.cpl > medianCpl * 2) {
      seeds.push({
        campaign_id: c.id,
        type: "suggestion",
        action: "pause_campaign",
        priority: "high",
        target: c.name,
        rationale: `CPL ${c.cpl.toFixed(2)} esta ${(c.cpl / medianCpl).toFixed(1)}x acima da mediana do workspace.`,
      });
    }
    if (c.status === "active" && c.frequency > 3 && c.ctr < 1.0 && c.spend > 50) {
      seeds.push({
        campaign_id: c.id,
        type: "suggestion",
        action: "new_creative",
        priority: "medium",
        target: c.name,
        rationale: `Frequencia ${c.frequency.toFixed(2)}x com CTR ${c.ctr.toFixed(2)}% indica fadiga de criativo.`,
      });
    }
    if (c.status === "active" && c.roas >= 5 && c.spend > 100) {
      seeds.push({
        campaign_id: c.id,
        type: "suggestion",
        action: "increase_budget",
        priority: "high",
        target: c.name,
        rationale: `ROAS ${c.roas.toFixed(1)}x — escalonar investimento.`,
      });
    }
    if (c.status === "active" && c.roas > 0 && c.roas < 1 && c.spend > 100) {
      seeds.push({
        campaign_id: c.id,
        type: "suggestion",
        action: "decrease_budget",
        priority: "high",
        target: c.name,
        rationale: `ROAS ${c.roas.toFixed(2)}x — reduzir orcamento ate ajustar criativos/público.`,
      });
    }
    if (c.status === "paused" && c.roas >= 3 && c.spend > 50) {
      seeds.push({
        campaign_id: c.id,
        type: "suggestion",
        action: "resume_campaign",
        priority: "medium",
        target: c.name,
        rationale: `Pausada com ROAS historico ${c.roas.toFixed(1)}x — vale reativar.`,
      });
    }
  }

  const { data: existing } = await sb
    .from("ai_optimization_logs")
    .select("campaign_id, action, status")
    .eq("workspace_id", session.workspaceId)
    .eq("status", "pending");

  const existingKeys = new Set(
    ((existing ?? []) as { campaign_id: string | null; action: string }[]).map(
      (e) => `${e.campaign_id}::${e.action}`,
    ),
  );

  const newSeeds = seeds.filter(
    (s) => !existingKeys.has(`${s.campaign_id}::${s.action}`),
  );

  if (newSeeds.length === 0) {
    revalidatePath("/campanhas/otimizador");
    return { ok: true, data: { created: 0 } };
  }

  const inserts = newSeeds.map((s) => ({
    workspace_id: session.workspaceId,
    campaign_id: s.campaign_id,
    type: s.type,
    action: s.action,
    status: "pending" as const,
    details: { target: s.target, rationale: s.rationale, priority: s.priority },
  }));

  const { error } = await sb.from("ai_optimization_logs").insert(inserts as never);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/campanhas/otimizador");
  revalidatePath("/dashboard");
  return { ok: true, data: { created: newSeeds.length } };
}
