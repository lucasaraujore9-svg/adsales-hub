import "server-only";

import { requireServerEnv } from "@/lib/env";

const WA_GRAPH_BASE = "https://graph.facebook.com/v21.0";

export interface WhatsAppTextMessage {
  to: string;
  text: string;
  preview_url?: boolean;
}

export interface WhatsAppTemplateMessage {
  to: string;
  template: string;
  language?: string;
  components?: Array<{
    type: "header" | "body" | "button";
    sub_type?: "quick_reply" | "url";
    index?: string;
    parameters: Array<
      | { type: "text"; text: string }
      | { type: "currency"; currency: { fallback_value: string; code: string; amount_1000: number } }
      | { type: "image"; image: { link: string } }
      | { type: "document"; document: { link: string; filename?: string } }
      | { type: "payload"; payload: string }
    >;
  }>;
}

export interface WhatsAppMediaMessage {
  to: string;
  type: "image" | "video" | "audio" | "document";
  link: string;
  caption?: string;
  filename?: string;
}

export interface WhatsAppSendResult {
  messaging_product: "whatsapp";
  contacts: { input: string; wa_id: string }[];
  messages: { id: string; message_status?: string }[];
}

function phoneNumberId() {
  return requireServerEnv("WHATSAPP_PHONE_NUMBER_ID");
}

function token() {
  return requireServerEnv("WHATSAPP_TOKEN");
}

async function post<T>(path: string, body: object): Promise<T> {
  const response = await fetch(`${WA_GRAPH_BASE}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`WhatsApp API ${response.status}: ${text.slice(0, 200)}`);
  }
  return JSON.parse(text) as T;
}

function normalizePhone(input: string): string {
  return input.replace(/\D/g, "");
}

export async function sendText(input: WhatsAppTextMessage): Promise<WhatsAppSendResult> {
  return post<WhatsAppSendResult>(`${phoneNumberId()}/messages`, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalizePhone(input.to),
    type: "text",
    text: { body: input.text, preview_url: input.preview_url ?? false },
  });
}

export async function sendTemplate(input: WhatsAppTemplateMessage): Promise<WhatsAppSendResult> {
  return post<WhatsAppSendResult>(`${phoneNumberId()}/messages`, {
    messaging_product: "whatsapp",
    to: normalizePhone(input.to),
    type: "template",
    template: {
      name: input.template,
      language: { code: input.language ?? "pt_BR" },
      components: input.components ?? [],
    },
  });
}

export async function sendMedia(input: WhatsAppMediaMessage): Promise<WhatsAppSendResult> {
  const media: Record<string, unknown> = { link: input.link };
  if (input.caption) media.caption = input.caption;
  if (input.filename) media.filename = input.filename;

  return post<WhatsAppSendResult>(`${phoneNumberId()}/messages`, {
    messaging_product: "whatsapp",
    to: normalizePhone(input.to),
    type: input.type,
    [input.type]: media,
  });
}

export async function markAsRead(messageId: string): Promise<{ success: boolean }> {
  return post(`${phoneNumberId()}/messages`, {
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
  });
}

export async function uploadMedia(
  file: Blob,
  filename: string,
  type: string,
): Promise<{ id: string }> {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("file", file, filename);
  form.append("type", type);

  const response = await fetch(`${WA_GRAPH_BASE}/${phoneNumberId()}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}` },
    body: form,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`WhatsApp media upload failed: ${response.status} ${text.slice(0, 200)}`);
  }
  return JSON.parse(text) as { id: string };
}
