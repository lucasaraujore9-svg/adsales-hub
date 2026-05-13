import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailParams {
  workspaceId: string;
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface IntegrationCreds {
  api_key?: string;
  from_email?: string;
  from_name?: string;
  reply_to?: string;
  smtp_host?: string;
  smtp_port?: number;
}

interface IntegrationRow {
  provider: string;
  credentials: IntegrationCreds | null;
  status: string;
}

export type SendEmailResult =
  | { ok: true; provider: string; message_id?: string }
  | { ok: false; error: string };

/**
 * Sends an email via the workspace's configured email integration.
 *
 * Supported providers (per `integrations.provider`):
 * - `resend`: uses Resend HTTP API
 * - `smtp` / `gmail`: stub — returns ok=false with hint until SMTP relay is configured
 */
export async function sendEmailViaIntegration(
  params: SendEmailParams,
): Promise<SendEmailResult> {
  const sb = createAdminSupabaseClient();
  const { data: integ } = await sb
    .from("integrations")
    .select("provider, credentials, status")
    .eq("workspace_id", params.workspaceId)
    .in("provider", ["resend", "smtp", "gmail"])
    .maybeSingle();
  const integration = integ as IntegrationRow | null;
  if (!integration || integration.status !== "active") {
    return {
      ok: false,
      error: "Integracao de email nao configurada. Configure em /configuracoes/gmail.",
    };
  }
  const creds = integration.credentials ?? {};

  const fromEmail = creds.from_email;
  const fromName = creds.from_name;
  const fromHeader = fromName ? `${fromName} <${fromEmail}>` : fromEmail ?? "";
  if (!fromEmail) {
    return { ok: false, error: "Email do remetente nao configurado" };
  }

  const recipients = Array.isArray(params.to) ? params.to : [params.to];
  const toHeaders = recipients.map((r) => (r.name ? `${r.name} <${r.email}>` : r.email));

  if (integration.provider === "resend") {
    if (!creds.api_key) return { ok: false, error: "Resend API key faltando" };
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${creds.api_key}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: fromHeader,
          to: toHeaders,
          subject: params.subject,
          html: params.html,
          text: params.text,
          reply_to: params.replyTo ?? creds.reply_to ?? undefined,
        }),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        return { ok: false, error: `Resend ${resp.status}: ${txt.slice(0, 200)}` };
      }
      const json = (await resp.json()) as { id?: string };
      return { ok: true, provider: "resend", message_id: json.id };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Erro na chamada Resend",
      };
    }
  }

  if (integration.provider === "smtp" || integration.provider === "gmail") {
    // Sem SDK SMTP no projeto. Estrategia atual: gravar como pending e
    // expor pra o user copiar conteudo + link. Quando worker SMTP for
    // adicionado, processa daqui.
    return {
      ok: false,
      error: `Provider "${integration.provider}" precisa de worker SMTP. Use Resend ou copie o link manualmente.`,
    };
  }

  return { ok: false, error: `Provider desconhecido: ${integration.provider}` };
}
