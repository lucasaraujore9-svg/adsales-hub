/**
 * Verificação de signature de webhooks (Meta, WhatsApp, Resend, etc.).
 *
 * Em produção, requer o secret correspondente. Em dev, aceita sem
 * signature mas loga aviso. Comparação usa `timingSafeEqual` para
 * prevenir timing attacks.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifica signature `X-Hub-Signature-256` usada por Meta/Facebook/Instagram/WhatsApp.
 *
 * Header esperado: `sha256=<hex>` onde hex = HMAC-SHA256(rawBody, appSecret).
 */
export function verifyMetaSignature(
  rawBody: string | Buffer,
  headerValue: string | null,
  secret: string,
): boolean {
  if (!headerValue) return false;
  const [algo, hash] = headerValue.split("=");
  if (algo !== "sha256" || !hash) return false;

  const computed = createHmac("sha256", secret)
    .update(typeof rawBody === "string" ? rawBody : rawBody.toString("utf8"))
    .digest("hex");

  // timingSafeEqual exige Buffers de mesmo tamanho
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(computed, "hex");
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Helper para usar em handlers de rota.
 *
 * - Em produção: requer signature válida.
 * - Em dev sem secret configurado: aceita com warning (apenas para facilitar setup).
 *
 * Retorna `null` se OK; ou `Response` 401/403 se rejeitar.
 */
export function checkMetaSignatureOrReject(
  rawBody: string,
  request: Request,
  secret: string | undefined,
  source = "meta",
): Response | null {
  const isProd = process.env.NODE_ENV === "production";

  if (!secret) {
    if (isProd) {
      console.error(`[webhook:${source}] secret not configured in production`);
      return new Response(
        JSON.stringify({ error: "config_error" }),
        { status: 500, headers: { "content-type": "application/json" } },
      );
    }
    console.warn(`[webhook:${source}] secret not set; accepting in dev mode`);
    return null;
  }

  const sig = request.headers.get("x-hub-signature-256");
  if (!verifyMetaSignature(rawBody, sig, secret)) {
    console.warn(`[webhook:${source}] invalid signature`);
    return new Response(
      JSON.stringify({ error: "unauthorized" }),
      { status: 403, headers: { "content-type": "application/json" } },
    );
  }
  return null;
}
