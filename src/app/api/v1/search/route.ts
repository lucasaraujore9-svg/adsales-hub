import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "contacts:read");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();

  const url = new URL(req.url);
  const raw = url.searchParams.get("q");
  if (!raw || raw.trim().length < 2) {
    return NextResponse.json(
      { ok: false, error: "q must be at least 2 chars" },
      { status: 400 },
    );
  }
  const q = raw.replace(/[%,]/g, "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 10), 25);
  const types = (url.searchParams.get("types") ?? "contacts,deals,companies")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const wid = auth.ctx.workspaceId;
  const tasks: Array<PromiseLike<unknown>> = [];
  const result: {
    contacts?: Array<{ id: string; name: string; email: string | null; phone: string | null }>;
    deals?: Array<{ id: string; title: string; status: string; value: number | null }>;
    companies?: Array<{ id: string; name: string; website: string | null }>;
  } = {};

  if (types.includes("contacts")) {
    tasks.push(
      sb
        .from("contacts")
        .select("id, name, email, phone")
        .eq("workspace_id", wid)
        .or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
        .limit(limit)
        .then(({ data }) => {
          result.contacts = (data ?? []) as typeof result.contacts;
        }),
    );
  }
  if (types.includes("deals")) {
    tasks.push(
      sb
        .from("deals")
        .select("id, title, status, value")
        .eq("workspace_id", wid)
        .ilike("title", `%${q}%`)
        .limit(limit)
        .then(({ data }) => {
          result.deals = (data ?? []) as typeof result.deals;
        }),
    );
  }
  if (types.includes("companies")) {
    tasks.push(
      sb
        .from("companies")
        .select("id, name, website")
        .eq("workspace_id", wid)
        .ilike("name", `%${q}%`)
        .limit(limit)
        .then(({ data }) => {
          result.companies = (data ?? []) as typeof result.companies;
        }),
    );
  }

  await Promise.all(tasks);

  return NextResponse.json({ ok: true, data: result });
}
