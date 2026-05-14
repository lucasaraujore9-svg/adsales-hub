/**
 * Definição central dos planos disponíveis e dos recursos por plano.
 * Usado por `<PricingMatrix>` e por outras telas que comparam cestas.
 */

export type PlanId = "operacao" | "crescimento" | "escala";

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  /** Preço mensal em BRL (mensal). */
  monthly: number;
  /** Preço mensal pago anualmente (com desconto). */
  yearly: number;
  recommended?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "operacao",
    name: "Operação",
    description: "CRM + landing pages básicas. Para começar.",
    monthly: 290,
    yearly: 232,
  },
  {
    id: "crescimento",
    name: "Crescimento",
    description: "Inclui Meta Ads + Social + Contratos. Recomendado.",
    monthly: 690,
    yearly: 552,
    recommended: true,
  },
  {
    id: "escala",
    name: "Escala",
    description: "Tudo + SDR de voz IA + faixa alta de mídia.",
    monthly: 1490,
    yearly: 1192,
  },
];

export type FeatureCategory = "crm" | "marketing" | "ads" | "voice" | "contracts" | "limits";

export interface FeatureRow {
  id: string;
  label: string;
  category: FeatureCategory;
  /** Valor por plano: true = incluso, false = não, string/number = limite/quantidade. */
  values: Record<PlanId, boolean | string | number>;
  hint?: string;
}

export const FEATURES: FeatureRow[] = [
  // CRM
  { id: "pipeline", label: "Pipeline visual (Kanban)", category: "crm", values: { operacao: true, crescimento: true, escala: true } },
  { id: "contacts", label: "Contatos e empresas ilimitados", category: "crm", values: { operacao: true, crescimento: true, escala: true } },
  { id: "activities", label: "Atividades + automações", category: "crm", values: { operacao: true, crescimento: true, escala: true } },
  { id: "import_export", label: "Import/Export CSV", category: "crm", values: { operacao: true, crescimento: true, escala: true } },

  // Marketing
  { id: "landing_pages", label: "Landing pages", category: "marketing", values: { operacao: "3 LPs", crescimento: "20 LPs", escala: "Ilimitado" } },
  { id: "forms", label: "Formulários", category: "marketing", values: { operacao: true, crescimento: true, escala: true } },
  { id: "email_marketing", label: "Email marketing", category: "marketing", values: { operacao: "500/mês", crescimento: "5 k/mês", escala: "50 k/mês" } },
  { id: "social_media", label: "Social media (calendário + publicação)", category: "marketing", values: { operacao: false, crescimento: true, escala: true } },

  // Ads
  { id: "meta_ads", label: "Meta Ads com IA generativa", category: "ads", values: { operacao: false, crescimento: true, escala: true } },
  { id: "media_tier", label: "Faixa de mídia inclusa", category: "ads", values: { operacao: "até R$ 600/mês", crescimento: "até R$ 5 k/mês", escala: "até R$ 30 k/mês" } },
  { id: "optimizer", label: "Otimizador IA (ciclo 48h)", category: "ads", values: { operacao: false, crescimento: true, escala: true } },
  { id: "creative_gen", label: "Geração de criativos IA", category: "ads", values: { operacao: false, crescimento: "20/mês", escala: "200/mês" } },

  // Voz IA
  { id: "sdr_voice", label: "SDR + Agente de Voz IA", category: "voice", values: { operacao: false, crescimento: false, escala: true } },
  { id: "call_minutes", label: "Minutos de IA inclusos", category: "voice", values: { operacao: "—", crescimento: "—", escala: "500 min/mês" } },

  // Contratos
  { id: "contracts", label: "Contratos + assinatura eletrônica", category: "contracts", values: { operacao: false, crescimento: true, escala: true } },
  { id: "audit_trail", label: "Trilha de auditoria + hash SHA-256", category: "contracts", values: { operacao: false, crescimento: true, escala: true } },

  // Limites
  { id: "users", label: "Usuários inclusos", category: "limits", values: { operacao: 3, crescimento: 10, escala: "Ilimitado" } },
  { id: "workspaces", label: "Workspaces", category: "limits", values: { operacao: 1, crescimento: 1, escala: 3 } },
];

export const CATEGORY_LABELS: Record<FeatureCategory, string> = {
  crm: "CRM",
  marketing: "Marketing",
  ads: "Tráfego pago",
  voice: "SDR + Voz IA",
  contracts: "Contratos",
  limits: "Limites",
};
