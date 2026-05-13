"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult = { ok: boolean; error?: string };

const idSchema = z.string().uuid();

export async function disconnectMetaAdAccount(adAccountId: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(adAccountId);
  if (!parsed.success) return { ok: false, error: "ID invalido" };

  const session = await getSession();

  // Soft disconnect: clear token + mark disconnected. Keeps the row + history.
  const { error } = await session.supabase
    .from("ad_accounts")
    .update({
      access_token_encrypted: null,
      token_expires_at: null,
      status: "disconnected",
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", parsed.data)
    .eq("workspace_id", session.workspaceId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/configuracoes/meta-ads");
  revalidatePath("/campanhas");
  return { ok: true };
}

export async function deleteMetaAdAccount(adAccountId: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(adAccountId);
  if (!parsed.success) return { ok: false, error: "ID invalido" };

  const session = await getSession();
  const { error } = await session.supabase
    .from("ad_accounts")
    .delete()
    .eq("id", parsed.data)
    .eq("workspace_id", session.workspaceId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/configuracoes/meta-ads");
  revalidatePath("/campanhas");
  return { ok: true };
}
