"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

function uniqueSlug(base: string, taken: Set<string>): string {
  let candidate = `${base}-copia`;
  if (!taken.has(candidate)) return candidate;
  let i = 2;
  while (taken.has(`${candidate}-${i}`)) i++;
  return `${candidate}-${i}`;
}

export async function duplicateLandingPage(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  const sb = session.supabase;
  const { data: source } = await sb
    .from("landing_pages")
    .select(
      "id, name, slug, template_id, content, domain, meta_pixel_id, utm_config, seo",
    )
    .eq("id", id)
    .eq("workspace_id", session.workspaceId)
    .maybeSingle();
  if (!source) return { ok: false, error: "LP não encontrada" };

  const { data: existing } = await sb
    .from("landing_pages")
    .select("slug")
    .eq("workspace_id", session.workspaceId);
  const taken = new Set(
    ((existing ?? []) as { slug: string }[]).map((r) => r.slug),
  );

  const src = source as {
    name: string;
    slug: string;
    template_id: string | null;
    content: unknown;
    domain: string | null;
    meta_pixel_id: string | null;
    utm_config: unknown;
    seo: unknown;
  };

  const newSlug = uniqueSlug(src.slug, taken);
  const insertBody = {
    workspace_id: session.workspaceId,
    name: `${src.name} (copia)`,
    slug: newSlug,
    template_id: src.template_id,
    content: src.content,
    domain: src.domain,
    published: false,
    meta_pixel_id: src.meta_pixel_id,
    utm_config: src.utm_config,
    seo: src.seo,
  };
  const { data: created, error } = await sb
    .from("landing_pages")
    .insert(insertBody as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/landing-pages");
  return { ok: true, data: created as { id: string } };
}

export async function duplicateForm(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await getSession();
  const sb = session.supabase;
  const { data: source } = await sb
    .from("forms")
    .select("id, name, slug, fields, settings, thank_you_message, redirect_url")
    .eq("id", id)
    .eq("workspace_id", session.workspaceId)
    .maybeSingle();
  if (!source) return { ok: false, error: "Formulario não encontrado" };

  const { data: existing } = await sb
    .from("forms")
    .select("slug")
    .eq("workspace_id", session.workspaceId);
  const taken = new Set(
    ((existing ?? []) as { slug: string }[]).map((r) => r.slug),
  );

  const src = source as {
    name: string;
    slug: string;
    fields: unknown;
    settings: unknown;
    thank_you_message: string | null;
    redirect_url: string | null;
  };

  const insertBody = {
    workspace_id: session.workspaceId,
    name: `${src.name} (copia)`,
    slug: uniqueSlug(src.slug, taken),
    fields: src.fields,
    settings: src.settings,
    thank_you_message: src.thank_you_message,
    redirect_url: src.redirect_url,
    is_active: false,
  };
  const { data: created, error } = await sb
    .from("forms")
    .insert(insertBody as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/formularios");
  return { ok: true, data: created as { id: string } };
}

const toggleSchema = z.object({ id: z.string().uuid(), active: z.boolean() });

export async function toggleFormActive(input: unknown): Promise<ActionResult> {
  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const { error } = await session.supabase
    .from("forms")
    .update({ is_active: parsed.data.active } as never)
    .eq("id", parsed.data.id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/formularios");
  return { ok: true };
}

const newFormSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z][a-z0-9-]*$/, { message: "slug em kebab-case" }),
});

export async function createForm(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = newFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();

  const body = {
    workspace_id: session.workspaceId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
    ],
    settings: {},
    is_active: false,
  };
  const { data, error } = await session.supabase
    .from("forms")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/formularios");
  return { ok: true, data: data as { id: string } };
}

const fieldSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-z][a-z0-9_]*$/, { message: "nome do campo em snake_case" }),
  label: z.string().min(1).max(100),
  type: z.enum(["text", "email", "phone", "textarea", "select", "number", "date", "url"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
});

