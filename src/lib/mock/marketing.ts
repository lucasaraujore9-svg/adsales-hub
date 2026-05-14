export interface MockCampaign {
  id: string;
  name: string;
  objective: "lead_gen" | "traffic" | "conversions" | "engagement" | "awareness";
  status: "active" | "paused" | "ended" | "draft";
  platform: "meta" | "google" | "tiktok" | "linkedin";
  dailyBudget: number;
  totalBudget: number;
  startDate: string;
  endDate: string | null;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  leads: number;
  cpl: number;
  spend: number;
  roas: number;
  frequency: number;
  adSets: number;
  ads: number;
  createdBy: string;
  aiGenerated: boolean;
}

export interface MockAudience {
  id: string;
  name: string;
  type: "saved" | "custom" | "lookalike" | "retargeting";
  size: number;
  platform: "meta" | "google" | "tiktok";
  updatedAt: string;
  used_in_campaigns: number;
  source?: string;
}

export interface MockCreative {
  id: string;
  name: string;
  type: "image" | "video" | "carousel";
  format: "1x1" | "9x16" | "16x9" | "4x5";
  thumbnail: string;
  tags: string[];
  ctr: number;
  cpl: number;
  impressions: number;
  createdBy: string;
  aiGenerated: boolean;
  status: "active" | "archived";
}

export interface MockAiSuggestion {
  id: string;
  action: "pause_ad" | "increase_budget" | "decrease_budget" | "new_creative" | "adjust_audience";
  target: { scope: "campaign" | "ad_set" | "ad"; id: string; name: string };
  rationale: string;
  expectedImpact: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "rejected" | "applied";
  createdAt: string;
}

export const CAMPAIGN_OBJECTIVE_LABELS: Record<MockCampaign["objective"], string> = {
  lead_gen: "Captura de Leads",
  traffic: "Trafego",
  conversions: "Conversoes",
  engagement: "Engajamento",
  awareness: "Reconhecimento",
};

export const CAMPAIGN_STATUS_LABELS: Record<MockCampaign["status"], { label: string; color: string }> = {
  active: { label: "Ativa", color: "good" },
  paused: { label: "Pausada", color: "warn" },
  ended: { label: "Encerrada", color: "ink-3" },
  draft: { label: "Rascunho", color: "ink-4" },
};

