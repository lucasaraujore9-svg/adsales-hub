import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

const createSchema = z.object({
  title: z.string().min(2).max(200),
  value: z.coerce.number().nonnegative().default(0),
  pipeline_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  contact_id: z.string().uuid().optional().nullable(),
  company_id: z.string().uuid().optional().nullable(),
  owner_user_id: z.string().uuid().optional().nullable(),
  source: z.string().optional().nullable(),
  expected_close_date: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "deals:read");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 500);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const status = url.searchParams.get("status");
  const pipelineId = url.searchParams.get("pipeline_id");
  const stageId = url.searchParams.get("stage_id");
  const ownerUserId = url.searchParams.get("owner_user_id");
  const contactId = url.searchParams.get("contact_id");
  const companyId = url.searchParams.get("company_id");
  const createdAfter = url.searchParams.get("created_after");
  const createdBefore = url.searchParams.get("created_before");
  const closedAfter = url.searchParams.get("closed_after");
  const closedBefore = url.searchParams.get("closed_before");
  const minValue = url.searchParams.get("min_value");
  const maxValue = url.searchParams.get("max_value");
  const search = url.searchParams.get("q");

  let q = sb
    .from("deals")
    .select(
      "id, title, value, currency, status, pipeline_id, stage_id, contact_id, company_id, owner_user_id, source, expected_close_date, closed_at, created_at, updated_at",
      { count: "exact" },
    )
    .eq("workspace_id", auth.ctx.workspaceId)
    .order("created_at", { ascending: false });

  if (status) q = q.eq("status", status);
  if (pipelineId) q = q.eq("pipeline_id", pipelineId);
  if (stageId) q = q.eq("stage_id", stageId);
  if (ownerUserId) q = q.eq("owner_user_id", ownerUserId);
  if (contactId) q = q.eq("contact_id", contactId);
  if (companyId) q = q.eq("company_id", companyId);
  if (createdAfter) {
    const d = new Date(createdAfter);
    if (!Number.isNaN(d.getTime())) q = q.gte("created_at", d.toISOString());
  }
  if (createdBefore) {
    const d = new Date(createdBefore);
    if (!Number.isNaN(d.getTime())) q = q.lte("created_at", d.toISOString());
  }
  if (closedAfter) {
    const d = new Date(closedAfter);
    if (!Number.isNaN(d.getTime())) q = q.gte("closed_at", d.toISOString());
  }
  if (closedBefore) {
    const d = new Date(closedBefore);
    if (!Number.isNaN(d.getTime())) q = q.lte("closed_at", d.toISOString());
  }
  if (minValue && !Number.isNaN(Number(minValue))) q = q.gte("value", Number(minValue));
  if (maxValue && !Number.isNaN(Number(maxValue))) q = q.lte("value", Number(maxValue));
  if (search) {
    const s = search.replace(/[%,]/g, "");
    q = q.ilike("title", `%${s}%`);
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
    return NextResponse.json(
      { ok: false, error: parsed.error.message },
      { status: 400 },
    );
  }

  // Validate pipeline/stage belong to workspace
  const { data: stageCheck } = await sb
    .from("pipeline_stages")
    .select("id, pipeline_id, pipelines(workspace_id)")
    .eq("id", parsed.data.stage_id)
    .maybeSingle();
  const stage = stageCheck as
    | {
        id: string;
        pipeline_id: string;
        pipelines: { workspace_id: string } | null;
      }
    | null;
  if (
    !stage ||
    stage.pipelines?.workspace_id !== auth.ctx.workspaceId ||
    stage.pipeline_id !== parsed.data.pipeline_id
  ) {
    return NextResponse.json(
      { ok: false, error: "Pipeline/stage invalido" },
      { status: 400 },
    );
  }

  const insertBody = {
    ...parsed.data,
    workspace_id: auth.ctx.workspaceId,
    stage_entered_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from("deals")
    .insert(insertBody as never)
    .select("id, title, value, status, pipeline_id, stage_id, created_at")
    .single();
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Fire webhook
  void (async () => {
    const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
    const created = data as { id: string };
    await dispatchWebhook(auth.ctx.workspaceId, "deal.created", {
      deal_id: created.id,
      title: parsed.data.title,
      value: parsed.data.value,
      contact_id: parsed.data.contact_id,
      via: "api",
    });
  })();

  return NextResponse.json({ ok: true, data }, { status: 201 });
}
