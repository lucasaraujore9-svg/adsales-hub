"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

// === Products ===

const productSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  price: z.coerce.number().nonnegative(),
  currency: z.string().min(3).max(5).default("BRL"),
  billing_cycle: z.enum(["one_time", "monthly", "yearly", "custom"]).default("one_time"),
});

export async function createProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const body = {
    ...parsed.data,
    workspace_id: session.workspaceId,
  };
  const { data, error } = await session.supabase
    .from("products")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/produtos");
  return { ok: true, data: data as { id: string } };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/produtos");
  return { ok: true };
}

export async function toggleProductActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("products")
    .update({ is_active: active } as never)
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/produtos");
  return { ok: true };
}

// === Loss reasons ===

const lossReasonSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().optional().nullable(),
});

export async function createLossReason(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = lossReasonSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const body = {
    ...parsed.data,
    workspace_id: session.workspaceId,
  };
  const { data, error } = await session.supabase
    .from("loss_reasons")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/motivos-perda");
  return { ok: true, data: data as { id: string } };
}

export async function deleteLossReason(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("loss_reasons")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/motivos-perda");
  return { ok: true };
}

export async function toggleLossReasonActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("loss_reasons")
    .update({ is_active: active } as never)
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/motivos-perda");
  return { ok: true };
}
