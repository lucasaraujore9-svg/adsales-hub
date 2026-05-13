import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

const updateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  completed: z.boolean().optional(),
  outcome: z.string().optional().nullable(),
});

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(req, "deals:read");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const sb = getAdmin();

  const { data } = await sb
    .from("activities")
    .select(
      "id, type, title, description, due_date, completed, completed_at, outcome, deal_id, contact_id, company_id, user_id, created_at, updated_at",
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

  const { data: prev } = await sb
    .from("activities")
    .select("completed")
    .eq("id", id)
    .eq("workspace_id", auth.ctx.workspaceId)
    .maybeSingle();
  if (!prev) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.completed === true) {
    update.completed_at = new Date().toISOString();
  } else if (parsed.data.completed === false) {
    update.completed_at = null;
  }

  const { data, error } = await sb
    .from("activities")
    .update(update as never)
    .eq("id", id)
    .eq("workspace_id", auth.ctx.workspaceId)
    .select("id, completed, updated_at")
    .single();
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const wasCompleted = (prev as { completed?: boolean }).completed;
  if (parsed.data.completed === true && !wasCompleted) {
    void (async () => {
      const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
      await dispatchWebhook(auth.ctx.workspaceId, "activity.completed", {
        activity_id: id,
        via: "api",
      });
    })();
  }

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(req, "deals:write");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const sb = getAdmin();

  const { error } = await sb
    .from("activities")
    .delete()
    .eq("id", id)
    .eq("workspace_id", auth.ctx.workspaceId);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
