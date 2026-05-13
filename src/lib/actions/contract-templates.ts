"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const proposalSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().optional().nullable(),
  default_validity_days: z.coerce.number().int().min(1).max(180).default(7),
});

export async function createProposalTemplate(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = proposalSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const body = {
    workspace_id: session.workspaceId,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    default_validity_days: parsed.data.default_validity_days,
    blocks: [],
  };
  const { data, error } = await session.supabase
    .from("proposal_templates")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/contratos");
  return { ok: true, data: data as { id: string } };
}

const blockSchema = z.object({
  type: z.enum([
    "cover",
    "problem",
    "solution",
    "products",
    "pricing",
    "terms",
    "testimonials",
    "cta",
    "custom",
  ]),
  title: z.string().min(1).max(200),
  content: z.string().optional().nullable(),
  config: z.record(z.string(), z.unknown()).optional(),
});

const blocksUpdateSchema = z.object({
  id: z.string().uuid(),
  blocks: z.array(blockSchema),
  default_validity_days: z.coerce.number().int().min(1).max(180).optional(),
});

export async function updateProposalTemplateBlocks(input: unknown): Promise<ActionResult> {
  const parsed = blocksUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const update: Record<string, unknown> = { blocks: parsed.data.blocks };
  if (parsed.data.default_validity_days !== undefined) {
    update.default_validity_days = parsed.data.default_validity_days;
  }
  const { error } = await session.supabase
    .from("proposal_templates")
    .update(update as never)
    .eq("id", parsed.data.id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/contratos");
  revalidatePath(`/configuracoes/contratos/${parsed.data.id}`);
  return { ok: true };
}

export async function deleteProposalTemplate(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("proposal_templates")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/contratos");
  return { ok: true };
}

const contractSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().optional().nullable(),
  content: z.string().min(2),
});

export async function createContractTemplate(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = contractSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const body = {
    workspace_id: session.workspaceId,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    content: parsed.data.content,
    variables: [],
  };
  const { data, error } = await session.supabase
    .from("contract_templates")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/contratos");
  return { ok: true, data: data as { id: string } };
}

export async function deleteContractTemplate(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("contract_templates")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/contratos");
  return { ok: true };
}
