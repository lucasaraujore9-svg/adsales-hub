import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

interface DigestStats {
  workspaceId: string;
  workspaceName: string;
  recipientsByEmail: Map<string, { userId: string; name: string | null }>;
  dealsCreated: number;
  dealsWon: number;
  dealsLost: number;
  revenue: number;
  activitiesCompleted: number;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Gera digest semanal por workspace e envia via Resend (ou loga em dev).
 */
export async function sendWeeklyDigests(): Promise<{
  workspaces: number;
  emailsSent: number;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminSupabaseClient() as any;

  const sinceIso = new Date(Date.now() - WEEK_MS).toISOString();
  const prevSinceIso = new Date(Date.now() - 2 * WEEK_MS).toISOString();

  const { data: workspaces } = await admin
    .from("workspaces")
    .select("id, name")
    .limit(500);

  const wsList = (workspaces ?? []) as Array<{ id: string; name: string }>;
  let totalEmails = 0;

  for (const ws of wsList) {
    try {
      const { data: members } = await admin
        .from("users")
        .select("id, email, name, role, notification_preferences")
        .eq("workspace_id", ws.id);

      const recipients = ((members ?? []) as Array<{
        id: string;
        email: string;
        name: string | null;
        role: string;
        notification_preferences: { weekly_digest?: boolean } | null;
      }>).filter((m) => {
        // Default true se preferências não existem; apenas admins/gestores
        const opts = m.notification_preferences ?? {};
        if (opts.weekly_digest === false) return false;
        return ["admin", "gestor"].includes(m.role);
      });

      if (recipients.length === 0) continue;

      const stats = await collectStats(admin, ws.id, ws.name, sinceIso);
      // Skip se workspace 100% inativo na semana
      if (
        stats.dealsCreated === 0 &&
        stats.dealsWon === 0 &&
        stats.dealsLost === 0 &&
        stats.activitiesCompleted === 0
      ) {
        continue;
      }

      const prevStats = await collectStats(
        admin,
        ws.id,
        ws.name,
        prevSinceIso,
        sinceIso,
      );

      const html = renderDigestHtml(stats, prevStats, ws.name);
      const subject = `Resumo semanal — ${ws.name}`;
      const resendKey = process.env.RESEND_API_KEY;

      for (const r of recipients) {
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
                to: [r.email],
                subject,
                html,
                tags: [{ name: "type", value: "weekly_digest" }],
              }),
            });
          } catch (e) {
            console.error("[digest/weekly] failed to send", r.email, e);
          }
        } else {
          console.log("[digest/weekly] (dev) would send", { to: r.email, ws: ws.name });
        }
        totalEmails += 1;
      }
    } catch (err) {
      console.error("[digest/weekly] failed for ws", ws.id, err);
    }
  }

  return { workspaces: wsList.length, emailsSent: totalEmails };
}

async function collectStats(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  workspaceId: string,
  workspaceName: string,
  start: string,
  end?: string,
): Promise<DigestStats> {
  const endIso = end ?? new Date().toISOString();

  const [createdRes, wonRes, lostRes, activitiesRes] = await Promise.all([
    admin
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .gte("created_at", start)
      .lt("created_at", endIso),
    admin
      .from("deals")
      .select("value", { count: "exact" })
      .eq("workspace_id", workspaceId)
      .eq("status", "won")
      .gte("closed_at", start)
      .lt("closed_at", endIso),
    admin
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "lost")
      .gte("closed_at", start)
      .lt("closed_at", endIso),
    admin
      .from("activities")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("completed", true)
      .gte("completed_at", start)
      .lt("completed_at", endIso),
  ]);

  const wonRows = (wonRes.data ?? []) as Array<{ value: number | null }>;
  const revenue = wonRows.reduce((s, d) => s + Number(d.value ?? 0), 0);

  return {
    workspaceId,
    workspaceName,
    recipientsByEmail: new Map(),
    dealsCreated: createdRes.count ?? 0,
    dealsWon: wonRes.count ?? wonRows.length,
    dealsLost: lostRes.count ?? 0,
    revenue,
    activitiesCompleted: activitiesRes.count ?? 0,
  };
}

function brl(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function delta(current: number, prev: number): string {
  if (prev === 0) return current === 0 ? "0%" : "+100%";
  const pct = ((current - prev) / prev) * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}%`;
}

function renderDigestHtml(
  current: DigestStats,
  prev: DigestStats,
  workspaceName: string,
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<body style="font-family: -apple-system, sans-serif; background: #f5f5f5; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px;">
    <h1 style="margin: 0 0 8px; color: #0A0A0B;">Resumo semanal</h1>
    <p style="margin: 0 0 24px; color: #777;">${workspaceName}</p>
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px;">
      ${statCard("Negócios criados", String(current.dealsCreated), delta(current.dealsCreated, prev.dealsCreated))}
      ${statCard("Negócios ganhos", String(current.dealsWon), delta(current.dealsWon, prev.dealsWon))}
      ${statCard("Receita", brl(current.revenue), delta(current.revenue, prev.revenue))}
      ${statCard("Atividades concluídas", String(current.activitiesCompleted), delta(current.activitiesCompleted, prev.activitiesCompleted))}
    </div>
    <p style="color: #555; font-size: 14px;">
      Compare com a semana anterior para ver evolução. Acesse o app para detalhes.
    </p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://adsaleshub.com"}/dashboard"
       style="display: inline-block; padding: 10px 20px; background: #FF5E1A; color: white; text-decoration: none; border-radius: 999px; font-weight: 500;">
      Abrir dashboard
    </a>
    <p style="color: #aaa; font-size: 12px; margin-top: 32px;">
      Você recebeu este email porque é admin/gestor neste workspace.
      Para desativar, vá em Configurações > Notificações.
    </p>
  </div>
</body>
</html>
`.trim();
}

function statCard(label: string, value: string, delta: string): string {
  return `
<div style="background: #fafafa; border-radius: 8px; padding: 16px;">
  <p style="margin: 0 0 4px; color: #777; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;">${label}</p>
  <p style="margin: 0; font-size: 24px; font-weight: 500; color: #0A0A0B;">${value}</p>
  <p style="margin: 4px 0 0; font-size: 12px; color: #555;">${delta} vs semana anterior</p>
</div>
`.trim();
}
