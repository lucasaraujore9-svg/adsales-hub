import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

const createSchema = z.object({
  type: z.enum([
    "call",
    "email",
    "whatsapp",
    "meeting",
    "task",
    "note",
    "sms",
    "video_meeting",
    "demo",
    "follow_up",
    "linkedin",
  ]),
  title: z.string().min(2).max(200),
  description: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  deal_id: z.string().uuid().optional().nullable(),
  contact_id: z.string().uuid().optional().nullable(),
  company_id: z.string().uuid().optional().nullable(),
  user_id: z.string().uuid().optional().nullable(),
  completed: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "deals:read");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 500);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const dealId = url.searchParams.get("deal_id");
  const contactId = url.searchParams.get("contact_id");
  const userId = url.searchParams.get("user_id");
  const type = url.searchParams.get("type");
  const completed = url.searchParams.get("completed");
  const dueAfter = url.searchParams.get("due_after");
  const dueBefore = url.searchParams.get("due_before");
  const search = url.searchParams.get("q");

  let query = sb
    .from("activities")
    .select(
      "id, type, title, description, due_date, completed, completed_at, outcome, deal_id, contact_id, company_id, user_id, created_at, updated_at",
      { count: "exact" },
    )
    .eq("workspace_id", auth.ctx.workspaceId)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (dealId) query = query.eq("deal_id", dealId);
  if (contactId) query = query.eq("contact_id", contactId);
  if (userId) query = query.eq("user_id", userId);
  if (type) query = query.eq("type", type);
  if (completed === "true") query = query.eq("completed", true);
  if (completed === "false") query = query.eq("completed", false);
  if (dueAfter) {
    const d = new Date(dueAfter);
    if (!Number.isNaN(d.getTime())) query = query.gte("due_date", d.toISOString());
  }
  if (dueBefore) {
    const d = new Date(dueBefore);
    if (!Number.isNaN(d.getTime())) query = query.lte("due_date", d.toISOString());
  }
  if (search) {
    const s = search.replace(/[%,]/g, "");
    query = query.ilike("title", `%${s}%`);
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
  const auth = await authenticateApiRequest(req, "deals:write");
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

  const insertBody = {
    ...parsed.data,
    workspace_id: auth.ctx.workspaceId,
    completed_at: parsed.data.completed ? new Date().toISOString() : null,
  };

  const { data, error } = await sb
    .from("activities")
    .insert(insertBody as never)
    .select("id, type, title, due_date, completed, created_at")
    .single();
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (parsed.data.completed) {
    void (async () => {
      const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
      const created = data as { id: string };
      await dispatchWebhook(auth.ctx.workspaceId, "activity.completed", {
        activity_id: created.id,
        via: "api",
      });
    })();
  }

  return NextResponse.json({ ok: true, data }, { status: 201 });
}
