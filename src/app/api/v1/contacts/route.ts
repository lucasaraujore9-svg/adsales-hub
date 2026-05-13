import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

const createSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  company_id: z.string().uuid().optional().nullable(),
  lifecycle_stage: z
    .enum(["lead", "mql", "sql", "opportunity", "customer", "lost"])
    .optional(),
  source: z.string().optional().nullable(),
  utm_source: z.string().optional().nullable(),
  utm_medium: z.string().optional().nullable(),
  utm_campaign: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "contacts:read");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 500);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const lifecycle = url.searchParams.get("lifecycle");
  const source = url.searchParams.get("source");
  const companyId = url.searchParams.get("company_id");
  const utmSource = url.searchParams.get("utm_source");
  const utmCampaign = url.searchParams.get("utm_campaign");
  const createdAfter = url.searchParams.get("created_after");
  const createdBefore = url.searchParams.get("created_before");
  const search = url.searchParams.get("q");

  let q = sb
    .from("contacts")
    .select(
      "id, name, email, phone, whatsapp, position, lifecycle_stage, source, company_id, utm_source, utm_medium, utm_campaign, created_at, updated_at",
      { count: "exact" },
    )
    .eq("workspace_id", auth.ctx.workspaceId)
    .order("created_at", { ascending: false });

  if (lifecycle) q = q.eq("lifecycle_stage", lifecycle);
  if (source) q = q.eq("source", source);
  if (companyId) q = q.eq("company_id", companyId);
  if (utmSource) q = q.eq("utm_source", utmSource);
  if (utmCampaign) q = q.eq("utm_campaign", utmCampaign);
  if (createdAfter) {
    const d = new Date(createdAfter);
    if (!Number.isNaN(d.getTime())) q = q.gte("created_at", d.toISOString());
  }
  if (createdBefore) {
    const d = new Date(createdBefore);
    if (!Number.isNaN(d.getTime())) q = q.lte("created_at", d.toISOString());
  }
  if (search) {
    const s = search.replace(/[%,]/g, "");
    q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`);
  }

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
  const auth = await authenticateApiRequest(req, "contacts:write");
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
    return NextResponse.json(
      { ok: false, error: parsed.error.message },
      { status: 400 },
    );
  }

  // Dedup por email
  if (parsed.data.email) {
    const { data: existing } = await sb
      .from("contacts")
      .select("id")
      .eq("workspace_id", auth.ctx.workspaceId)
      .eq("email", parsed.data.email)
      .maybeSingle();
    if (existing && (existing as { id?: string }).id) {
      return NextResponse.json(
        {
          ok: true,
          data: { id: (existing as { id: string }).id, deduped: true },
        },
        { status: 200 },
      );
    }
  }

  const insertBody = {
    ...parsed.data,
    workspace_id: auth.ctx.workspaceId,
    lifecycle_stage: parsed.data.lifecycle_stage ?? "lead",
  };

  const { data, error } = await sb
    .from("contacts")
    .insert(insertBody as never)
    .select("id, name, email, phone, lifecycle_stage, created_at")
    .single();
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Fire webhook
  void (async () => {
    const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
    const created = data as { id: string; name?: string; email?: string };
    await dispatchWebhook(auth.ctx.workspaceId, "contact.created", {
      contact_id: created.id,
      name: created.name,
      email: created.email,
      via: "api",
    });
  })();

  return NextResponse.json({ ok: true, data }, { status: 201 });
}
