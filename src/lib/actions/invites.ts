"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireWorkspaceAdmin } from "@/lib/auth/guards";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env";
import { friendlyError } from "@/lib/errors/friendly";

export type ActionResult = { ok: boolean; error?: string };

const resendSchema = z.object({
  userId: z.string().uuid(),
});

/**
 * Reenvia o convite (gera novo magic link) para um user pendente.
 * O user deve pertencer ao workspace do admin.
 */
export async function resendInvite(input: unknown): Promise<ActionResult> {
  const parsed = resendSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Convite inválido." };

  const session = await requireWorkspaceAdmin();
  const admin = createAdminSupabaseClient();

  const { data: userRes, error: getErr } = await admin.auth.admin.getUserById(
    parsed.data.userId,
  );
  if (getErr || !userRes?.user) {
    return { ok: false, error: friendlyError(getErr ?? new Error("user_not_found"), "crud") };
  }
  const user = userRes.user;
  if (user.user_metadata?.workspace_id !== session.workspaceId) {
    return { ok: false, error: "Você não tem permissão para este convite." };
  }
  if (!user.email) {
    return { ok: false, error: "Convite sem email associado." };
  }

  const { error } = await admin.auth.admin.inviteUserByEmail(user.email, {
    redirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/accept-invite`,
    data: {
      workspace_id: session.workspaceId,
      role: user.user_metadata?.role ?? "vendedor",
      name: user.user_metadata?.name,
      invited_by: session.user.id,
    },
  });
  if (error) {
    return { ok: false, error: friendlyError(error, "auth") };
  }

  revalidatePath("/configuracoes/usuarios");
  return { ok: true };
}

/**
 * Revoga um convite pendente (apaga o user do Supabase Auth).
 * Apenas para users que ainda não confirmaram email.
 */
export async function revokeInvite(input: unknown): Promise<ActionResult> {
  const parsed = resendSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Convite inválido." };

  const session = await requireWorkspaceAdmin();
  const admin = createAdminSupabaseClient();

  const { data: userRes } = await admin.auth.admin.getUserById(parsed.data.userId);
  const user = userRes?.user;
  if (!user) return { ok: false, error: "Convite não encontrado." };
  if (user.user_metadata?.workspace_id !== session.workspaceId) {
    return { ok: false, error: "Sem permissão." };
  }
  if (user.email_confirmed_at) {
    return {
      ok: false,
      error: "Este usuário já aceitou o convite. Use 'Remover membro' em vez disso.",
    };
  }

  const { error } = await admin.auth.admin.deleteUser(parsed.data.userId);
  if (error) return { ok: false, error: friendlyError(error, "crud") };

  revalidatePath("/configuracoes/usuarios");
  return { ok: true };
}
