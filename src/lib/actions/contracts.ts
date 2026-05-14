"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const generateSchema = z.object({
  deal_id: z.string().uuid(),
  template_id: z.string().uuid(),
  proposal_id: z.string().uuid().optional().nullable(),
  signers: z
    .array(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional().nullable(),
        role: z.enum(["signer", "witness", "approver"]).default("signer"),
      }),
    )
    .min(1),
  expires_in_days: z.coerce.number().int().min(1).max(180).default(30),
});

interface DealRow {
  id: string;
  workspace_id: string;
  title: string;
  contact_id: string | null;
  value: number;
}

interface TemplateRow {
  id: string;
  name: string;
  content: string;
  variables: unknown;
}

interface ContactRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

function renderVariables(template: string, vars: Record<string, string>): string {
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export async function generateContractFromTemplate(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const parsed = generateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const sb = session.supabase;

  const [{ data: dealData }, { data: tplData }] = await Promise.all([
    sb
      .from("deals")
      .select("id, workspace_id, title, contact_id, value")
      .eq("id", parsed.data.deal_id)
      .eq("workspace_id", session.workspaceId)
      .maybeSingle(),
    sb
      .from("contract_templates")
      .select("id, name, content, variables")
      .eq("id", parsed.data.template_id)
      .eq("workspace_id", session.workspaceId)
      .maybeSingle(),
  ]);
  const deal = dealData as DealRow | null;
  const tpl = tplData as TemplateRow | null;
  if (!deal) return { ok: false, error: "Deal não encontrado" };
  if (!tpl) return { ok: false, error: "Template não encontrado" };

  let contact: ContactRow | null = null;
  if (deal.contact_id) {
    const { data: contactData } = await sb
      .from("contacts")
      .select("id, name, email, phone")
      .eq("id", deal.contact_id)
      .maybeSingle();
    contact = contactData as ContactRow | null;
  }

  const today = new Date();
  const expires = new Date(today);
  expires.setDate(expires.getDate() + parsed.data.expires_in_days);

  const variables: Record<string, string> = {
    client_name: contact?.name ?? "",
    client_email: contact?.email ?? "",
    client_phone: contact?.phone ?? "",
    deal_title: deal.title,
    deal_value: Number(deal.value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }),
    deal_total: Number(deal.value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }),
    signature_date: today.toLocaleDateString("pt-BR"),
    validity_date: expires.toLocaleDateString("pt-BR"),
  };

  const renderedContent = renderVariables(tpl.content, variables);

  // Auditoria (issue 012): hash do conteúdo + token de verificação
  const { hashContractContent, generateVerificationToken } = await import(
    "@/lib/contracts/audit"
  );
  const contentHash = hashContractContent(renderedContent);
  const verificationToken = generateVerificationToken();

  const { data: contractData, error: contractErr } = await sb
    .from("contracts")
    .insert({
      workspace_id: session.workspaceId,
      deal_id: deal.id,
      proposal_id: parsed.data.proposal_id ?? null,
      template_id: tpl.id,
      title: `${tpl.name} — ${deal.title}`,
      content: renderedContent,
      variables,
      status: "pending_signature",
      expires_at: expires.toISOString(),
      content_hash: contentHash,
      verification_token: verificationToken,
    } as never)
    .select("id")
    .single();
  if (contractErr) return { ok: false, error: contractErr.message };
  const contract = contractData as { id: string };

  // Insert signatories
  const signersBody = parsed.data.signers.map((s, i) => ({
    workspace_id: session.workspaceId,
    contract_id: contract.id,
    name: s.name,
    email: s.email,
    phone: s.phone ?? null,
    role: s.role,
    sign_order: i + 1,
    status: "pending" as const,
  }));

  const { error: sigErr } = await sb
    .from("contract_signatories")
    .insert(signersBody as never);
  if (sigErr) return { ok: false, error: sigErr.message };

  revalidatePath(`/negocios/${deal.id}`);
  revalidatePath("/contratos");
  return { ok: true, data: contract };
}

export async function cancelContract(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("contracts")
    .update({ status: "canceled" } as never)
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/contratos");
  return { ok: true };
}

interface SignatoryWithContract {
  id: string;
  contract_id: string;
  workspace_id: string;
  name: string;
  email: string;
  status: string;
  contracts: { title: string; deal_id: string | null } | null;
}

export async function emailContractToSignatory(
  signatoryId: string,
): Promise<ActionResult<{ sent_to: string }>> {
  const session = await getSession();
  const sb = session.supabase;

  const { data } = await sb
    .from("contract_signatories")
    .select(
      "id, contract_id, workspace_id, name, email, status, contracts(title, deal_id)",
    )
    .eq("id", signatoryId)
    .eq("workspace_id", session.workspaceId)
    .maybeSingle();
  const sig = data as SignatoryWithContract | null;
  if (!sig) return { ok: false, error: "Signatario não encontrado" };
  if (sig.status === "signed") {
    return { ok: false, error: "Signatario já assinou" };
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://adsaleshub.7iegroup.com.br";
  const link = `${appUrl}/contrato/${sig.id}`;
  const contractTitle = sig.contracts?.title ?? "Contrato";

  const html = `
    <p>Ola ${sig.name},</p>
    <p>Voce foi convidado a assinar o contrato <strong>${contractTitle}</strong>.</p>
    <p style="margin: 24px 0;">
      <a href="${link}"
         style="display:inline-block; background:#FF5E1A; color:white; padding:14px 28px; border-radius:9999px; text-decoration:none; font-weight:500;">
        Revisar e assinar
      </a>
    </p>
    <p style="color:#666; font-size:12px;">Ou copie o link: ${link}</p>
    <p style="color:#666; font-size:12px;">Este link e pessoal — não compartilhe.</p>
  `.trim();

  const { sendEmailViaIntegration } = await import("@/lib/email/send");
  const result = await sendEmailViaIntegration({
    workspaceId: session.workspaceId,
    to: { email: sig.email, name: sig.name },
    subject: `Assinatura: ${contractTitle}`,
    html,
  });

  if (!result.ok) return { ok: false, error: result.error };

  if (sig.contracts?.deal_id) {
    revalidatePath(`/negocios/${sig.contracts.deal_id}`);
  }
  revalidatePath("/contratos");
  return { ok: true, data: { sent_to: sig.email } };
}
