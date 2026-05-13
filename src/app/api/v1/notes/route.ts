import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

const createSchema = z
  .object({
    content: z.string().min(1).max(10000),
    deal_id: z.string().uuid().optional().nullable(),
    contact_id: z.string().uuid().optional().nullable(),
    company_id: z.string().uuid().optional().nullable(),
  })
  .refine((d) => d.deal_id || d.contact_id || d.company_id, {
    message: "Provide at least one of deal_id, contact_id or company_id",
  });

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "deals:read");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const dealId = url.searchParams.get("deal_id");
  const contactId = url.searchParams.get("contact_id");
  const companyId = url.searchParams.get("company_id");

  let q = sb
    .from("notes")
    .select("id, content, deal_id, contact_id, company_id, user_id, created_at, updated_at", {
      count: "exact",
    })
    .eq("workspace_id", auth.ctx.workspaceId)
    .order("created_at", { ascending: false });

  if (dealId) q = q.eq("deal_id", dealId);
  if (contactId) q = q.eq("contact_id", contactId);
  if (companyId) q = q.eq("company_id", companyId);

  const { data, count, error } = await q.range(offset, offset + limit - 1);
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
  const auth = await authenticateApiRequest(req, "deals:write");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
  }

  const { data, error } = await sb
    .from("notes")
    .insert({
      ...parsed.data,
      workspace_id: auth.ctx.workspaceId,
    } as never)
    .select("id, content, deal_id, contact_id, company_id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data }, { status: 201 });
}
