/**
 * Pure SLA helpers — safe for both server and client components.
 * Based on `conversations.last_inbound_at` populated by the trigger
 * `bump_conversation_last_inbound` added in migration 00012.
 */

export function slaAgeMs(
  lastInboundAt: string | null,
  status: string,
): number | null {
  if (!lastInboundAt) return null;
  if (status === "resolved" || status === "spam") return null;
  return Date.now() - new Date(lastInboundAt).getTime();
}

export function slaBucket(ms: number | null): "ok" | "warn" | "late" {
  if (ms == null) return "ok";
  if (ms > 4 * 60 * 60 * 1000) return "late"; // > 4h
  if (ms > 60 * 60 * 1000) return "warn"; // > 1h
  return "ok";
}

export function formatSlaAge(ms: number | null): string | null {
  if (ms == null) return null;
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min}min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}
