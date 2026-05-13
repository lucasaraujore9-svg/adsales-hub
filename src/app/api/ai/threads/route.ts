import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase } = await requireAuth();
  const { data } = await supabase
    .from("ai_chat_threads")
    .select("id, title, last_message_at, message_count, created_at")
    .order("last_message_at", { ascending: false })
    .limit(20);
  return NextResponse.json({ threads: data ?? [] });
}
