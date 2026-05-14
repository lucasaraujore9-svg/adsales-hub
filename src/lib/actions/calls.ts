"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { friendlyError } from "@/lib/errors/friendly";
import { normalizePhone, isInDNC } from "@/lib/telephony/compliance";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const clickToCallSchema = z.object({
  contactId: z.string().uuid().optional().nullable(),
  dealId: z.string().uuid().optional().nullable(),
  phoneNumber: z.string().min(8),
});

/**
 * Inicia click-to-dial: cria registro em `sdr_calls` em modo outbound.
 *
 * Para MVP: registra a intenção. Quando o motor de voz estiver totalmente
 * integrado, esta action dispara `initiateOutboundCall()` da lib de telefonia.
 */
export async function initiateClickToCall(
  input: unknown,
): Promise<ActionResult<{ callId: string }>> {
  const parsed = clickToCallSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const sb = session.supabase;

  const phone = normalizePhone(parsed.data.phoneNumber);
  if (!phone) return { ok: false, error: "Telefone inválido." };

  // Compliance: bloqueia se está em DNC
  if (await isInDNC(sb, session.workspaceId, phone)) {
    return {
      ok: false,
      error: "Este contato pediu para não receber ligações (DNC).",
    };
  }

  // Verifica callback_phone do vendedor
  const { data: profileRow } = await sb
    .from("users")
    .select("callback_phone")
    .eq("id", session.user.id)
    .maybeSingle();
  const callbackPhone = (profileRow as { callback_phone: string | null } | null)
    ?.callback_phone;
  if (!callbackPhone) {
    return {
      ok: false,
      error:
        "Configure seu telefone de callback em Configurações > Perfil antes de usar click-to-call.",
    };
  }

  const { data, error } = await sb
    .from("sdr_calls")
    .insert({
      workspace_id: session.workspaceId,
      deal_id: parsed.data.dealId ?? null,
      contact_id: parsed.data.contactId ?? null,
      phone_number_called: phone,
      status: "queued",
      metadata: {
        click_to_call: true,
        callback_phone: callbackPhone,
        initiated_by: session.user.id,
      },
    } as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: friendlyError(error, "crud") };

  // TODO: disparar motor de voz real (initiateOutboundCall) quando integrado
  // try {
  //   const { initiateOutboundCall } = await import("@/lib/telephony/client");
  //   await initiateOutboundCall({ from: callbackPhone, to: phone, ... });
  // } catch (e) {...}

  if (parsed.data.dealId) revalidatePath(`/negocios/${parsed.data.dealId}`);
  revalidatePath("/ligacoes");

  return { ok: true, data: { callId: (data as { id: string }).id } };
}

const summarySchema = z.object({
  callId: z.string().uuid(),
  outcome: z.enum(["completed", "no_answer", "voicemail", "failed"]),
  notes: z.string().optional(),
  qualification_result: z.enum(["qualified", "not_qualified", "inconclusive"]).optional(),
});

/**
 * Registra o resumo manual da call após o usuário discar/atender.
 */
export async function logCallSummary(input: unknown): Promise<ActionResult> {
  const parsed = summarySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const sb = session.supabase;

  const { error } = await sb
    .from("sdr_calls")
    .update({
      status: parsed.data.outcome,
      ended_at: new Date().toISOString(),
      ai_summary: parsed.data.notes ?? null,
      qualification_result: parsed.data.qualification_result ?? null,
    } as never)
    .eq("id", parsed.data.callId)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: friendlyError(error, "crud") };

  revalidatePath("/ligacoes");
  return { ok: true };
}
