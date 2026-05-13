import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

const contactSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  company_name: z.string().optional().nullable(),
  lifecycle_stage: z
    .enum(["lead", "mql", "sql", "opportunity", "customer", "lost"])
    .default("lead"),
  source: z.string().optional().nullable(),
  utm_source: z.string().optional().nullable(),
  utm_medium: z.string().optional().nullable(),
  utm_campaign: z.string().optional().nullable(),
});

const bulkSchema = z.object({
  contacts: z.array(contactSchema).min(1).max(2000),
});

const BATCH_SIZE = 200;

export async function POST(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "contacts:write");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
  }

  // Resolve company_name -> company_id (cria empresas faltantes)
  const newCompanyNames = new Set<string>();
  for (const c of parsed.data.contacts) {
    const cn = c.company_name?.trim();
    if (cn) newCompanyNames.add(cn);
  }

  const companyByName = new Map<string, string>();
  if (newCompanyNames.size > 0) {
    const { data: existing } = await sb
      .from("companies")
      .select("id, name")
      .eq("workspace_id", auth.ctx.workspaceId)
      .in("name", [...newCompanyNames]);
    for (const c of (existing ?? []) as { id: string; name: string }[]) {
      companyByName.set(c.name.toLowerCase().trim(), c.id);
    }

    const missing = [...newCompanyNames].filter(
      (n) => !companyByName.has(n.toLowerCase().trim()),
    );
    if (missing.length > 0) {
      const insertCompanies = missing.map((n) => ({
        workspace_id: auth.ctx.workspaceId,
        name: n,
      }));
      const { data: created } = await sb
        .from("companies")
        .insert(insertCompanies as never)
        .select("id, name");
      for (const c of (created ?? []) as { id: string; name: string }[]) {
        companyByName.set(c.name.toLowerCase().trim(), c.id);
      }
    }
  }

  // Dedup por email — busca todos existentes em batch
  const emails = parsed.data.contacts
    .map((c) => c.email)
    .filter((e): e is string => !!e);
  const existingByEmail = new Map<string, string>();
  if (emails.length > 0) {
    for (let i = 0; i < emails.length; i += 200) {
      const slice = emails.slice(i, i + 200);
      const { data } = await sb
        .from("contacts")
        .select("id, email")
        .eq("workspace_id", auth.ctx.workspaceId)
        .in("email", slice);
      for (const r of (data ?? []) as { id: string; email: string }[]) {
        existingByEmail.set(r.email.toLowerCase(), r.id);
      }
    }
  }

  let inserted = 0;
  let deduped = 0;
  let failed = 0;
  const insertedIds: string[] = [];

  const toInsert: Array<Record<string, unknown>> = [];
  for (const c of parsed.data.contacts) {
    const emailKey = c.email?.toLowerCase() ?? null;
    if (emailKey && existingByEmail.has(emailKey)) {
      deduped++;
      continue;
    }
    const cn = c.company_name?.trim().toLowerCase();
    const company_id = cn ? (companyByName.get(cn) ?? null) : null;
    toInsert.push({
      workspace_id: auth.ctx.workspaceId,
      name: c.name.trim(),
      email: c.email ?? null,
      phone: c.phone ?? null,
      whatsapp: c.whatsapp ?? null,
      position: c.position ?? null,
      company_id,
      lifecycle_stage: c.lifecycle_stage,
      source: c.source ?? "api",
      utm_source: c.utm_source ?? null,
      utm_medium: c.utm_medium ?? null,
      utm_campaign: c.utm_campaign ?? null,
    });
  }

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const { data, error } = await sb
      .from("contacts")
      .insert(batch as never)
      .select("id");
    if (error) {
      failed += batch.length;
      continue;
    }
    const created = (data ?? []) as { id: string }[];
    inserted += created.length;
    for (const r of created) insertedIds.push(r.id);
  }

  return NextResponse.json({
    ok: true,
    data: {
      inserted,
      deduped,
      failed,
      companies_created: newCompanyNames.size > 0 ? companyByName.size : 0,
      ids: insertedIds.slice(0, 1000), // cap response
    },
  });
}
