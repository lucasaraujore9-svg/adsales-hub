import "server-only";

import { requireServerEnv } from "@/lib/env";

const RESEND_API_BASE = "https://api.resend.com";

export interface EmailAttachment {
  filename: string;
  content: string; // base64-encoded
  contentType?: string;
}

export interface SendEmailInput {
  from?: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  reply_to?: string | string[];
  subject: string;
  html: string;
  text?: string;
  tags?: { name: string; value: string }[];
  headers?: Record<string, string>;
  attachments?: EmailAttachment[];
}

const DEFAULT_FROM = "AdSales Hub <noreply@adsaleshub.com.br>";

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 400 * 2 ** attempt + Math.random() * 200));
    }
  }
  throw lastErr;
}

export async function sendTransactional(input: SendEmailInput): Promise<{ id: string }> {
  return withRetry(async () => {
    const response = await fetch(`${RESEND_API_BASE}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${requireServerEnv("RESEND_API_KEY")}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ...input,
        from: input.from ?? DEFAULT_FROM,
      }),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Resend send failed: ${response.status} ${text.slice(0, 200)}`);
    }
    return JSON.parse(text) as { id: string };
  });
}

export async function sendBatch(messages: SendEmailInput[]): Promise<{ data: { id: string }[] }> {
  // Resend supports /emails/batch with up to 100 recipients per request
  const CHUNK = 100;
  const results: { id: string }[] = [];

  for (let i = 0; i < messages.length; i += CHUNK) {
    const chunk = messages.slice(i, i + CHUNK).map((m) => ({
      ...m,
      from: m.from ?? DEFAULT_FROM,
    }));
    const response = await fetch(`${RESEND_API_BASE}/emails/batch`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${requireServerEnv("RESEND_API_KEY")}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(chunk),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Resend batch failed: ${response.status} ${text.slice(0, 200)}`);
    }
    const parsed = JSON.parse(text) as { data: { id: string }[] };
    results.push(...(parsed.data ?? []));
  }

  return { data: results };
}
