"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const generateSchema = z.object({
  deal_id: z.string().uuid(),
  template_id: z.string().uuid(),
  product_ids: z.array(z.string().uuid()).optional(),
});

interface ProductRow {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_cycle: string;
}

interface DealRow {
  id: string;
  workspace_id: string;
  title: string;
  contact_id: string | null;
  value: number;
  currency: string;
}

interface TemplateRow {
  id: string;
  name: string;
  blocks: unknown;
  default_validity_days: number;
}

export async function generateProposalFromTemplate(
  input: unknown,
): Promise<ActionResult<{ id: string; share_token: string }>> {
  const parsed = generateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const sb = session.supabase;

  const [{ data: dealData }, { data: tplData }] = await Promise.all([
    sb
      .from("deals")
      .select("id, workspace_id, title, contact_id, value, currency")
      .eq("id", parsed.data.deal_id)
      .eq("workspace_id", session.workspaceId)
      .maybeSingle(),
    sb
      .from("proposal_templates")
      .select("id, name, blocks, default_validity_days")
      .eq("id", parsed.data.template_id)
      .eq("workspace_id", session.workspaceId)
      .maybeSingle(),
  ]);
  const deal = dealData as DealRow | null;
  const tpl = tplData as TemplateRow | null;
  if (!deal) return { ok: false, error: "Deal nao encontrado" };
  if (!tpl) return { ok: false, error: "Template nao encontrado" };

  let products: ProductRow[] = [];
  if (parsed.data.product_ids && parsed.data.product_ids.length > 0) {
    const { data: prodData } = await sb
      .from("products")
      .select("id, name, price, currency, billing_cycle")
      .in("id", parsed.data.product_ids)
      .eq("workspace_id", session.workspaceId);
    products = (prodData ?? []) as unknown as ProductRow[];
  }

  const subtotal =
    products.length > 0
      ? products.reduce((a, p) => a + Number(p.price), 0)
      : Number(deal.value || 0);

  const validityDate = new Date();
  validityDate.setDate(validityDate.getDate() + (tpl.default_validity_days || 7));

  const insertBody = {
    workspace_id: session.workspaceId,
    deal_id: deal.id,
    contact_id: deal.contact_id,
    created_by_user_id: session.user.id,
    template_id: tpl.id,
    title: `${tpl.name} — ${deal.title}`,
    content: { blocks: tpl.blocks ?? [] },
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      currency: p.currency,
      billing_cycle: p.billing_cycle,
    })),
    subtotal,
    discount: 0,
    tax: 0,
    total: subtotal,
    validity_date: validityDate.toISOString().slice(0, 10),
    status: "draft" as const,
  };

  const { data, error } = await sb
    .from("proposals")
    .insert(insertBody as never)
    .select("id, share_token")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/negocios/${deal.id}`);
  revalidatePath("/contratos");
  return { ok: true, data: data as { id: string; share_token: string } };
}

const sendSchema = z.object({ id: z.string().uuid() });

export async function sendProposal(input: unknown): Promise<ActionResult> {
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const { error } = await session.supabase
    .from("proposals")
    .update({ status: "sent" } as never)
    .eq("id", parsed.data.id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/contratos`);
  return { ok: true };
}

export async function cancelProposal(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("proposals")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/contratos`);
  return { ok: true };
}

interface ProposalWithContact {
  id: string;
  workspace_id: string;
  title: string;
  share_token: string;
  status: string;
  total: number;
  contact_id: string | null;
}

export async function emailProposalLink(
  id: string,
): Promise<ActionResult<{ sent_to: string }>> {
  const session = await getSession();
  const sb = session.supabase;

  const { data } = await sb
    .from("proposals")
    .select("id, workspace_id, title, share_token, status, total, contact_id")
    .eq("id", id)
    .eq("workspace_id", session.workspaceId)
    .maybeSingle();
  const proposal = data as ProposalWithContact | null;
  if (!proposal) return { ok: false, error: "Proposta nao encontrada" };
  if (!proposal.contact_id) {
    return { ok: false, error: "Proposta sem contato vinculado" };
  }

  const { data: contactData } = await sb
    .from("contacts")
    .select("name, email")
    .eq("id", proposal.contact_id)
    .maybeSingle();
  const contact = contactData as { name?: string; email?: string | null } | null;
  if (!contact?.email) {
    return { ok: false, error: "Contato sem email" };
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://adsaleshub.7iegroup.com.br";
  const link = `${appUrl}/proposta/${proposal.share_token}`;
  const totalFmt = Number(proposal.total).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const html = `
    <p>Ola ${contact.name ?? ""},</p>
    <p>Sua proposta <strong>${proposal.title}</strong> esta pronta para revisao.</p>
    <p>Valor total: <strong>${totalFmt}</strong></p>
    <p style="margin: 24px 0;">
      <a href="${link}"
         style="display:inline-block; background:#FF5E1A; color:white; padding:14px 28px; border-radius:9999px; text-decoration:none; font-weight:500;">
        Ver e aceitar proposta
      </a>
    </p>
    <p style="color:#666; font-size:12px;">Ou copie o link: ${link}</p>
  `.trim();

  const { sendEmailViaIntegration } = await import("@/lib/email/send");
  const result = await sendEmailViaIntegration({
    workspaceId: session.workspaceId,
    to: { email: contact.email, name: contact.name ?? undefined },
    subject: `Proposta: ${proposal.title}`,
    html,
  });

  if (!result.ok) return { ok: false, error: result.error };

  if (proposal.status === "draft") {
    await sb.from("proposals").update({ status: "sent" } as never).eq("id", id);
  }
  revalidatePath(`/negocios`);
  revalidatePath(`/contratos`);
  return { ok: true, data: { sent_to: contact.email } };
}
