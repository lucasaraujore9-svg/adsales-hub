import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

const createSchema = z.object({
  name: z.string().min(2).max(150),
  website: z.string().url().optional().nullable(),
  industry: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "contacts:read");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 500);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const q = url.searchParams.get("q");

  let query = sb
    .from("companies")
    .select("id, name, website, industry, created_at, updated_at", { count: "exact" })
    .eq("workspace_id", auth.ctx.workspaceId)
    .order("name");

  if (q) {
    const s = q.replace(/[%,]/g, "");
    query = query.ilike("name", `%${s}%`);
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    data: data ?? [],
    meta: { total: count ?? 0, limit, offset },
  });
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "contacts:write");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
  }

  // Dedup por nome
  const { data: existing } = await sb
    .from("companies")
    .select("id")
    .eq("workspace_id", auth.ctx.workspaceId)
    .ilike("name", parsed.data.name)
    .maybeSingle();
  if (existing && (existing as { id?: string }).id) {
    return NextResponse.json(
      { ok: true, data: { id: (existing as { id: string }).id, deduped: true } },
      { status: 200 },
    );
  }

  const { data, error } = await sb
    .from("companies")
    .insert({ ...parsed.data, workspace_id: auth.ctx.workspaceId } as never)
    .select("id, name, website, industry, created_at")
    .single();
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data }, { status: 201 });
}
