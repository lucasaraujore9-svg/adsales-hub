import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env";

interface CampaignRow {
  id: string;
  workspace_id: string;
  subject: string | null;
  content: string | null;
  segment_config: Record<string, unknown> | null;
  status: string;
  scheduled_at: string | null;
  from_email: string | null;
  from_name: string | null;
}

interface ContactRow {
  id: string;
  email: string | null;
  email_invalid: boolean | null;
  email_unsubscribed_at: string | null;
  unsubscribe_token: string | null;
  lifecycle_stage: string | null;
  source: string | null;
}

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 2_000;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function appendUnsubscribe(content: string, contactId: string, token: string): string {
  const url = `${publicEnv.NEXT_PUBLIC_APP_URL}/unsubscribe?contact=${contactId}&token=${token}`;
  const footer = `\n\n---\nNão quer mais receber? <a href="${url}">Cancelar inscrição</a>`;
  return content + footer;
}

async function resolveSegment(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  workspaceId: string,
  segment: Record<string, unknown> | null,
): Promise<ContactRow[]> {
  let q = admin
    .from("contacts")
    .select(
      "id, email, email_invalid, email_unsubscribed_at, unsubscribe_token, lifecycle_stage, source",
    )
    .eq("workspace_id", workspaceId)
    .not("email", "is", null);

  const lifecycle = segment?.lifecycle as string | undefined;
  const source = segment?.source as string | undefined;
  if (lifecycle) q = q.eq("lifecycle_stage", lifecycle);
  if (source) q = q.eq("source", source);

  // Filtro padrão: ignora merged (issue 025)
  q = q.is("merged_into_contact_id", null);

  const { data } = await q.limit(10_000);
  return (data ?? []) as ContactRow[];
}

async function sendEmailViaResend(params: {
  from: string;
  to: string;
  subject: string;
  html: string;
  tags?: Array<{ name: string; value: string }>;
}): Promise<{ id: string | null; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("[email] (dev) would send", { to: params.to, subject: params.subject });
    return { id: null };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: params.from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        tags: params.tags,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return { id: null, error: text };
    }
    const data = (await res.json()) as { id?: string };
    return { id: data.id ?? null };
  } catch (e) {
    return { id: null, error: String(e) };
  }
}

/**
 * Dispara uma campanha de email (issue 042).
 *
 * - Resolve segmento via `segment_config`
 * - Filtra contatos sem email, inválidos ou descadastrados
 * - Envia em batches respeitando rate limit
 * - Registra cada envio em `email_sends`
 * - Atualiza status final da campaign
 */
export async function dispatchEmailCampaign(campaignId: string): Promise<{
  total: number;
  sent: number;
  skipped: number;
  failed: number;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminSupabaseClient() as any;

  const { data: campRow } = await admin
    .from("email_campaigns")
    .select(
      "id, workspace_id, subject, content, segment_config, status, scheduled_at, from_email, from_name",
    )
    .eq("id", campaignId)
    .maybeSingle();
  const campaign = campRow as CampaignRow | null;
  if (!campaign) return { total: 0, sent: 0, skipped: 0, failed: 0 };
  if (campaign.status !== "scheduled") {
    return { total: 0, sent: 0, skipped: 0, failed: 0 };
  }

  await admin
    .from("email_campaigns")
    .update({ status: "sending" })
    .eq("id", campaign.id);

  const contacts = await resolveSegment(
    admin,
    campaign.workspace_id,
    campaign.segment_config,
  );
  const eligible = contacts.filter(
    (c) => c.email && !c.email_invalid && !c.email_unsubscribed_at,
  );

  const fromAddress = campaign.from_email ?? "no-reply@adsaleshub.com";
  const fromName = campaign.from_name ?? "AdSales Hub";
  const fromHeader = `${fromName} <${fromAddress}>`;

  let sent = 0;
  let skipped = contacts.length - eligible.length;
  let failed = 0;

  for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
    const batch = eligible.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (c) => {
        const token =
          c.unsubscribe_token ??
          (await ensureUnsubscribeToken(admin, c.id));
        const html = appendUnsubscribe(campaign.content ?? "", c.id, token);
        const res = await sendEmailViaResend({
          from: fromHeader,
          to: c.email!,
          subject: campaign.subject ?? "Sem assunto",
          html,
          tags: [{ name: "campaign_id", value: campaign.id }],
        });
        await admin.from("email_sends").insert({
          workspace_id: campaign.workspace_id,
          campaign_id: campaign.id,
          contact_id: c.id,
          to_email: c.email,
          external_id: res.id,
          status: res.error ? "failed" : "sent",
          sent_at: res.error ? null : new Date().toISOString(),
          error: res.error ?? null,
        });
        if (res.error) failed += 1;
        else sent += 1;
      }),
    );
    if (i + BATCH_SIZE < eligible.length) await sleep(BATCH_DELAY_MS);
  }

  await admin
    .from("email_campaigns")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .eq("id", campaign.id);

  return { total: contacts.length, sent, skipped, failed };
}

async function ensureUnsubscribeToken(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  contactId: string,
): Promise<string> {
  const token = `u_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
  await admin
    .from("contacts")
    .update({ unsubscribe_token: token })
    .eq("id", contactId)
    .is("unsubscribe_token", null);
  return token;
}
