import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ingestInboundMessage } from "@/lib/inbox/ingest";

export interface WhatsAppWebhookPayload {
  object: "whatsapp_business_account";
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: "whatsapp";
        metadata: { display_phone_number: string; phone_number_id: string };
        contacts?: Array<{ wa_id: string; profile?: { name?: string } }>;
        messages?: Array<WhatsAppInboundMessage>;
        statuses?: Array<WhatsAppMessageStatus>;
      };
      field: string;
    }>;
  }>;
}

interface WhatsAppInboundMessage {
  id: string;
  from: string;
  timestamp: string;
  type: "text" | "image" | "audio" | "video" | "document" | "button" | "interactive" | "location" | "contacts" | "reaction";
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  audio?: { id: string; mime_type: string };
  video?: { id: string; mime_type: string; caption?: string };
  document?: { id: string; filename: string; mime_type: string };
  button?: { text: string; payload: string };
  context?: { from: string; id: string };
}

interface WhatsAppMessageStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  conversation?: { id: string };
  pricing?: { billable: boolean; pricing_model: string; category: string };
  errors?: Array<{ code: number; title: string; message: string; error_data?: Record<string, unknown> }>;
}

/**
 * Persists inbound messages + status updates to the webhook_logs table. Higher
 * layers (issue 062) will translate these into activities/contacts creation.
 */
export async function processWhatsAppWebhook(
  payload: WhatsAppWebhookPayload,
): Promise<{ inbound: number; statuses: number }> {
  const admin = createAdminSupabaseClient();
  let inbound = 0;
  let statuses = 0;

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      const incomingMessages = change.value.messages ?? [];
      const incomingStatuses = change.value.statuses ?? [];
      inbound += incomingMessages.length;
      statuses += incomingStatuses.length;

      // Resolve workspace via the phone_number_id configured on the integration
      const phoneNumberId = change.value.metadata?.phone_number_id;
      if (!phoneNumberId) continue;

      const { data: integRow } = await admin
        .from("integrations")
        .select("workspace_id, credentials")
        .eq("provider", "whatsapp_cloud")
        .contains("credentials", { phone_number_id: phoneNumberId })
        .maybeSingle();
      const integ = integRow as unknown as { workspace_id: string } | null;
      if (!integ) continue;

      for (const msg of incomingMessages) {
        const senderName = change.value.contacts?.find((c) => c.wa_id === msg.from)?.profile?.name;
        const content =
          msg.text?.body ??
          msg.image?.caption ??
          msg.video?.caption ??
          `[${msg.type}]`;
        await ingestInboundMessage({
          workspaceId: integ.workspace_id,
          channel: "whatsapp_cloud",
          channelIdentifier: `+${msg.from}`,
          senderName,
          content,
          providerMessageId: msg.id,
        });
      }
    }
  }

  return { inbound, statuses };
}

export function verifyWhatsAppSubscription(
  mode: string | null,
  token: string | null,
  challenge: string | null,
  verifyToken: string,
): string | null {
  if (mode === "subscribe" && token === verifyToken && challenge) {
    return challenge;
  }
  return null;
}
