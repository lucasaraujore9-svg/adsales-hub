import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

const updateSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  company_id: z.string().uuid().optional().nullable(),
  lifecycle_stage: z
    .enum(["lead", "mql", "sql", "opportunity", "customer", "lost"])
    .optional(),
  source: z.string().optional().nullable(),
});

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(req, "contacts:read");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const sb = getAdmin();

  const { data } = await sb
    .from("contacts")
    .select(
      "id, name, email, phone, whatsapp, position, lifecycle_stage, source, company_id, utm_source, utm_medium, utm_campaign, last_contacted_at, created_at, updated_at",
    )
    .eq("id", id)
    .eq("workspace_id", auth.ctx.workspaceId)
    .maybeSingle();
  if (!data) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, data });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(req, "contacts:write");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const sb = getAdmin();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
  }

  const { data, error } = await sb
    .from("contacts")
    .update(parsed.data as never)
    .eq("id", id)
    .eq("workspace_id", auth.ctx.workspaceId)
    .select("id, name, email, lifecycle_stage, updated_at")
    .single();
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  void (async () => {
    const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
    await dispatchWebhook(auth.ctx.workspaceId, "contact.updated", {
      contact_id: id,
      changes: Object.keys(parsed.data),
      via: "api",
    });
  })();

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(req, "contacts:write");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const sb = getAdmin();

  const { error } = await sb
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("workspace_id", auth.ctx.workspaceId);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
