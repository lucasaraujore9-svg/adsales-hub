import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { VoiceWebhookEvent } from "@/lib/telephony/types";

function mapStatus(status: string | undefined): string {
  switch (status) {
    case "queued":
    case "ringing":
    case "in-progress":
      return status.replace("-", "_");
    case "ended":
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    case "forwarding":
      return "in_progress";
    default:
      return status ?? "queued";
  }
}

export async function processVoiceWebhook(event: VoiceWebhookEvent): Promise<void> {
  const msg = event.message;
  if (!msg.call?.id) return;

  const admin = createAdminSupabaseClient();

  if (msg.type === "status-update") {
    await admin
      .from("sdr_calls")
      .update({
        status: mapStatus(msg.call.status),
      })
      .eq("voice_call_id", msg.call.id);
    return;
  }

  if (msg.type === "end-of-call-report") {
    const duration =
      msg.call.duration ??
      msg.durationSeconds ??
      (msg.call.startedAt && msg.call.endedAt
        ? Math.round(
            (new Date(msg.call.endedAt).getTime() -
              new Date(msg.call.startedAt).getTime()) /
              1000,
          )
        : 0);

    await admin
      .from("sdr_calls")
      .update({
        status: msg.call.status === "failed" ? "failed" : "completed",
        duration_seconds: duration,
        recording_url: msg.call.recordingUrl ?? event.message.artifact?.recordingUrl ?? null,
        transcript: msg.call.transcript ?? event.message.artifact?.transcript ?? null,
        ai_summary: msg.call.analysis?.summary ?? null,
        started_at: msg.call.startedAt ?? null,
        ended_at: msg.call.endedAt ?? new Date().toISOString(),
      })
      .eq("voice_call_id", msg.call.id);
  }
}

export function verifyWebhookSecret(headerValue: string | null, expected?: string): boolean {
  if (!expected) return true;
  return headerValue === expected;
}
