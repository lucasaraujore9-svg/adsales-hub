"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  company_id: z.string().uuid().optional().nullable(),
  position: z.string().optional().nullable(),
  lifecycle_stage: z.enum(["lead", "mql", "sql", "opportunity", "customer", "lost"]).default("lead"),
  source: z.string().optional().nullable(),
});

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

export async function createContact(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const insertBody = {
    ...parsed.data,
    workspace_id: session.workspaceId,
    owner_user_id: session.user.id,
  };
  const { data, error } = await session.supabase
    .from("contacts")
    .insert(insertBody as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/contatos");

  const created = data as { id: string };
  void (async () => {
    const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
    await dispatchWebhook(session.workspaceId, "contact.created", {
      contact_id: created.id,
      name: parsed.data.name,
      email: parsed.data.email,
      lifecycle_stage: parsed.data.lifecycle_stage,
      source: parsed.data.source,
    });
  })();

  return { ok: true, data: created };
}

export async function updateContact(id: string, patch: unknown): Promise<ActionResult> {
  const parsed = schema.partial().safeParse(patch);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const { error } = await session.supabase.from("contacts").update(parsed.data as never).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/contatos");
  return { ok: true };
}

export async function deleteContact(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase.from("contacts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/contatos");
  return { ok: true };
}

const bulkSchema = z.object({
  rows: z
    .array(
      z.object({
        name: z.string().min(2),
        email: z.string().email().optional().nullable(),
        phone: z.string().optional().nullable(),
        whatsapp: z.string().optional().nullable(),
        position: z.string().optional().nullable(),
        company_name: z.string().optional().nullable(),
        lifecycle_stage: z
          .enum(["lead", "mql", "sql", "opportunity", "customer", "lost"])
          .default("lead"),
        source: z.string().optional().nullable(),
      }),
    )
    .min(1)
    .max(2000),
});

export async function importContacts(input: unknown): Promise<
  ActionResult<{ inserted: number; companiesCreated: number; skipped: number }>
> {
  const parsed = bulkSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();

  const { data: existingCompanies } = await session.supabase
    .from("companies")
    .select("id, name")
    .eq("workspace_id", session.workspaceId);

  const companyByName = new Map<string, string>();
  for (const c of (existingCompanies ?? []) as { id: string; name: string }[]) {
    companyByName.set(c.name.toLowerCase().trim(), c.id);
  }

  const newCompanyNames = new Set<string>();
  for (const row of parsed.data.rows) {
    const cn = row.company_name?.trim();
    if (cn && !companyByName.has(cn.toLowerCase())) {
      newCompanyNames.add(cn);
    }
  }

  let companiesCreated = 0;
  if (newCompanyNames.size > 0) {
    const insertCompanies = [...newCompanyNames].map((n) => ({
      workspace_id: session.workspaceId,
      name: n,
    }));
    const { data: created, error: cErr } = await session.supabase
      .from("companies")
      .insert(insertCompanies as never)
      .select("id, name");
    if (cErr) return { ok: false, error: `companies: ${cErr.message}` };
    for (const c of (created ?? []) as { id: string; name: string }[]) {
      companyByName.set(c.name.toLowerCase().trim(), c.id);
      companiesCreated++;
    }
  }

  const insertContacts = parsed.data.rows.map((row) => {
    const cn = row.company_name?.trim().toLowerCase();
    const company_id = cn ? companyByName.get(cn) ?? null : null;
    return {
      workspace_id: session.workspaceId,
      owner_user_id: session.user.id,
      name: row.name.trim(),
      email: row.email ?? null,
      phone: row.phone ?? null,
      whatsapp: row.whatsapp ?? null,
      position: row.position ?? null,
      lifecycle_stage: row.lifecycle_stage,
      source: row.source ?? null,
      company_id,
    };
  });

  const BATCH = 200;
  let inserted = 0;
  let skipped = 0;
  for (let i = 0; i < insertContacts.length; i += BATCH) {
    const slice = insertContacts.slice(i, i + BATCH);
    const { error, count } = await session.supabase
      .from("contacts")
      .insert(slice as never, { count: "exact" });
    if (error) {
      skipped += slice.length;
      continue;
    }
    inserted += count ?? slice.length;
  }

  revalidatePath("/contatos");
  return { ok: true, data: { inserted, companiesCreated, skipped } };
}
