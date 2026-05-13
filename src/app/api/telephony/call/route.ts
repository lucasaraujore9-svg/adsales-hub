import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { initiateOutboundCall } from "@/lib/telephony/client";
import { ensureAssistant } from "@/lib/telephony/assistants";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  to: z.string().min(8),
  deal_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  phone_number_id: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await requirePermission("pipeline.write");

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const assistantId = await ensureAssistant(session.workspaceId);

  const call = await initiateOutboundCall({
    phoneNumberId: parsed.data.phone_number_id,
    assistantId,
    to: parsed.data.to,
    metadata: {
      workspace_id: session.workspaceId,
      deal_id: parsed.data.deal_id ?? "",
      contact_id: parsed.data.contact_id ?? "",
      initiated_by: session.user.id,
    },
  });

  const admin = createAdminSupabaseClient();
  await admin.from("sdr_calls").insert({
    workspace_id: session.workspaceId,
    deal_id: parsed.data.deal_id ?? null,
    contact_id: parsed.data.contact_id ?? null,
    phone_number_called: parsed.data.to,
    attempt_number: 1,
    status: "queued",
    voice_call_id: call.id,
  });

  return NextResponse.json({ call_id: call.id });
}
