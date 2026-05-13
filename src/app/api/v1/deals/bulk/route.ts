import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

const dealSchema = z.object({
  title: z.string().min(2).max(200),
  value: z.coerce.number().nonnegative().default(0),
  pipeline_id: z.string().uuid(),
  stage_id: z.string().uuid(),
  contact_id: z.string().uuid().optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  source: z.string().optional().nullable(),
  status: z.enum(["open", "won", "lost"]).default("open"),
});

const bulkSchema = z.object({
  deals: z.array(dealSchema).min(1).max(500),
});

const BATCH_SIZE = 100;

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
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.message }, { status: 400 });
  }

  // Resolve contact_email -> contact_id
  const emails = parsed.data.deals
    .map((d) => d.contact_email)
    .filter((e): e is string => !!e);
  const contactByEmail = new Map<string, string>();
  if (emails.length > 0) {
    const { data } = await sb
      .from("contacts")
      .select("id, email")
      .eq("workspace_id", auth.ctx.workspaceId)
      .in("email", emails);
    for (const r of (data ?? []) as { id: string; email: string }[]) {
      contactByEmail.set(r.email.toLowerCase(), r.id);
    }
  }

  // Validate stage_id pertence a workspace (em batch)
  const stageIds = [...new Set(parsed.data.deals.map((d) => d.stage_id))];
  const { data: stagesData } = await sb
    .from("pipeline_stages")
    .select("id, pipeline_id, pipelines(workspace_id)")
    .in("id", stageIds);
  const validStages = new Map<string, string>();
  for (const s of (stagesData ?? []) as Array<{
    id: string;
    pipeline_id: string;
    pipelines: { workspace_id: string } | null;
  }>) {
    if (s.pipelines?.workspace_id === auth.ctx.workspaceId) {
      validStages.set(s.id, s.pipeline_id);
    }
  }

  let inserted = 0;
  let invalidStage = 0;
  let failed = 0;
  const insertedIds: string[] = [];

  const toInsert: Array<Record<string, unknown>> = [];
  const now = new Date().toISOString();

  for (const d of parsed.data.deals) {
    const stagePipelineId = validStages.get(d.stage_id);
    if (!stagePipelineId || stagePipelineId !== d.pipeline_id) {
      invalidStage++;
      continue;
    }
    const contact_id =
      d.contact_id ??
      (d.contact_email ? contactByEmail.get(d.contact_email.toLowerCase()) ?? null : null);

    const row: Record<string, unknown> = {
      workspace_id: auth.ctx.workspaceId,
      title: d.title,
      value: d.value,
      pipeline_id: d.pipeline_id,
      stage_id: d.stage_id,
      contact_id,
      source: d.source ?? "api",
      status: d.status,
      stage_entered_at: now,
    };
    if (d.status === "won" || d.status === "lost") row.closed_at = now;
    toInsert.push(row);
  }

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const { data, error } = await sb.from("deals").insert(batch as never).select("id");
    if (error) {
      failed += batch.length;
      continue;
    }
    const created = (data ?? []) as { id: string }[];
    inserted += created.length;
    for (const r of created) insertedIds.push(r.id);
  }

  return NextResponse.json({
    ok: true,
    data: {
      inserted,
      invalid_stage: invalidStage,
      failed,
      ids: insertedIds.slice(0, 500),
    },
  });
}
