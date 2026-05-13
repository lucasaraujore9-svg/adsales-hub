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

const createSchema = z.object({
  name: z.string().min(2).max(120),
  url: z.string().url(),
  secret: z.string().optional().nullable(),
  events: z.array(z.enum(VALID_EVENTS)).min(1),
  is_active: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "deals:read");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();

  const { data, error } = await sb
    .from("webhooks")
    .select("id, name, url, events, is_active, created_at, updated_at")
    .eq("workspace_id", auth.ctx.workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data: data ?? [] });
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
    .from("webhooks")
    .insert({
      workspace_id: auth.ctx.workspaceId,
      name: parsed.data.name,
      url: parsed.data.url,
      secret: parsed.data.secret ?? null,
      events: parsed.data.events,
      is_active: parsed.data.is_active,
    } as never)
    .select("id, name, url, events, is_active, created_at")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data }, { status: 201 });
}
