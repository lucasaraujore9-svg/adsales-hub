"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { friendlyError } from "@/lib/errors/friendly";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const mergeSchema = z.object({
  primaryId: z.string().uuid(),
  secondaryIds: z.array(z.string().uuid()).min(1).max(10),
  fieldChoices: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Mescla contatos duplicados em um único registro "primary".
 *
 * Estratégia:
 * 1. Atualiza `primary` com os campos escolhidos via `fieldChoices` (opcional).
 * 2. Re-aponta deals, atividades, notas, ligações e conversas para o primary.
 * 3. Marca secundários com `merged_into_contact_id` (soft delete).
 * 4. Registra evento auditável em `contact_merge_log`.
 *
 * Apenas admin e gestor.
 */
export async function mergeContacts(input: unknown): Promise<ActionResult> {
  const parsed = mergeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  if (!["admin", "gestor"].includes(session.role)) {
    return { ok: false, error: "Apenas admins e gestores podem mesclar contatos." };
  }
  const { primaryId, secondaryIds, fieldChoices } = parsed.data;
  if (secondaryIds.includes(primaryId)) {
    return { ok: false, error: "Contato principal não pode estar entre os secundários." };
  }

  const sb = session.supabase;
  const ws = session.workspaceId;

  // 1. Atualiza primary com fieldChoices, se houver
  if (fieldChoices && Object.keys(fieldChoices).length > 0) {
    const allowed = new Set([
      "name",
      "email",
      "phone",
      "whatsapp",
      "position",
      "company_id",
      "lifecycle_stage",
      "source",
    ]);
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fieldChoices)) {
      if (allowed.has(k)) patch[k] = v;
    }
    if (Object.keys(patch).length > 0) {
      const { error } = await sb
        .from("contacts")
        .update(patch as never)
        .eq("id", primaryId)
        .eq("workspace_id", ws);
      if (error) return { ok: false, error: friendlyError(error, "crud") };
    }
  }

  // 2. Reaponta referências
  const transferred: Record<string, number> = {};

  const tables = ["deals", "activities", "notes", "calls", "conversations"] as const;
  for (const t of tables) {
    try {
      const { data, error } = await sb
        .from(t)
        .update({ contact_id: primaryId } as never)
        .in("contact_id", secondaryIds)
        .eq("workspace_id", ws)
        .select("id");
      if (!error) {
        transferred[t] = (data as { id: string }[] | null)?.length ?? 0;
      }
    } catch (e) {
      console.warn(`[mergeContacts] tabela ${t} ignorada:`, e);
    }
  }

  // 3. Soft-delete dos secundários
  const { error: softErr } = await sb
    .from("contacts")
    .update({
      merged_into_contact_id: primaryId,
      merged_at: new Date().toISOString(),
      merged_by_user_id: session.user.id,
    } as never)
    .in("id", secondaryIds)
    .eq("workspace_id", ws);
  if (softErr) return { ok: false, error: friendlyError(softErr, "crud") };

  // 4. Log auditável
  await sb.from("contact_merge_log").insert({
    workspace_id: ws,
    primary_contact_id: primaryId,
    merged_contact_ids: secondaryIds,
    field_choices: fieldChoices ?? {},
    transferred_counts: transferred,
    actor_user_id: session.user.id,
  } as never);

  revalidatePath("/contatos");
  revalidatePath("/configuracoes/duplicatas");
  return { ok: true };
}
