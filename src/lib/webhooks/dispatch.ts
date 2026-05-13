import "server-only";

import { createHmac } from "node:crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type WebhookEvent =
  | "deal.created"
  | "deal.updated"
  | "deal.won"
  | "deal.lost"
  | "deal.stage_changed"
  | "contact.created"
  | "contact.updated"
  | "lead.captured"
  | "campaign.published"
  | "campaign.paused"
  | "form.submitted"
  | "activity.completed";

interface WebhookRow {
  id: string;
  url: string;
  secret: string | null;
  events: string[];
  is_active: boolean;
}

/**
 * Dispatches an event to all matching active webhooks for a workspace.
 *
 * Strategy: best-effort fire-and-forget. We log every attempt to
 * `webhook_logs` (success/failed). Failures don't throw — caller actions
 * shouldn't block on webhooks.
 *
 * If the webhook has a `secret`, we add an HMAC-SHA256 signature in the
 * `x-adsales-signature` header (hex digest of the raw body).
 */
export async function dispatchWebhook(
  workspaceId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>,
): Promise<void> {
  const sb = createAdminSupabaseClient();
  const { data } = await sb
    .from("webhooks")
    .select("id, url, secret, events, is_active")
    .eq("workspace_id", workspaceId)
    .eq("is_active", true);

  const webhooks = (data ?? []) as unknown as WebhookRow[];
  const matching = webhooks.filter((w) => (w.events ?? []).includes(event));
  if (matching.length === 0) return;

  const body = JSON.stringify({
    event,
    workspace_id: workspaceId,
    sent_at: new Date().toISOString(),
    data: payload,
  });

  await Promise.all(
    matching.map(async (w) => {
      const headers: Record<string, string> = {
        "content-type": "application/json",
        "user-agent": "AdSalesHub-Webhook/1.0",
        "x-adsales-event": event,
      };
      if (w.secret) {
        const sig = createHmac("sha256", w.secret).update(body).digest("hex");
        headers["x-adsales-signature"] = sig;
      }

      let status: number | null = null;
      let responseBody: string | null = null;
      let error: string | null = null;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const resp = await fetch(w.url, {
          method: "POST",
          headers,
          body,
          signal: controller.signal,
        });
        clearTimeout(timeout);
        status = resp.status;
        try {
          responseBody = (await resp.text()).slice(0, 1000);
        } catch {
          responseBody = null;
        }
      } catch (err) {
        error = err instanceof Error ? err.message : "unknown";
      }

      const success = status !== null && status >= 200 && status < 300;
      await sb.from("webhook_logs").insert({
        workspace_id: workspaceId,
        webhook_id: w.id,
        direction: "outgoing",
        event,
        payload: JSON.parse(body),
        response_status: status,
        response_body: responseBody,
        error: success ? null : error ?? `HTTP ${status}`,
      } as never);
    }),
  );
}
