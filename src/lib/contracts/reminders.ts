import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env";

const MAX_REMINDERS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

type ReminderKind = "silent_3d" | "viewed_5d" | "silent_7d";

interface ProposalRow {
  id: string;
  workspace_id: string;
  title: string;
  contact_id: string | null;
  share_token: string;
  sent_at: string | null;
  viewed_at: string | null;
  reminders_sent: number;
  last_reminder_at: string | null;
}

const TEMPLATES: Record<ReminderKind, { subject: string; body: (link: string, title: string) => string }> = {
  silent_3d: {
    subject: "Lembrete: você recebeu uma proposta",
    body: (link, title) =>
      `Olá! Há alguns dias enviamos a proposta "${title}". Tem alguma dúvida que possamos ajudar?\n\nAcessar proposta: ${link}\n\nResponda este email se preferir conversar.`,
  },
  viewed_5d: {
    subject: "Posso ajudar com alguma dúvida?",
    body: (link, title) =>
      `Olá! Vi que você abriu a proposta "${title}". Posso ajudar com alguma dúvida ou ajustar algo?\n\nAcessar proposta: ${link}`,
  },
  silent_7d: {
    subject: "Última chamada — sua proposta",
    body: (link, title) =>
      `A proposta "${title}" ainda está aberta. Se faz sentido seguirmos, é só clicar:\n\n${link}\n\nSe preferir, podemos remarcar uma conversa.`,
  },
};

/**
 * Roda em cron: identifica propostas com lembrete vencendo e envia.
 *
 * - 3 dias após sent_at, sem visualização → silent_3d
 * - 5 dias após viewed_at (mas não aceito/recusado) → viewed_5d
 * - 7 dias após sent_at, ainda sem visualização → silent_7d
 *
 * Máximo `MAX_REMINDERS` por proposta. Respeita `reminders_disabled`.
 */
export async function sendProposalReminders(): Promise<{
  scanned: number;
  sent: number;
  skipped: number;
  errors: number;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminSupabaseClient() as any;
  const now = Date.now();

  const { data: rows } = await admin
    .from("proposals")
    .select(
      "id, workspace_id, title, contact_id, share_token, sent_at, viewed_at, reminders_sent, last_reminder_at",
    )
    .eq("status", "sent")
    .eq("reminders_disabled", false)
    .lt("reminders_sent", MAX_REMINDERS)
    .not("sent_at", "is", null)
    .limit(200);

  const proposals = (rows ?? []) as ProposalRow[];
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const p of proposals) {
    try {
      const sentMs = p.sent_at ? Date.parse(p.sent_at) : 0;
      const viewedMs = p.viewed_at ? Date.parse(p.viewed_at) : 0;
      const lastMs = p.last_reminder_at ? Date.parse(p.last_reminder_at) : 0;

      let kind: ReminderKind | null = null;
      if (viewedMs > 0 && now - viewedMs >= 5 * DAY_MS && now - lastMs >= 2 * DAY_MS) {
        kind = "viewed_5d";
      } else if (viewedMs === 0 && now - sentMs >= 7 * DAY_MS && now - lastMs >= 2 * DAY_MS) {
        kind = "silent_7d";
      } else if (viewedMs === 0 && now - sentMs >= 3 * DAY_MS && now - lastMs >= 1 * DAY_MS) {
        kind = "silent_3d";
      }

      if (!kind) {
        skipped += 1;
        continue;
      }

      // Resolve email do contato
      let toEmail: string | null = null;
      if (p.contact_id) {
        const { data: c } = await admin
          .from("contacts")
          .select("email")
          .eq("id", p.contact_id)
          .maybeSingle();
        toEmail = (c as { email: string | null } | null)?.email ?? null;
      }

      if (!toEmail) {
        skipped += 1;
        continue;
      }

      const link = `${publicEnv.NEXT_PUBLIC_APP_URL}/proposta/${p.share_token}`;
      const tpl = TEMPLATES[kind];

      // Envia via Resend se chave disponível, senão apenas loga.
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              authorization: `Bearer ${resendKey}`,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              from: "AdSales Hub <no-reply@adsaleshub.com>",
              to: [toEmail],
              subject: tpl.subject,
              text: tpl.body(link, p.title),
            }),
          });
        } catch (err) {
          console.error("[reminders] resend failed", err);
        }
      } else {
        console.log("[reminders] (dev) would send", { to: toEmail, kind, link });
      }

      await admin
        .from("proposals")
        .update({
          reminders_sent: p.reminders_sent + 1,
          last_reminder_at: new Date().toISOString(),
        })
        .eq("id", p.id);

      sent += 1;
    } catch (err) {
      console.error("[reminders] erro proposal", p.id, err);
      errors += 1;
    }
  }

  return { scanned: proposals.length, sent, skipped, errors };
}
