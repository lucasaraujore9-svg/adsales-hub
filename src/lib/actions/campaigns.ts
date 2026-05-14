"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/guards";
import { canAccess, getWorkspaceAccess } from "@/lib/billing/feature-gate";
import { serverEnv } from "@/lib/env";

const createSchema = z.object({
  name: z.string().min(3),
  objective: z.enum([
    "lead_gen",
    "traffic",
    "conversions",
    "engagement",
    "awareness",
    "sales",
    "app_promotion",
  ]),
  daily_budget: z.coerce.number().min(1),
  status: z.enum(["draft", "active", "paused"]).default("draft"),
  ad_account_id: z.string().uuid(),
  ai_briefing: z.string().optional(),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "active", "paused", "ended", "archived"]).optional(),
  name: z.string().min(3).optional(),
  daily_budget: z.coerce.number().min(1).optional(),
});

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

export async function createCampaign(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const access = await getWorkspaceAccess(session.workspaceId);
  if (!access || !canAccess(access, "ads")) {
    return { ok: false, error: "Modulo Trafego Pago IA não contratado." };
  }

  const body = {
    ...parsed.data,
    workspace_id: session.workspaceId,
  };
  const { data, error } = await session.supabase
    .from("campaigns")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/campanhas");
  revalidatePath("/dashboard");
  return { ok: true, data: data as { id: string } };
}

export async function updateCampaign(input: unknown): Promise<ActionResult> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const { id, ...patch } = parsed.data;

  const { data: prevData } = await session.supabase
    .from("campaigns")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  const prevStatus = (prevData as { status?: string } | null)?.status ?? null;

  const { error } = await session.supabase
    .from("campaigns")
    .update(patch as never)
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/campanhas");
  revalidatePath(`/campanhas/${id}`);

  if (patch.status && patch.status !== prevStatus) {
    void (async () => {
      const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
      if (patch.status === "active") {
        await dispatchWebhook(session.workspaceId, "campaign.published", {
          campaign_id: id,
        });
      } else if (patch.status === "paused") {
        await dispatchWebhook(session.workspaceId, "campaign.paused", {
          campaign_id: id,
        });
      }
    })();
  }

  return { ok: true };
}

export async function toggleCampaignStatus(
  id: string,
  status: "active" | "paused",
): Promise<ActionResult> {
  return updateCampaign({ id, status });
}

export async function deleteCampaign(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase.from("campaigns").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/campanhas");
  return { ok: true };
}

/**
 * Generates a full campaign via Claude from a briefing, stores the resulting
 * config in the campaign row, and redirects to the preview step. When the
 * Anthropic key is not configured, falls back to a stubbed config so the UX
 * still flows.
 */
export async function generateCampaignWithAI(formData: FormData): Promise<void> {
  "use server";
  const briefing = String(formData.get("briefing") ?? "").trim();
  if (briefing.length < 10) {
    redirect("/campanhas/nova?error=briefing_curto");
  }

  const session = await getSession();

  // Ensure we have at least one ad account
  const { data: accounts } = await session.supabase
    .from("ad_accounts")
    .select("id, currency, timezone")
    .eq("workspace_id", session.workspaceId)
    .limit(1);
  let accountRow = (accounts ?? []) as unknown as { id: string; currency: string; timezone: string }[];
  let accountId: string;
  if (accountRow.length === 0) {
    // create placeholder account
    const { data: created } = await session.supabase
      .from("ad_accounts")
      .insert({
        workspace_id: session.workspaceId,
        provider: "meta",
        provider_account_id: "act_demo_auto",
        name: "Conta Meta (auto-criada)",
        currency: "BRL",
        timezone: "America/Sao_Paulo",
        status: "active",
      } as never)
      .select("id, currency, timezone")
      .single();
    accountRow = created ? [(created as unknown as { id: string; currency: string; timezone: string })] : [];
    accountId = accountRow[0]?.id ?? "";
  } else {
    accountId = accountRow[0]!.id;
  }

  let generated: Record<string, unknown> = {};
  let name = "Campanha gerada via IA";
  if (serverEnv().ANTHROPIC_API_KEY) {
    try {
      const { generateCampaign } = await import("@/lib/ai");
      const result = await generateCampaign(
        briefing,
        { accountCurrency: accountRow[0]?.currency ?? "BRL", accountTimezone: accountRow[0]?.timezone ?? "America/Sao_Paulo" },
        { workspaceId: session.workspaceId },
      );
      generated = result as unknown as Record<string, unknown>;
      name = result.campaign.name;
    } catch (err) {
      console.error("[ai/campaign-gen] falha", err);
      generated = stubGenerated(briefing);
      name = "Campanha gerada (stub — falha IA)";
    }
  } else {
    generated = stubGenerated(briefing);
    name = "Campanha gerada (stub — sem ANTHROPIC_API_KEY)";
  }

  const objective = (generated.campaign as { objective?: string } | undefined)?.objective ?? "lead_gen";
  const dailyBudget = (generated.campaign as { daily_budget?: number } | undefined)?.daily_budget ?? 50;

  const { data: campaign } = await session.supabase
    .from("campaigns")
    .insert({
      workspace_id: session.workspaceId,
      ad_account_id: accountId,
      name,
      objective,
      status: "draft",
      daily_budget: dailyBudget,
      start_date: new Date().toISOString().slice(0, 10),
      ai_briefing: briefing,
      ai_generated_config: generated,
    } as never)
    .select("id")
    .single();

  revalidatePath("/campanhas");
  const id = (campaign as unknown as { id: string })?.id;
  redirect(id ? `/campanhas/${id}` : "/campanhas");
}

function stubGenerated(briefing: string) {
  return {
    campaign: {
      name: "Lead Gen AI — Demo",
      objective: "lead_gen",
      daily_budget: 50,
    },
    ad_sets: [
      { name: "Lookalike 1% Clientes", daily_budget: 25, placements: ["feed_facebook", "feed_instagram"], targeting: { age_min: 30, age_max: 55, genders: ["all"] } },
      { name: "Gestores Mkt PMEs", daily_budget: 25, placements: ["feed_instagram"], targeting: { age_min: 28, age_max: 50, genders: ["all"] } },
    ],
    ads: [
      { name: "Hero v1", headline: "Substitua sua agencia por IA", primary_text: "Trafego pago + CRM integrado. Trial 14 dias.", cta: "SAIBA_MAIS" },
    ],
    reasoning: {
      audience: "Mix de lookalike + interesse ampliado.",
      creative: "Texto direto focado em ROI.",
      budget: "Dividido por 2 ad sets para teste.",
      expected_outcome: "CPL 10-14 BRL.",
    },
    briefing_used: briefing,
    mode: "stub",
  };
}
