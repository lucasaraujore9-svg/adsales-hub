import "server-only";

import { sendBatch, type SendEmailInput } from "@/lib/email/client";

interface BulkRecipient {
  email: string;
  name?: string;
  vars?: Record<string, string>;
}

interface BulkOptions {
  subject: string;
  render: (recipient: BulkRecipient) => string;
  from?: string;
  campaignId?: string;
  unsubscribeUrl: (recipient: BulkRecipient) => string;
}

/**
 * Send an email campaign to a list of recipients. Personalization is handled
 * by the caller's `render` function (template rendering). Each message gets
 * a unique unsubscribe link appended to the HTML.
 */
export async function sendBulk(
  recipients: BulkRecipient[],
  opts: BulkOptions,
): Promise<{ sent: number; batches: number }> {
  const messages: SendEmailInput[] = recipients.map((r) => ({
    from: opts.from,
    to: r.email,
    subject: opts.subject,
    html: appendUnsubscribe(opts.render(r), opts.unsubscribeUrl(r)),
    tags: opts.campaignId
      ? [{ name: "campaign_id", value: opts.campaignId }]
      : undefined,
  }));

  const { data } = await sendBatch(messages);
  return { sent: data.length, batches: Math.ceil(messages.length / 100) };
}

function appendUnsubscribe(html: string, unsubscribeUrl: string): string {
  const footer = `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e4e4e7;font-size:11px;color:#71717a;">Nao quer mais receber estes emails? <a href="${unsubscribeUrl}" style="color:#FF5E1A;">Descadastrar</a>.</div>`;
  if (html.includes("</body>")) {
    return html.replace("</body>", `${footer}</body>`);
  }
  return `${html}${footer}`;
}