const fieldsSchema = z.object({
  id: z.string().uuid(),
  fields: z.array(fieldSchema),
});

export async function updateFormFields(input: unknown): Promise<ActionResult> {
  const parsed = fieldsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const { error } = await session.supabase
    .from("forms")
    .update({ fields: parsed.data.fields } as never)
    .eq("id", parsed.data.id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/formularios");
  revalidatePath(`/marketing/formularios/${parsed.data.id}`);
  return { ok: true };
}

const settingsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(120),
  thank_you_message: z.string().optional().nullable(),
  redirect_url: z.string().url().optional().or(z.literal("")).nullable(),
});

export async function updateFormSettings(input: unknown): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const { error } = await session.supabase
    .from("forms")
    .update({
      name: parsed.data.name,
      thank_you_message: parsed.data.thank_you_message ?? null,
      redirect_url: parsed.data.redirect_url || null,
    } as never)
    .eq("id", parsed.data.id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/formularios");
  revalidatePath(`/marketing/formularios/${parsed.data.id}`);
  return { ok: true };
}

export async function deleteForm(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("forms")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/formularios");
  return { ok: true };
}

// === Landing pages ===

const newLpSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z][a-z0-9-]*$/, { message: "slug em kebab-case" }),
});

export async function createLandingPage(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = newLpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();

  const body = {
    workspace_id: session.workspaceId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    content: {
      blocks: [
        {
          type: "hero",
          title: "Resolva [seu problema] em [tempo]",
          subtitle: "Sub-headline com beneficio claro",
          cta_label: "Comece agora",
          cta_url: "#cta",
        },
      ],
    },
    published: false,
  };

  const { data, error } = await session.supabase
    .from("landing_pages")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/landing-pages");
  return { ok: true, data: data as { id: string } };
}

const lpBlockSchema = z.object({
  type: z.enum([
    "hero",
    "problem",
    "benefits",
    "features",
    "testimonials",
    "form",
    "pricing",
    "faq",
    "cta",
    "footer",
    "custom_html",
  ]),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  cta_label: z.string().optional().nullable(),
  cta_url: z.string().optional().nullable(),
  form_id: z.string().uuid().optional().nullable(),
  config: z.record(z.string(), z.unknown()).optional(),
});

const lpBlocksUpdateSchema = z.object({
  id: z.string().uuid(),
  blocks: z.array(lpBlockSchema),
});

export async function updateLandingPageBlocks(input: unknown): Promise<ActionResult> {
  const parsed = lpBlocksUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const { error } = await session.supabase
    .from("landing_pages")
    .update({ content: { blocks: parsed.data.blocks } } as never)
    .eq("id", parsed.data.id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/landing-pages");
  revalidatePath(`/marketing/landing-pages/${parsed.data.id}`);
  return { ok: true };
}

const lpSettingsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(120),
  meta_pixel_id: z.string().optional().nullable(),
});

export async function updateLandingPageSettings(input: unknown): Promise<ActionResult> {
  const parsed = lpSettingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const { error } = await session.supabase
    .from("landing_pages")
    .update({
      name: parsed.data.name,
      meta_pixel_id: parsed.data.meta_pixel_id ?? null,
    } as never)
    .eq("id", parsed.data.id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/landing-pages");
  revalidatePath(`/marketing/landing-pages/${parsed.data.id}`);
  return { ok: true };
}

export async function publishLandingPage(id: string, published: boolean): Promise<ActionResult> {
  const session = await getSession();
  const update: Record<string, unknown> = { published };
  if (published) update.published_at = new Date().toISOString();
  const { error } = await session.supabase
    .from("landing_pages")
    .update(update as never)
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/landing-pages");
  revalidatePath(`/marketing/landing-pages/${id}`);
  return { ok: true };
}

export async function deleteLandingPage(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("landing_pages")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/marketing/landing-pages");
  return { ok: true };
}
