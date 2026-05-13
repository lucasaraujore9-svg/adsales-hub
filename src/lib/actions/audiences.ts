"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const createSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(["saved", "custom", "lookalike", "retargeting"]),
  config: z.record(z.string(), z.unknown()).optional(),
});

export async function createAudience(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const body = {
    workspace_id: session.workspaceId,
    name: parsed.data.name.trim(),
    type: parsed.data.type,
    config: parsed.data.config ?? {},
  };
  const { data, error } = await session.supabase
    .from("audiences")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/campanhas/publicos");
  return { ok: true, data: data as { id: string } };
}

export async function syncCrmAudience(): Promise<
  ActionResult<{ created: boolean; size: number }>
> {
  const session = await getSession();
  const sb = session.supabase;
  const { count } = await sb
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", session.workspaceId)
    .eq("lifecycle_stage", "customer");

  const size = count ?? 0;

  const { data: existing } = await sb
    .from("audiences")
    .select("id")
    .eq("workspace_id", session.workspaceId)
    .eq("name", "CRM Customers")
    .maybeSingle();

  if (existing && (existing as { id?: string }).id) {
    const { error: uerr } = await sb
      .from("audiences")
      .update({
        size_estimate: size,
        last_synced_at: new Date().toISOString(),
      } as never)
      .eq("id", (existing as { id: string }).id);
    if (uerr) return { ok: false, error: uerr.message };
    revalidatePath("/campanhas/publicos");
    return { ok: true, data: { created: false, size } };
  }

  const { error } = await sb.from("audiences").insert(
    {
      workspace_id: session.workspaceId,
      name: "CRM Customers",
      type: "custom",
      size_estimate: size,
      last_synced_at: new Date().toISOString(),
      config: { source: "crm", lifecycle: "customer" },
    } as never,
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/campanhas/publicos");
  return { ok: true, data: { created: true, size } };
}
