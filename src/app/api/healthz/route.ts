import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const checkDb = url.searchParams.get("db") === "true";

  let dbStatus: "ok" | "error" | "skipped" = "skipped";
  let dbLatencyMs: number | null = null;

  if (checkDb) {
    const t0 = Date.now();
    try {
      const { createAdminSupabaseClient } = await import("@/lib/supabase/admin");
      const sb = createAdminSupabaseClient();
      const { error } = await sb.from("workspaces").select("id").limit(1);
      dbStatus = error ? "error" : "ok";
    } catch {
      dbStatus = "error";
    }
    dbLatencyMs = Date.now() - t0;
  }

  return NextResponse.json({
    status: "ok",
    version: process.env.npm_package_version ?? "0.1.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: dbStatus,
    db_latency_ms: dbLatencyMs,
  });
}
