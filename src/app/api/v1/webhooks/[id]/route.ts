import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

const VALID_EVENTS = [
  "deal.created",
  "deal.updated",
  "deal.won",
  "deal.lost",
  "deal.stage_changed",
  "contact.created",
  "contact.updated",
  "lead.captured",
  "campaign.published",
  "campaign.paused",
  "form.submitted",
  "activity.completed",
] as const;

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  url: z.string().url().optional(),
  secret: z.string().optional().nullable(),
  events: z.array(z.enum(VALID_EVENTS)).min(1).optional(),
  is_active: z.boolean().optional(),
});

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(req, "deals:read");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const sb = getAdmin();

  const { data } = await sb
    .from("webhooks")
    .select("id, name, url, events, is_active, created_at, updated_at")
    .eq("id", id)
    .eq("workspace_id", auth.ctx.workspaceId)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, data });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(req, "deals:write");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const sb = getAdmin();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
  }

  const { data, error } = await sb
    .from("webhooks")
    .update(parsed.data as never)
    .eq("id", id)
    .eq("workspace_id", auth.ctx.workspaceId)
    .select("id, name, url, events, is_active, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(req, "deals:write");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const sb = getAdmin();

  const { error } = await sb
    .from("webhooks")
    .delete()
    .eq("id", id)
    .eq("workspace_id", auth.ctx.workspaceId);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
