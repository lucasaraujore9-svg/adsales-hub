"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireWorkspaceAdmin } from "@/lib/auth/guards";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  domain: z.string().optional().or(z.literal("")),
  timezone: z.string().min(2),
  locale: z.string().min(2),
  currency: z.string().length(3),
});

export async function updateWorkspace(formData: FormData) {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    domain: formData.get("domain"),
    timezone: formData.get("timezone"),
    locale: formData.get("locale"),
    currency: formData.get("currency"),
  });
  if (!parsed.success) return;
  const session = await requireWorkspaceAdmin();
  await session.supabase
    .from("workspaces")
    .update({
      ...parsed.data,
      domain: parsed.data.domain || null,
    } as never)
    .eq("id", session.workspaceId);
  revalidatePath("/", "layout");
}

const domainSchema = z.object({
  subdomain: z
    .string()
    .max(40)
    .regex(/^[a-z0-9-]*$/, { message: "subdomain deve ser kebab-case" })
    .optional()
    .or(z.literal("")),
  domain: z.string().max(120).optional().or(z.literal("")),
});

export async function updateWorkspaceDomain(
  patch: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = domainSchema.safeParse(patch);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await requireWorkspaceAdmin();
  const { error } = await session.supabase
    .from("workspaces")
    .update({
      subdomain: parsed.data.subdomain || null,
      domain: parsed.data.domain || null,
    } as never)
    .eq("id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

const settingsPatchSchema = z.record(z.string(), z.unknown());

export async function updateWorkspaceSettings(
  patch: unknown,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = settingsPatchSchema.safeParse(patch);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await requireWorkspaceAdmin();
  const { data: current } = await session.supabase
    .from("workspaces")
    .select("settings")
    .eq("id", session.workspaceId)
    .maybeSingle();
  const merged = {
    ...((current as { settings?: Record<string, unknown> } | null)?.settings ?? {}),
    ...parsed.data,
  };
  const { error } = await session.supabase
    .from("workspaces")
    .update({ settings: merged } as never)
    .eq("id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
