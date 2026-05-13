"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const goalSchema = z.object({
  scope: z.enum(["user", "team", "workspace"]),
  owner_user_id: z.string().uuid().optional().nullable(),
  metric: z.enum([
    "revenue",
    "deals_won",
    "deals_created",
    "activities",
    "calls",
    "meetings",
    "leads",
    "cpl",
    "roas",
    "spend",
  ]),
  target: z.coerce.number().positive(),
  period_type: z.enum(["weekly", "monthly", "quarterly", "yearly", "custom"]),
  period_start: z.string(),
  period_end: z.string(),
});

export async function createGoal(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const body = {
    workspace_id: session.workspaceId,
    owner_user_id: parsed.data.scope === "user" ? parsed.data.owner_user_id ?? null : null,
    scope: parsed.data.scope,
    metric: parsed.data.metric,
    target: parsed.data.target,
    period_type: parsed.data.period_type,
    period_start: parsed.data.period_start,
    period_end: parsed.data.period_end,
  };
  const { data, error } = await session.supabase
    .from("goals")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/metas");
  return { ok: true, data: data as { id: string } };
}

export async function toggleAutomationActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("automations")
    .update({ is_active: active } as never)
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/automacoes");
  return { ok: true };
}

const automationFromTemplateSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  trigger_type: z.string(),
});

export async function createAutomationFromTemplate(input: unknown): Promise<
  ActionResult<{ id: string }>
> {
  const parsed = automationFromTemplateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const body = {
    workspace_id: session.workspaceId,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    trigger_type: parsed.data.trigger_type,
    trigger_config: {},
    conditions: [],
    is_active: false,
  };
  const { data, error } = await session.supabase
    .from("automations")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/automacoes");
  return { ok: true, data: data as { id: string } };
}
