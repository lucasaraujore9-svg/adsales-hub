"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

const createSchema = z.object({
  content: z.string().min(1).max(5000),
  deal_id: z.string().uuid().optional().nullable(),
  contact_id: z.string().uuid().optional().nullable(),
  company_id: z.string().uuid().optional().nullable(),
});

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

export async function createNote(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const insertBody = {
    ...parsed.data,
    workspace_id: session.workspaceId,
    user_id: session.user.id,
  };
  const { data, error } = await session.supabase
    .from("notes")
    .insert(insertBody as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  if (parsed.data.deal_id) revalidatePath(`/negocios/${parsed.data.deal_id}`);
  if (parsed.data.contact_id) revalidatePath(`/contatos/${parsed.data.contact_id}`);
  return { ok: true, data: data as { id: string } };
}

export async function deleteNote(noteId: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
