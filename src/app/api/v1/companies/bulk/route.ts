import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

const companySchema = z.object({
  name: z.string().min(2).max(150),
  website: z.string().url().optional().nullable(),
  industry: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
});

const bulkSchema = z.object({
  companies: z.array(companySchema).min(1).max(1000),
});

const BATCH_SIZE = 200;
const DEDUP_QUERY_BATCH = 200;

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

  const wid = auth.ctx.workspaceId;
  const names = parsed.data.companies.map((c) => c.name);

  // Build lowercase dedup map by querying existing companies in batches
  const existingByLowerName = new Map<string, string>();
  for (let i = 0; i < names.length; i += DEDUP_QUERY_BATCH) {
    const batch = names.slice(i, i + DEDUP_QUERY_BATCH);
    const { data } = await sb
      .from("companies")
      .select("id, name")
      .eq("workspace_id", wid)
      .in("name", batch);
    for (const r of (data ?? []) as { id: string; name: string }[]) {
      existingByLowerName.set(r.name.toLowerCase(), r.id);
    }
  }

  const toInsert: Array<Record<string, unknown>> = [];
  const dedupedIds: string[] = [];
  let deduped = 0;

  for (const c of parsed.data.companies) {
    const existing = existingByLowerName.get(c.name.toLowerCase());
    if (existing) {
      dedupedIds.push(existing);
      deduped++;
      continue;
    }
    toInsert.push({
      workspace_id: wid,
      name: c.name,
      website: c.website ?? null,
      industry: c.industry ?? null,
      size: c.size ?? null,
      cnpj: c.cnpj ?? null,
    });
    existingByLowerName.set(c.name.toLowerCase(), "pending");
  }

  let inserted = 0;
  let failed = 0;
  const insertedIds: string[] = [];

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const { data, error } = await sb.from("companies").insert(batch as never).select("id");
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
      ids: insertedIds.slice(0, 1000),
      deduped_ids: dedupedIds.slice(0, 1000),
    },
  });
}
