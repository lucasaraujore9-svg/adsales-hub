import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

interface StageRow {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  probability: number;
  is_won: boolean;
  is_lost: boolean;
}

interface PipelineRow {
  id: string;
  name: string;
  is_default: boolean;
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "deals:read");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();

  const [{ data: pipelinesData }, { data: stagesData }] = await Promise.all([
    sb
      .from("pipelines")
      .select("id, name, is_default")
      .eq("workspace_id", auth.ctx.workspaceId)
      .order("position"),
    sb
      .from("pipeline_stages")
      .select("id, pipeline_id, name, position, probability, is_won, is_lost")
      .order("position"),
  ]);

  const pipelines = (pipelinesData ?? []) as unknown as PipelineRow[];
  const allStages = (stagesData ?? []) as unknown as StageRow[];

  const data = pipelines.map((p) => ({
    ...p,
    stages: allStages
      .filter((s) => s.pipeline_id === p.id)
      .sort((a, b) => a.position - b.position),
  }));

  return NextResponse.json({ ok: true, data });
}
