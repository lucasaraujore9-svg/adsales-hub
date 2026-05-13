"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireWorkspaceAdmin } from "@/lib/auth/guards";

const schema = z.object({
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent_color_light: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  logo_url: z.string().url().optional().nullable(),
  logo_icon_url: z.string().url().optional().nullable(),
});

export async function updateBranding(formData: FormData) {
  const input = {
    accent_color: String(formData.get("accent_color") ?? "#FF5E1A"),
    accent_color_light: (formData.get("accent_color_light") as string) || null,
    logo_url: (formData.get("logo_url") as string) || null,
    logo_icon_url: (formData.get("logo_icon_url") as string) || null,
  };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await requireWorkspaceAdmin();
  const body = {
    workspace_id: session.workspaceId,
    ...parsed.data,
  };
  const { error } = await session.supabase
    .from("workspace_branding")
    .upsert(body as never, { onConflict: "workspace_id" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
