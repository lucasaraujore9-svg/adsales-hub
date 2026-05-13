import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "deals:read");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();

  const url = new URL(req.url);
  const role = url.searchParams.get("role");
  const onlyActive = url.searchParams.get("active") !== "false";

  let q = sb
    .from("users")
    .select("id, name, email, role, is_active, last_seen_at, created_at")
    .eq("workspace_id", auth.ctx.workspaceId)
    .order("name");

  if (onlyActive) q = q.eq("is_active", true);
  if (role) q = q.eq("role", role);

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data: data ?? [] });
}
