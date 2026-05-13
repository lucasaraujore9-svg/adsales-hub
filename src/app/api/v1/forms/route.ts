import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "contacts:read");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const onlyActive = url.searchParams.get("active") === "true";

  let query = sb
    .from("forms")
    .select("id, slug, name, is_active, redirect_url, created_at, updated_at", {
      count: "exact",
    })
    .eq("workspace_id", auth.ctx.workspaceId)
    .order("created_at", { ascending: false });

  if (onlyActive) query = query.eq("is_active", true);

  const { data, count, error } = await query.range(offset, offset + limit - 1);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Aggregate submission counts
  const ids = (data ?? []).map((f) => (f as { id: string }).id);
  const submitCounts = new Map<string, number>();
  if (ids.length > 0) {
    const { data: subs } = await sb
      .from("form_submissions")
      .select("form_id")
      .eq("workspace_id", auth.ctx.workspaceId)
      .in("form_id", ids);
    for (const s of (subs ?? []) as { form_id: string | null }[]) {
      if (!s.form_id) continue;
      submitCounts.set(s.form_id, (submitCounts.get(s.form_id) ?? 0) + 1);
    }
  }

  const enriched = (data ?? []).map((f) => {
    const row = f as { id: string };
    return { ...row, submissions: submitCounts.get(row.id) ?? 0 };
  });

  return NextResponse.json({
    ok: true,
    data: enriched,
    meta: { total: count ?? 0, limit, offset },
  });
}
