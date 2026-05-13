"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const upsertSchema = z.object({
  provider: z.string().min(2).max(60),
  display_name: z.string().optional().nullable(),
  credentials: z.record(z.string(), z.unknown()).default({}),
  settings: z.record(z.string(), z.unknown()).default({}),
});

export async function upsertIntegration(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = upsertSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();

  const { data: existing } = await session.supabase
    .from("integrations")
    .select("id")
    .eq("workspace_id", session.workspaceId)
    .eq("provider", parsed.data.provider)
    .maybeSingle();

  if (existing && (existing as { id?: string }).id) {
    const { error } = await session.supabase
      .from("integrations")
      .update({
        display_name: parsed.data.display_name ?? null,
        credentials: parsed.data.credentials,
        settings: parsed.data.settings,
        status: "active",
      } as never)
      .eq("id", (existing as { id: string }).id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/configuracoes/integracoes");
    revalidatePath(`/configuracoes/${parsed.data.provider}`);
    return { ok: true, data: existing as { id: string } };
  }

  const body = {
    workspace_id: session.workspaceId,
    provider: parsed.data.provider,
    display_name: parsed.data.display_name ?? null,
    credentials: parsed.data.credentials,
    settings: parsed.data.settings,
    status: "active" as const,
  };

  const { data, error } = await session.supabase
    .from("integrations")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/integracoes");
  revalidatePath(`/configuracoes/${parsed.data.provider}`);
  return { ok: true, data: data as { id: string } };
}

export async function deleteIntegration(provider: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("integrations")
    .delete()
    .eq("workspace_id", session.workspaceId)
    .eq("provider", provider);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/integracoes");
  revalidatePath(`/configuracoes/${provider}`);
  return { ok: true };
}