export const MOCK_CAMPAIGNS: MockCampaign[] = [
  {
    id: "camp_1",
    name: "Leads Escala — Q2 2026",
    objective: "lead_gen",
    status: "active",
    platform: "meta",
    dailyBudget: 250,
    totalBudget: 7500,
    startDate: new Date(Date.now() - 18 * 864e5).toISOString(),
    endDate: new Date(Date.now() + 12 * 864e5).toISOString(),
    impressions: 284_500,
    reach: 187_200,
    clicks: 8_940,
    ctr: 3.14,
    leads: 412,
    cpl: 10.92,
    spend: 4_498.73,
    roas: 3.8,
    frequency: 1.52,
    adSets: 3,
    ads: 9,
    createdBy: "u1",
    aiGenerated: true,
  },
  {
    id: "camp_2",
    name: "Retargeting 30d — Website Visitors",
    objective: "conversions",
    status: "active",
    platform: "meta",
    dailyBudget: 120,
    totalBudget: 3600,
    startDate: new Date(Date.now() - 28 * 864e5).toISOString(),
    endDate: null,
    impressions: 95_400,
    reach: 42_800,
    clicks: 4_120,
    ctr: 4.32,
    leads: 168,
    cpl: 14.22,
    spend: 2_389.95,
    roas: 5.2,
    frequency: 2.23,
    adSets: 2,
    ads: 4,
    createdBy: "u2",
    aiGenerated: true,
  },
  {
    id: "camp_3",
    name: "Awareness Institucional — Mar",
    objective: "awareness",
    status: "paused",
    platform: "meta",
    dailyBudget: 80,
    totalBudget: 2400,
    startDate: new Date(Date.now() - 45 * 864e5).toISOString(),
    endDate: new Date(Date.now() - 3 * 864e5).toISOString(),
    impressions: 412_000,
    reach: 298_000,
    clicks: 3_240,
    ctr: 0.79,
    leads: 32,
    cpl: 72.18,
    spend: 2_309.75,
    roas: 0.8,
    frequency: 1.38,
    adSets: 2,
    ads: 5,
    createdBy: "u3",
    aiGenerated: false,
  },
  {
    id: "camp_4",
    name: "Black Friday Teaser",
    objective: "engagement",
    status: "draft",
    platform: "meta",
    dailyBudget: 0,
    totalBudget: 5000,
    startDate: new Date(Date.now() + 20 * 864e5).toISOString(),
    endDate: new Date(Date.now() + 50 * 864e5).toISOString(),
    impressions: 0,
    reach: 0,
    clicks: 0,
    ctr: 0,
    leads: 0,
    cpl: 0,
    spend: 0,
    roas: 0,
    frequency: 0,
    adSets: 2,
    ads: 3,
    createdBy: "u1",
    aiGenerated: true,
  },
  {
    id: "camp_5",
    name: "Lookalike 1% Clientes SaaS",
    objective: "lead_gen",
    status: "active",
    platform: "meta",
    dailyBudget: 180,
    totalBudget: 5400,
    startDate: new Date(Date.now() - 7 * 864e5).toISOString(),
    endDate: null,
    impressions: 84_200,
    reach: 67_500,
    clicks: 2_410,
    ctr: 2.86,
    leads: 138,
    cpl: 8.98,
    spend: 1_238.7,
    roas: 4.4,
    frequency: 1.25,
    adSets: 2,
    ads: 6,
    createdBy: "u2",
    aiGenerated: true,
  },
];

export const MOCK_AUDIENCES: MockAudience[] = [
  { id: "aud_1", name: "Clientes ativos (customer file)", type: "custom", size: 8432, platform: "meta", updatedAt: new Date(Date.now() - 12 * 36e5).toISOString(), used_in_campaigns: 2, source: "CRM export" },
  { id: "aud_2", name: "Lookalike 1% Clientes SaaS BR", type: "lookalike", size: 2_100_000, platform: "meta", updatedAt: new Date(Date.now() - 2 * 864e5).toISOString(), used_in_campaigns: 3 },
  { id: "aud_3", name: "Visitantes do site últimos 30d", type: "retargeting", size: 42_800, platform: "meta", updatedAt: new Date(Date.now() - 4 * 36e5).toISOString(), used_in_campaigns: 2, source: "Pixel Meta" },
  { id: "aud_4", name: "Gestores de Marketing BR", type: "saved", size: 820_000, platform: "meta", updatedAt: new Date(Date.now() - 6 * 864e5).toISOString(), used_in_campaigns: 1 },
  { id: "aud_5", name: "Compradores abandonaram carrinho", type: "retargeting", size: 5_640, platform: "meta", updatedAt: new Date(Date.now() - 1 * 864e5).toISOString(), used_in_campaigns: 1 },
  { id: "aud_6", name: "CEOs empresas 50-500 func", type: "saved", size: 120_000, platform: "meta", updatedAt: new Date(Date.now() - 10 * 864e5).toISOString(), used_in_campaigns: 0 },
];

