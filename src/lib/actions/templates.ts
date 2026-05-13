"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

// === Email templates ===

const emailSchema = z.object({
  name: z.string().min(2).max(120),
  subject: z.string().min(2).max(200),
  body_html: z.string().min(2),
  body_text: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
});

export async function createEmailTemplate(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const body = {
    ...parsed.data,
    workspace_id: session.workspaceId,
  };
  const { data, error } = await session.supabase
    .from("email_templates")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/email-templates");
  return { ok: true, data: data as { id: string } };
}

export async function deleteEmailTemplate(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("email_templates")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/email-templates");
  return { ok: true };
}

export async function toggleEmailTemplateActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("email_templates")
    .update({ is_active: active } as never)
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/email-templates");
  return { ok: true };
}

// === WhatsApp templates ===

const whatsappSchema = z.object({
  name: z.string().min(2).max(120),
  body: z.string().min(2),
  language: z.string().min(2).max(10).default("pt_BR"),
  category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]).optional().nullable(),
});

export async function createWhatsappTemplate(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = whatsappSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const body = {
    ...parsed.data,
    workspace_id: session.workspaceId,
    status: "draft" as const,
  };
  const { data, error } = await session.supabase
    .from("whatsapp_templates")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/whatsapp-templates");
  return { ok: true, data: data as { id: string } };
}

export async function deleteWhatsappTemplate(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("whatsapp_templates")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/whatsapp-templates");
  return { ok: true };
}

export async function toggleWhatsappTemplateActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("whatsapp_templates")
    .update({ is_active: active } as never)
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/whatsapp-templates");
  return { ok: true };
}

// === Call scripts ===

const callScriptSchema = z.object({
  name: z.string().min(2).max(120),
  content: z.string().min(2),
});

export async function createCallScript(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = callScriptSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const body = {
    ...parsed.data,
    workspace_id: session.workspaceId,
  };
  const { data, error } = await session.supabase
    .from("call_scripts")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/scripts-ligacao");
  return { ok: true, data: data as { id: string } };
}

export async function deleteCallScript(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("call_scripts")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/scripts-ligacao");
  return { ok: true };
}

export async function toggleCallScriptActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("call_scripts")
    .update({ is_active: active } as never)
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/scripts-ligacao");
  return { ok: true };
}
