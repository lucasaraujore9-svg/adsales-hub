import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

interface ProposalRow {
  id: string;
  status: string;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const sb = createAdminSupabaseClient();

  let body: { reason?: string } = {};
  try {
    body = (await req.json()) as { reason?: string };
  } catch {
    // optional body
  }
  const reason = (body.reason ?? "").toString().trim().slice(0, 500) || null;

  const { data } = await sb
    .from("proposals")
    .select("id, status")
    .eq("share_token", token)
    .maybeSingle();
  const p = data as ProposalRow | null;
  if (!p) return NextResponse.json({ ok: false, error: "Nao encontrada" }, { status: 404 });

  if (p.status === "declined" || p.status === "accepted") {
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toISOString();
  const { error } = await sb
    .from("proposals")
    .update({
      status: "declined",
      declined_at: now,
      decline_reason: reason,
    } as never)
    .eq("id", p.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
