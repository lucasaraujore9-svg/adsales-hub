import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

type Period = "day" | "week" | "month" | "quarter" | "year";

function periodStart(period: Period): Date {
  const now = new Date();
  const d = new Date(now);
  switch (period) {
    case "day":
      d.setHours(0, 0, 0, 0);
      return d;
    case "week": {
      const day = d.getDay();
      d.setDate(d.getDate() - day);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "quarter": {
      const q = Math.floor(now.getMonth() / 3);
      return new Date(now.getFullYear(), q * 3, 1);
    }
    case "year":
      return new Date(now.getFullYear(), 0, 1);
  }
}

function isPeriod(value: string | null): value is Period {
  return value === "day" || value === "week" || value === "month" || value === "quarter" || value === "year";
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "deals:read");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();
  const wid = auth.ctx.workspaceId;

  const url = new URL(req.url);
  const periodParam = url.searchParams.get("period");
  const period: Period = isPeriod(periodParam) ? periodParam : "month";
  const since = periodStart(period).toISOString();

  const [
    { count: contactsTotal },
    { count: contactsNew },
    { data: openDeals },
    { data: wonDeals },
    { count: lostDeals },
  ] = await Promise.all([
    sb
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", wid),
    sb
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", wid)
      .gte("created_at", since),
    sb
      .from("deals")
      .select("value")
      .eq("workspace_id", wid)
      .eq("status", "open"),
    sb
      .from("deals")
      .select("value")
      .eq("workspace_id", wid)
      .eq("status", "won")
      .gte("closed_at", since),
    sb
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", wid)
      .eq("status", "lost")
      .gte("closed_at", since),
  ]);

  const openCount = (openDeals ?? []).length;
  const openValue = (openDeals ?? []).reduce(
    (acc, d) => acc + Number((d as { value: number | null }).value ?? 0),
    0,
  );
  const wonCount = (wonDeals ?? []).length;
  const wonValue = (wonDeals ?? []).reduce(
    (acc, d) => acc + Number((d as { value: number | null }).value ?? 0),
    0,
  );
  const lostCount = lostDeals ?? 0;
  const closedCount = wonCount + lostCount;
  const conversionRate = closedCount > 0 ? wonCount / closedCount : 0;
  const avgDealValue = wonCount > 0 ? wonValue / wonCount : 0;

  return NextResponse.json({
    ok: true,
    data: {
      period,
      period_start: since,
      contacts: {
        total: contactsTotal ?? 0,
        new_in_period: contactsNew ?? 0,
      },
      deals: {
        open_count: openCount,
        open_value: openValue,
        won_in_period_count: wonCount,
        won_in_period_value: wonValue,
        lost_in_period_count: lostCount,
        avg_deal_value: avgDealValue,
        conversion_rate: conversionRate,
      },
    },
  });
}
