"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { friendlyError } from "@/lib/errors/friendly";

const schema = z.object({
  workspace_name: z.string().min(2, "Informe o nome da empresa"),
});

export interface OnboardingResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function createWorkspaceForCurrentUser(
  _prev: OnboardingResult | null,
  formData: FormData,
): Promise<OnboardingResult> {
  const parsed = schema.safeParse({
    workspace_name: formData.get("workspace_name"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const key = String(i.path[0] ?? "_");
      if (!fieldErrors[key]) fieldErrors[key] = i.message;
    }
    return { ok: false, fieldErrors };
  }

  const supabase = await createServerSupabaseClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { ok: false, error: "Sessão expirou. Faça login novamente." };
  }

  const admin = createAdminSupabaseClient();
  const name =
    (authData.user.user_metadata?.name as string | undefined) ??
    (authData.user.user_metadata?.full_name as string | undefined) ??
    authData.user.email?.split("@")[0] ??
    "Novo usuário";

  const slugBase = parsed.data.workspace_name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const slug = `${slugBase || "workspace"}-${authData.user.id.replace(/-/g, "").slice(0, 8)}`;

  const { data: workspace, error: wErr } = await admin
    .from("workspaces")
    .insert({ name: parsed.data.workspace_name, slug })
    .select("id")
    .single();
  if (wErr || !workspace) {
    return { ok: false, error: friendlyError(wErr ?? new Error("Falha ao criar workspace"), "crud") };
  }

  const { error: uErr } = await admin.from("users").insert({
    id: authData.user.id,
    workspace_id: workspace.id,
    email: authData.user.email!,
    name,
    role: "admin",
    joined_at: new Date().toISOString(),
  });
  if (uErr) {
    return { ok: false, error: friendlyError(uErr, "crud") };
  }

  await admin
    .from("workspaces")
    .update({ owner_user_id: authData.user.id })
    .eq("id", workspace.id);

  await admin
    .from("workspace_branding")
    .upsert(
      { workspace_id: workspace.id, accent_color: "#FF5E1A" },
      { onConflict: "workspace_id" },
    );

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
