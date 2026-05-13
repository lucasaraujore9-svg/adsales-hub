/**
 * Maps route prefixes to the module slug that grants access.
 * Routes not listed here are considered part of CRM (included in every plan).
 */
export const ROUTE_MODULE_MAP: { prefix: string; module: string }[] = [
  { prefix: "/campanhas", module: "ads" },
  { prefix: "/marketing/landing-pages", module: "site" },
  { prefix: "/marketing/formularios", module: "site" },
  { prefix: "/marketing/emails", module: "msg" },
  { prefix: "/social", module: "social" },
  { prefix: "/analytics", module: "bi" },
  { prefix: "/relatorios", module: "bi" },
  { prefix: "/analise", module: "bi" },
  { prefix: "/prospeccao/sdr-ia", module: "sdr" },
  { prefix: "/sdr", module: "sdr" },
  { prefix: "/contratos", module: "sign" },
];

export const CRM_ROUTES = new Set<string>([
  "/dashboard",
  "/inbox",
  "/pipeline",
  "/negocios",
  "/contatos",
  "/atividades",
  "/metas",
  "/automacoes",
  "/ligacoes",
  "/analise-calls",
  "/prospeccao",
]);

export const PUBLIC_ROUTES = new Set<string>([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/accept-invite",
  "/privacy",
  "/terms",
]);

export const PUBLIC_PREFIXES = [
  "/api/webhooks",
  "/api/auth/callback",
  "/api/healthz",
  "/api/forms/",
  "/api/proposals/",
  "/api/v1/",
  "/api/og",
  "/_next",
  "/favicon",
  "/public",
  "/brand-assets/",
  "/brandbook.html",
  "/brandbook",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/llms-full.txt",
  "/manifest.json",
  "/.well-known/",
  "/recursos",
  "/comparativos",
  "/calculadoras",
  "/glossario",
  "/guias",
  "/para",
  "/blog",
  "/p/",
  "/forms/",
  "/proposta/",
  "/contrato/",
  "/api/contracts/",
  "/api/auth/meta/deauthorize",
  "/api/auth/meta/delete-data",
  "/api/auth/meta/data-deletion-status",
  "/api/cron/",
  "/api/webhooks/",
];

export const ALWAYS_ALLOWED = new Set<string>([
  "/upgrade",
  "/onboarding",
  "/configuracoes/billing",
  "/api/auth/signout",
]);

export function matchModuleForPath(pathname: string): string | null {
  for (const entry of ROUTE_MODULE_MAP) {
    if (pathname === entry.prefix || pathname.startsWith(entry.prefix + "/")) {
      return entry.module;
    }
  }
  return null;
}

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function isAlwaysAllowed(pathname: string): boolean {
  if (ALWAYS_ALLOWED.has(pathname)) return true;
  return pathname.startsWith("/upgrade") || pathname.startsWith("/onboarding");
}
