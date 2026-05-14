import { headers } from "next/headers";

export type RequestMeta = {
  ip: string | null;
  userAgent: string | null;
  geo: { country: string | null; region: string | null; city: string | null } | null;
};

/**
 * Captura metadados de auditoria do request: IP, user-agent e geolocalização
 * aproximada (via headers do Vercel/Cloudflare).
 *
 * Importante para trilhas de auditoria (assinatura de contrato, propostas,
 * eventos sensíveis em geral).
 */
export async function getRequestMeta(): Promise<RequestMeta> {
  const h = await headers();

  const fwd = h.get("x-forwarded-for");
  const ip =
    (fwd ? fwd.split(",")[0].trim() : null) ?? h.get("x-real-ip") ?? null;

  const userAgent = h.get("user-agent") ?? null;

  // Vercel headers (presentes em produção): x-vercel-ip-country, etc.
  // Cloudflare alternativa: cf-ipcountry.
  const country = h.get("x-vercel-ip-country") ?? h.get("cf-ipcountry") ?? null;
  const region = h.get("x-vercel-ip-country-region") ?? null;
  const city = h.get("x-vercel-ip-city") ?? null;

  const geo = country || region || city ? { country, region, city } : null;

  return { ip, userAgent, geo };
}
