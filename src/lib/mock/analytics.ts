export interface FunnelStage {
  label: string;
  value: number;
  sub?: string;
}

export interface MockInsight {
  id: string;
  area: "traffic" | "sales" | "social" | "unified";
  type: "trend" | "anomaly" | "correlation" | "forecast" | "recommendation" | "optimization";
  title: string;
  description: string;
  severity: "info" | "warning" | "opportunity" | "critical";
  suggested_action?: string;
  createdAt: string;
}

export const UNIFIED_FUNNEL: FunnelStage[] = [
  { label: "Impressoes", value: 876_100, sub: "Meta Ads 30d" },
  { label: "Cliques", value: 18_710, sub: "CTR 2.13%" },
  { label: "Visitas LP", value: 14_200, sub: "Bounce 24%" },
  { label: "Leads", value: 750, sub: "Conv LP 5.28%" },
  { label: "Oportunidades", value: 312, sub: "Conv Lead 41.6%" },
  { label: "Reunioes", value: 184, sub: "Show rate 59%" },
  { label: "Vendas", value: 58, sub: "Close 31.5%" },
];

export const MOCK_INSIGHTS: MockInsight[] = [
  {
    id: "ins_1",
    area: "unified",
    type: "correlation",
    title: "Leads vindos de 'Lookalike 1%' convertem 3.2x mais",
    description: "Nos ultimos 30 dias, leads dessa audiencia fecharam a uma taxa de 14.2% vs 4.4% da media geral. O ticket medio tambem e 22% maior.",
    severity: "opportunity",
    suggested_action: "Realocar 40% do budget de campanhas de awareness para essa audiencia lookalike.",
    createdAt: new Date(Date.now() - 12 * 36e5).toISOString(),
  },
  {
    id: "ins_2",
    area: "traffic",
    type: "anomaly",
    title: "CPL da campanha Awareness cresceu 180% em 5 dias",
    description: "De R$ 26 para R$ 72. Frequencia atingiu 4.2x (limite saudavel 2.5x). Indicios de fadiga de audiencia.",
    severity: "critical",
    suggested_action: "Pausar anuncios com frequencia > 3.5x e gerar 3 novos criativos com angulo diferente.",
    createdAt: new Date(Date.now() - 6 * 36e5).toISOString(),
  },
  {
    id: "ins_3",
    area: "sales",
    type: "trend",
    title: "Taxa de conversao SQL -> Proposta subiu 12pp no mes",
    description: "Em marco estava em 47%, agora em 59%. A melhoria coincide com a introducao do novo script de qualificacao.",
    severity: "info",
    createdAt: new Date(Date.now() - 1 * 864e5).toISOString(),
  },
  {
    id: "ins_4",
    area: "social",
    type: "recommendation",
    title: "Reels com UGC geram 3x mais engajamento",
    description: "Seus reels em 9x16 com depoimentos reais tem engagement rate medio de 7.2% vs 2.1% dos posts em feed 1x1.",
    severity: "opportunity",
    suggested_action: "Aumentar a producao para 2 reels UGC por semana.",
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
  },
  {
    id: "ins_5",
    area: "unified",
    type: "forecast",
    title: "Projecao: +38% de leads em abril mantendo budget atual",
    description: "Com base no crescimento dos ultimos 4 meses e sazonalidade Q2, esperamos ~1.040 leads em abril (vs 750 em marco).",
    severity: "info",
    createdAt: new Date(Date.now() - 3 * 864e5).toISOString(),
  },
];

export function last14DaysMetric(seed: number, amplitude = 1, base = 100): { date: string; value: number }[] {
  return Array.from({ length: 14 }).map((_, i) => {
    const t = (i / 13) * Math.PI;
    const oscillation = Math.sin(t * 3 + seed) * amplitude * 0.25;
    const upward = (i / 13) * amplitude * 0.4;
    const noise = ((Math.sin(seed + i * 7.13) + 1) / 2 - 0.5) * amplitude * 0.15;
    const value = base * (1 + upward + oscillation + noise);
    return {
      date: new Date(Date.now() - (13 - i) * 864e5).toISOString().slice(0, 10),
      value: Math.max(0, Math.round(value * 100) / 100),
    };
  });
}

export const QUICK_PROMPTS = [
  "Qual publico tem melhor ROAS nos ultimos 30 dias?",
  "Quais campanhas estao com CPL acima de R$ 20?",
  "Projete meu faturamento para o proximo trimestre",
  "Quais vendedores tem taxa de conversao acima da media?",
  "Qual post social teve mais engajamento?",
];
