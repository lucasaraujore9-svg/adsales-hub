import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiRequest(req, "contacts:read");
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  const sb = getAdmin();

  const { data: form } = await sb
    .from("forms")
    .select("id")
    .eq("id", id)
    .eq("workspace_id", auth.ctx.workspaceId)
    .maybeSingle();
  if (!form) {
    return NextResponse.json({ ok: false, error: "Form not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 500);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const since = url.searchParams.get("since");
  const utmSource = url.searchParams.get("utm_source");
  const utmCampaign = url.searchParams.get("utm_campaign");

  let query = sb
    .from("form_submissions")
    .select(
      "id, data, utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer, contact_id, created_at",
      { count: "exact" },
    )
    .eq("workspace_id", auth.ctx.workspaceId)
    .eq("form_id", id)
    .order("created_at", { ascending: false });

  if (since) {
    const date = new Date(since);
    if (!Number.isNaN(date.getTime())) {
      query = query.gte("created_at", date.toISOString());
    }
  }
  if (utmSource) query = query.eq("utm_source", utmSource);
  if (utmCampaign) query = query.eq("utm_campaign", utmCampaign);

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
