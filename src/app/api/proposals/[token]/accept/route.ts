import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

interface ProposalRow {
  id: string;
  status: string;
  validity_date: string | null;
  deal_id: string | null;
  workspace_id: string;
}

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const sb = createAdminSupabaseClient();

  const { data } = await sb
    .from("proposals")
    .select("id, status, validity_date, deal_id, workspace_id")
    .eq("share_token", token)
    .maybeSingle();
  const p = data as ProposalRow | null;
  if (!p) return NextResponse.json({ ok: false, error: "Nao encontrada" }, { status: 404 });

  if (p.status === "accepted") {
    return NextResponse.json({ ok: true });
  }
  if (p.status === "declined") {
    return NextResponse.json(
      { ok: false, error: "Ja foi recusada" },
      { status: 400 },
    );
  }
  if (p.validity_date && new Date(p.validity_date) < new Date()) {
    return NextResponse.json(
      { ok: false, error: "Proposta expirada" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const { error } = await sb
    .from("proposals")
    .update({ status: "accepted", accepted_at: now } as never)
    .eq("id", p.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // Auto-progress the deal stage to "won" if exists
  if (p.deal_id) {
    const { data: dealStages } = await sb
      .from("pipeline_stages")
      .select("id")
      .eq("is_won", true)
      .limit(1)
      .maybeSingle();
    const wonStageId = (dealStages as { id?: string } | null)?.id;
    const dealUpdate: Record<string, unknown> = {
      status: "won",
      closed_at: now,
    };
    if (wonStageId) dealUpdate.stage_id = wonStageId;
    await sb.from("deals").update(dealUpdate as never).eq("id", p.deal_id);
  }

  return NextResponse.json({ ok: true });
}
