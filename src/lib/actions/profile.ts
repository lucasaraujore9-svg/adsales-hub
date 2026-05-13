"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

const profileSchema = z.object({
  name: z.string().min(2),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export async function updateProfile(formData: FormData) {
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    avatar_url: (formData.get("avatar_url") as string) || undefined,
  });
  if (!parsed.success) return;
  const session = await getSession();
  await session.supabase
    .from("users")
    .update({
      name: parsed.data.name,
      avatar_url: parsed.data.avatar_url || null,
    } as never)
    .eq("id", session.user.id);
  revalidatePath("/configuracoes/perfil");
  revalidatePath("/", "layout");
}

export async function changePassword(formData: FormData) {
  const newPassword = String(formData.get("new_password") ?? "");
  if (newPassword.length < 8) return;
  const session = await getSession();
  await session.supabase.auth.updateUser({ password: newPassword });
  revalidatePath("/configuracoes/perfil");
}

export async function signOut() {
  const session = await getSession();
  await session.supabase.auth.signOut();
  redirect("/login");
}
