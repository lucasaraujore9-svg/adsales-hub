import "server-only";

import { publicEnv } from "@/lib/env";

const BRAND = {
  name: "AdSales Hub",
  primary: "#FF5E1A",
  background: "#0A0A0B",
  panel: "#17171A",
  ink: "#FFFFFF",
  ink2: "rgba(255,255,255,0.72)",
};

function layout(title: string, body: string, footerNote?: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:Inter,system-ui,-apple-system,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr><td style="background:${BRAND.background};color:${BRAND.ink};padding:24px 32px;">
            <div style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.ink2};">
              <span style="display:inline-block;width:6px;height:6px;border-radius:999px;background:${BRAND.primary};margin-right:8px;vertical-align:middle;"></span>
              ${BRAND.name}
            </div>
            <div style="margin-top:12px;font-size:22px;font-weight:500;letter-spacing:-0.02em;">${title}</div>
          </td></tr>
          <tr><td style="padding:32px;font-size:14px;line-height:1.6;color:#27272a;">${body}</td></tr>
          <tr><td style="padding:16px 32px;font-size:11px;color:#71717a;border-top:1px solid #e4e4e7;">
            ${footerNote ?? ""}
            <div style="margin-top:6px;">
              © ${new Date().getFullYear()} ${BRAND.name} · <a href="${publicEnv.NEXT_PUBLIC_APP_URL}" style="color:${BRAND.primary};text-decoration:none;">adsaleshub.com.br</a>
            </div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function button(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;padding:12px 20px;background:${BRAND.primary};color:#fff;text-decoration:none;border-radius:999px;font-weight:600;">${label}</a>`;
}

export function renderInviteEmail(opts: {
  workspaceName: string;
  invitedByName: string;
  acceptUrl: string;
  role: string;
}): { subject: string; html: string } {
  const html = layout(
    `${opts.invitedByName} convidou voce para ${opts.workspaceName}`,
    `
      <p>Voce foi convidado para entrar no workspace <strong>${opts.workspaceName}</strong> no AdSales Hub como <strong>${opts.role}</strong>.</p>
      <p style="margin:24px 0;">${button("Aceitar convite", opts.acceptUrl)}</p>
      <p style="color:#71717a;">O link e valido por 72 horas. Se voce nao esperava esse convite, ignore este email.</p>
    `,
  );
  return {
    subject: `${opts.invitedByName} te convidou para ${opts.workspaceName}`,
    html,
  };
}

export function renderLeadNotification(opts: {
  salesRepName: string;
  leadName: string;
  source: string;
  dealLink: string;
}): { subject: string; html: string } {
  return {
    subject: `Novo lead: ${opts.leadName}`,
    html: layout(
      `Novo lead entrou no pipeline`,
      `
        <p>Ola ${opts.salesRepName},</p>
        <p>Um novo lead chegou: <strong>${opts.leadName}</strong> (origem: ${opts.source}).</p>
        <p style="margin:24px 0;">${button("Abrir negocio", opts.dealLink)}</p>
      `,
    ),
  };
}

export function renderTrialExpiring(opts: {
  daysLeft: number;
  workspaceName: string;
  billingUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Seu trial expira em ${opts.daysLeft} dia(s)`,
    html: layout(
      `Trial terminando`,
      `
        <p>O trial do workspace <strong>${opts.workspaceName}</strong> expira em <strong>${opts.daysLeft} dia(s)</strong>.</p>
        <p>Escolha uma cesta ou monte uma personalizada para continuar usando o AdSales Hub sem interrupcao.</p>
        <p style="margin:24px 0;">${button("Escolher plano", opts.billingUrl)}</p>
      `,
    ),
  };
}

export function renderPaymentFailed(opts: {
  workspaceName: string;
  attemptNumber: 1 | 2 | 3;
  billingUrl: string;
}): { subject: string; html: string } {
  const subjects = {
    1: "Nao conseguimos processar seu pagamento",
    2: "Segunda tentativa de pagamento falhou",
    3: "Ultima tentativa antes da suspensao",
  } as const;
  return {
    subject: subjects[opts.attemptNumber],
    html: layout(
      subjects[opts.attemptNumber],
      `
        <p>A cobranca do workspace <strong>${opts.workspaceName}</strong> falhou. Atualize os dados do cartao para manter seu acesso.</p>
        <p style="margin:24px 0;">${button("Atualizar pagamento", opts.billingUrl)}</p>
        <p style="color:#71717a;">Se o pagamento nao for regularizado, o workspace sera suspenso apos 7 dias.</p>
      `,
    ),
  };
}

export function renderReportReady(opts: {
  reportName: string;
  period: string;
  reportUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Relatorio pronto: ${opts.reportName}`,
    html: layout(
      `Seu relatorio esta pronto`,
      `
        <p>O relatorio <strong>${opts.reportName}</strong> (${opts.period}) foi gerado com sucesso.</p>
        <p style="margin:24px 0;">${button("Abrir relatorio", opts.reportUrl)}</p>
      `,
    ),
  };
}

export function renderSocialApproval(opts: {
  postPreview: string;
  approvalUrl: string;
  authorName: string;
}): { subject: string; html: string } {
  return {
    subject: `Aprovar post: ${opts.authorName}`,
    html: layout(
      `Post aguardando aprovacao`,
      `
        <p>${opts.authorName} enviou um post para aprovacao:</p>
        <blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid ${BRAND.primary};background:#fafafa;">${opts.postPreview}</blockquote>
        <p style="margin:24px 0;">${button("Aprovar ou editar", opts.approvalUrl)}</p>
      `,
    ),
  };
}

export { layout as emailLayout, button as emailButton };
