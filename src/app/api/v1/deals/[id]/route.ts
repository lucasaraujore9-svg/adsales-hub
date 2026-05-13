import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

const updateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  value: z.coerce.number().nonnegative().optional(),
  stage_id: z.string().uuid().optional(),
  status: z.enum(["open", "won", "lost"]).optional(),
  expected_close_date: z.string().optional().nullable(),
  loss_reason_id: z.string().uuid().optional().nullable(),
  loss_reason_notes: z.string().optional().nullable(),
  owner_user_id: z.string().uuid().optional().nullable(),
});

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(req, "deals:read");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const sb = getAdmin();

  const { data } = await sb
    .from("deals")
    .select(
      "id, title, value, currency, status, pipeline_id, stage_id, contact_id, company_id, owner_user_id, source, expected_close_date, closed_at, stage_entered_at, created_at, updated_at",
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

  const { data: prevData } = await sb
    .from("deals")
    .select("status, stage_id")
    .eq("id", id)
    .eq("workspace_id", auth.ctx.workspaceId)
    .maybeSingle();
  const prev = prevData as { status: string; stage_id: string } | null;
  if (!prev) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === "won" || parsed.data.status === "lost") {
    update.closed_at = new Date().toISOString();
  }
  if (parsed.data.stage_id && parsed.data.stage_id !== prev.stage_id) {
    update.stage_entered_at = new Date().toISOString();
  }

  const { data, error } = await sb
    .from("deals")
    .update(update as never)
    .eq("id", id)
    .eq("workspace_id", auth.ctx.workspaceId)
    .select("id, title, value, status, stage_id, updated_at")
    .single();
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  void (async () => {
    const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
    if (parsed.data.status === "won" && prev.status !== "won") {
      await dispatchWebhook(auth.ctx.workspaceId, "deal.won", { deal_id: id, via: "api" });
    } else if (parsed.data.status === "lost" && prev.status !== "lost") {
      await dispatchWebhook(auth.ctx.workspaceId, "deal.lost", { deal_id: id, via: "api" });
    } else if (parsed.data.stage_id && parsed.data.stage_id !== prev.stage_id) {
      await dispatchWebhook(auth.ctx.workspaceId, "deal.stage_changed", {
        deal_id: id,
        from_stage_id: prev.stage_id,
        to_stage_id: parsed.data.stage_id,
        via: "api",
      });
    } else {
      await dispatchWebhook(auth.ctx.workspaceId, "deal.updated", {
        deal_id: id,
        changes: Object.keys(parsed.data),
        via: "api",
      });
    }
  })();

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(req, "deals:write");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const sb = getAdmin();

  const { error } = await sb
    .from("deals")
    .delete()
    .eq("id", id)
    .eq("workspace_id", auth.ctx.workspaceId);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
