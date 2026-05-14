import "server-only";

import { createHash, randomBytes } from "node:crypto";

/**
 * Hash SHA-256 do conteúdo bruto do contrato.
 * Usado para garantir que o documento exibido ao signatário é o mesmo
 * exibido ao verificador público depois.
 */
export function hashContractContent(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Token público de verificação. Não tem relação com share_token (esse acessa
 * o contrato); este apenas mostra metadados na rota /contrato/verificar.
 */
export function generateVerificationToken(): string {
  return randomBytes(20).toString("base64url");
}

export type AuditEventType =
  | "link_sent"
  | "viewed"
  | "signed"
  | "declined"
  | "revoked"
  | "reminder_sent"
  | "fully_signed";

/**
 * Registra evento imutável de auditoria. Aceita admin client direto.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function recordContractEvent(
  admin: any,
  params: {
    contractId: string;
    workspaceId: string;
    eventType: AuditEventType;
    signatoryId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    geolocation?: Record<string, unknown> | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await admin.from("contract_signature_events").insert({
      contract_id: params.contractId,
      workspace_id: params.workspaceId,
      event_type: params.eventType,
      signatory_id: params.signatoryId ?? null,
      ip_address: params.ip ?? null,
      user_agent: params.userAgent ?? null,
      geolocation: params.geolocation ?? null,
      metadata: params.metadata ?? {},
    });
  } catch (err) {
    console.error("[contracts/audit] failed to record event", params, err);
  }
}
