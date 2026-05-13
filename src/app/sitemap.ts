import type { MetadataRoute } from "next";

const SITE_URL = "https://adsaleshub.7iegroup.com.br";

const STATIC_PATHS: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, freq: "weekly" },
  { path: "/recursos", priority: 0.9, freq: "weekly" },
  { path: "/blog", priority: 0.9, freq: "weekly" },

  // Comparativos
  { path: "/comparativos/rd-station", priority: 0.85, freq: "monthly" },
  { path: "/comparativos/pipedrive", priority: 0.85, freq: "monthly" },
  { path: "/comparativos/hubspot", priority: 0.85, freq: "monthly" },
  { path: "/comparativos/kommo", priority: 0.85, freq: "monthly" },

  // Calculadoras
  { path: "/calculadoras/roas", priority: 0.8, freq: "monthly" },
  { path: "/calculadoras/cac", priority: 0.8, freq: "monthly" },
  { path: "/calculadoras/ltv-cac", priority: 0.8, freq: "monthly" },
  { path: "/calculadoras/cpl-ideal", priority: 0.8, freq: "monthly" },

  // Glossário
  { path: "/glossario/crm", priority: 0.7, freq: "monthly" },
  { path: "/glossario/roas", priority: 0.7, freq: "monthly" },
  { path: "/glossario/cac", priority: 0.7, freq: "monthly" },
  { path: "/glossario/atribuicao", priority: 0.7, freq: "monthly" },
  { path: "/glossario/sdr", priority: 0.7, freq: "monthly" },
  { path: "/glossario/trafego-pago", priority: 0.7, freq: "monthly" },

  // Guias
  { path: "/guias/como-migrar-do-rd-station", priority: 0.85, freq: "monthly" },
  { path: "/guias/como-criar-campanha-no-meta-ads", priority: 0.85, freq: "monthly" },
  { path: "/guias/quanto-custa-marketing-digital-pme", priority: 0.85, freq: "monthly" },
  { path: "/guias/como-demitir-agencia-sem-perder-resultado", priority: 0.85, freq: "monthly" },

  // Personas
  { path: "/para/agencias", priority: 0.8, freq: "monthly" },
  { path: "/para/ecommerce", priority: 0.8, freq: "monthly" },
  { path: "/para/educacao", priority: 0.8, freq: "monthly" },
  { path: "/para/prestadores-de-servico", priority: 0.8, freq: "monthly" },

  // Legal
  { path: "/privacy", priority: 0.4, freq: "monthly" },
  { path: "/terms", priority: 0.4, freq: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_PATHS.map(({ path, priority, freq }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: freq,
    priority,
    alternates: {
      languages: { "pt-BR": `${SITE_URL}${path}` },
    },
  }));
}
