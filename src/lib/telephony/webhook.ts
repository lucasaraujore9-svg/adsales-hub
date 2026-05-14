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

    // LGPD: extrai consentimento das structured_data do assistente.
    // Aceita tanto `msg.call.analysis.structuredData.consent` quanto
    // `msg.analysis.consent` (formato pode variar por provider).
    const structured =
      (msg.call.analysis?.structuredData as Record<string, unknown> | undefined) ??
      (msg.analysis as Record<string, unknown> | undefined) ??
      {};
    const rawConsent = String(structured.consent ?? "").toLowerCase();
    const consentText = (structured.consent_text as string | undefined) ?? null;
    const consentGiven =
      rawConsent === "yes" || rawConsent === "sim" || rawConsent === "true";

    // 90 dias de retenção padrão para gravações com consentimento
    const retentionUntil = consentGiven
      ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const rawRecording =
      msg.call.recordingUrl ?? event.message.artifact?.recordingUrl ?? null;
    const rawTranscript =
      msg.call.transcript ?? event.message.artifact?.transcript ?? null;

    await admin
      .from("sdr_calls")
      .update({
        status: msg.call.status === "failed" ? "failed" : "completed",
        duration_seconds: duration,
        // Sem consentimento → não armazena gravação nem transcrição
        recording_url: consentGiven ? rawRecording : null,
        transcript: consentGiven ? rawTranscript : null,
        ai_summary: msg.call.analysis?.summary ?? null,
        consent_recorded: consentGiven,
        consent_text: consentText,
        recording_retention_until: retentionUntil,
        started_at: msg.call.startedAt ?? null,
        ended_at: msg.call.endedAt ?? new Date().toISOString(),
      } as never)
      .eq("voice_call_id", msg.call.id);

    // Se o lead pediu para não ser contatado, adiciona à DNC (issue 060)
    const dncRequested = String(structured.dnc_request ?? "").toLowerCase() === "true";
    if (dncRequested || rawConsent === "no") {
      try {
        const { data: callRow } = await admin
          .from("sdr_calls")
          .select("workspace_id, contact_id, phone_number_called")
          .eq("voice_call_id", msg.call.id)
          .maybeSingle();
        const call = callRow as
          | {
              workspace_id: string;
              contact_id: string | null;
              phone_number_called: string;
            }
          | null;
        if (call?.phone_number_called) {
          const { addToDNC } = await import("@/lib/telephony/compliance");
          await addToDNC(admin, {
            workspaceId: call.workspace_id,
            phone: call.phone_number_called,
            source: rawConsent === "no" ? "call_request" : "call_request",
            reason: rawConsent === "no" ? "Recusou gravação" : "Pediu para não ser contatado",
            contactId: call.contact_id,
          });
        }
      } catch (err) {
        console.error("[voice-engine] failed to add DNC", err);
      }
    }
  }
}

/**
 * Verifica secret do webhook do motor de voz.
 *
 * - Em produção: requer secret configurado E header válido.
 * - Em dev: se secret não configurado, aceita com warning (facilita setup).
 *
 * Comparação em tempo constante via `timingSafeEqual` quando ambos têm valor.
 */
export function verifyWebhookSecret(
  headerValue: string | null,
  expected?: string,
): boolean {
  const isProd = process.env.NODE_ENV === "production";
  if (!expected) {
    if (isProd) {
      console.error("[voice-engine] VOICE_ENGINE_WEBHOOK_SECRET not configured in production");
      return false;
    }
    console.warn("[voice-engine] webhook secret not set; accepting in dev mode only");
    return true;
  }
  if (!headerValue) return false;
  if (headerValue.length !== expected.length) return false;
  // Comparação simples (não usa timingSafeEqual pra não exigir crypto aqui).
  // Como esses tokens são longos e aleatórios, diferença de tempo é mínima.
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ headerValue.charCodeAt(i);
  }
  return mismatch === 0;
}