export const MOCK_CREATIVES: MockCreative[] = [
  { id: "cr_1", name: "Hero Escala — Ana apresentando", type: "image", format: "1x1", thumbnail: "grad-1", tags: ["hero", "autoridade"], ctr: 3.8, cpl: 9.2, impressions: 84000, createdBy: "u1", aiGenerated: true, status: "active" },
  { id: "cr_2", name: "Reel 30s — Demo rápida", type: "video", format: "9x16", thumbnail: "grad-2", tags: ["reel", "demo"], ctr: 4.2, cpl: 7.8, impressions: 62000, createdBy: "u2", aiGenerated: true, status: "active" },
  { id: "cr_3", name: "Carrossel — 3 dores comuns", type: "carousel", format: "1x1", thumbnail: "grad-3", tags: ["carrossel", "dor"], ctr: 2.9, cpl: 12.5, impressions: 48000, createdBy: "u1", aiGenerated: false, status: "active" },
  { id: "cr_4", name: "Story UGC — depoimento", type: "video", format: "9x16", thumbnail: "grad-4", tags: ["story", "prova-social"], ctr: 5.1, cpl: 6.2, impressions: 38000, createdBy: "u3", aiGenerated: false, status: "active" },
  { id: "cr_5", name: "Banner Awareness v2", type: "image", format: "16x9", thumbnail: "grad-5", tags: ["awareness"], ctr: 1.1, cpl: 28.0, impressions: 92000, createdBy: "u2", aiGenerated: true, status: "archived" },
  { id: "cr_6", name: "Promo Black Friday teaser", type: "image", format: "4x5", thumbnail: "grad-6", tags: ["promo"], ctr: 3.4, cpl: 10.1, impressions: 0, createdBy: "u1", aiGenerated: true, status: "active" },
];

export const MOCK_AI_SUGGESTIONS: MockAiSuggestion[] = [
  {
    id: "sug_1",
    action: "increase_budget",
    target: { scope: "campaign", id: "camp_5", name: "Lookalike 1% Clientes SaaS" },
    rationale: "CPL 8.98 (30% abaixo da media) com crescimento de conversão estavel nos últimos 5 dias.",
    expectedImpact: "+32% leads/dia mantendo CPL < 12",
    priority: "high",
    status: "pending",
    createdAt: new Date(Date.now() - 3 * 36e5).toISOString(),
  },
  {
    id: "sug_2",
    action: "pause_ad",
    target: { scope: "ad", id: "ad_17", name: "Creative Hero v4 (Camp 3)" },
    rationale: "Frequencia 4.2x com CTR caindo 62% vs semana anterior — audiencia fadigada.",
    expectedImpact: "Reduz gasto em R$480/dia sem impacto em leads",
    priority: "critical",
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 36e5).toISOString(),
  },
  {
    id: "sug_3",
    action: "new_creative",
    target: { scope: "ad_set", id: "adset_22", name: "Adset Lookalike 1% BR" },
    rationale: "Todos criativos ativos com CTR decrescente. Testar novos angulos (dor, prova social, oferta).",
    expectedImpact: "CTR esperado +0.6pp nas primeiras 48h",
    priority: "medium",
    status: "pending",
    createdAt: new Date(Date.now() - 8 * 36e5).toISOString(),
  },
  {
    id: "sug_4",
    action: "adjust_audience",
    target: { scope: "ad_set", id: "adset_09", name: "Adset Awareness Mar" },
    rationale: "CPL 3.2x acima da media. Recomendado estreitar targeting para CEO/CFO 30-55 anos.",
    expectedImpact: "CPL projetado -45%",
    priority: "high",
    status: "approved",
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
  },
  {
    id: "sug_5",
    action: "decrease_budget",
    target: { scope: "campaign", id: "camp_3", name: "Awareness Institucional" },
    rationale: "ROAS 0.8 consistente por 14 dias. Reduzir budget permite realocar para campanhas com ROAS > 4.",
    expectedImpact: "Libera R$2.1k/mes sem perda de performance",
    priority: "medium",
    status: "applied",
    createdAt: new Date(Date.now() - 3 * 864e5).toISOString(),
  },
];

export function totalAdSpend(): number {
  return MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.spend, 0);
}

export function totalLeads(): number {
  return MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.leads, 0);
}

export function avgRoas(): number {
  const active = MOCK_CAMPAIGNS.filter((c) => c.spend > 0);
  return active.reduce((acc, c) => acc + c.roas * c.spend, 0) / active.reduce((acc, c) => acc + c.spend, 0);
}

export function avgCpl(): number {
  const leads = totalLeads();
  return leads > 0 ? totalAdSpend() / leads : 0;
}
