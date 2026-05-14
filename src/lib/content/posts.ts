export type PostCategory =
  | "Comparativos"
  | "Calculadoras"
  | "Guias"
  | "Glossário"
  | "Para sua empresa";

export interface Clickbait {
  /** Headline curto, em CAPS (3-7 palavras). Aparece gigante na thumb. */
  hook: string;
  /** Palavra(s) que ficam destacadas em amarelo dentro do hook. Match exato (case sensitive). */
  highlight?: string;
  /** Badge/sticker pequeno (ex: "−R$ 50K/ANO", "EXPOSTO", "ALERTA"). */
  sticker?: string;
  /** Tom da thumb: red (alerta), yellow (atenção), orange (acao), dark (exposed). */
  accent?: "red" | "yellow" | "orange" | "dark";
}

export interface Post {
  slug: string;
  href: string;
  title: string;
  description: string;
  category: PostCategory;
  readingMinutes: number;
  publishedAt: string;
  featured?: boolean;
  clickbait: Clickbait;
}

/** Returns the URL for the programmatic OG image of a post (clickbait thumb). */
export function postCoverUrl(post: Pick<Post, "title" | "category" | "clickbait">): string {
  const params = new URLSearchParams({
    hook: post.clickbait.hook,
    category: post.category,
  });
  if (post.clickbait.highlight) params.set("highlight", post.clickbait.highlight);
  if (post.clickbait.sticker) params.set("sticker", post.clickbait.sticker);
  if (post.clickbait.accent) params.set("accent", post.clickbait.accent);
  return `/api/og?${params.toString()}`;
}

export const POSTS: Post[] = [
  // Comparativos
  {
    slug: "rd-station",
    href: "/comparativos/rd-station",
    title: "AdSales·Hub vs RD Station: qual escolher em 2026",
    description:
      "Comparativo direto entre AdSales·Hub e RD Station — módulos, preços em reais, atribuição e quando cada um faz sentido pra PMEs brasileiras.",
    category: "Comparativos",
    readingMinutes: 7,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "RD STATION TÁ TE COBRANDO 3X A MAIS",
      highlight: "3X A MAIS",
      sticker: "−R$ 50K/ANO",
      accent: "red",
    },
  },
  {
    slug: "pipedrive",
    href: "/comparativos/pipedrive",
    title: "AdSales·Hub vs Pipedrive: pipeline puro ou operação completa?",
    description:
      "Pipedrive é referência em pipeline visual. AdSales·Hub adiciona tráfego pago, SDR de voz IA, atendimento e contratos.",
    category: "Comparativos",
    readingMinutes: 6,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "PIPEDRIVE EM DÓLAR? VOCÊ TÁ PERDENDO",
      highlight: "EM DÓLAR",
      sticker: "R$ 4.670/MÊS",
      accent: "yellow",
    },
  },
  {
    slug: "hubspot",
    href: "/comparativos/hubspot",
    title: "AdSales·Hub vs HubSpot: a alternativa brasileira em 2026",
    description:
      "HubSpot tem suíte global madura mas cobra em USD com saltos enterprise. AdSales·Hub entrega operação equivalente em reais com SDR de voz IA nativo.",
    category: "Comparativos",
    readingMinutes: 8,
    publishedAt: "2026-05-01",
    featured: true,
    clickbait: {
      hook: "FATURA HUBSPOT: R$ 26.100 NUM MÊS",
      highlight: "R$ 26.100",
      sticker: "EM DÓLAR!",
      accent: "red",
    },
  },
  {
    slug: "kommo",
    href: "/comparativos/kommo",
    title: "AdSales·Hub vs Kommo: WhatsApp-first ou operação completa?",
    description:
      "Kommo virou queridinho de quem vende por WhatsApp. AdSales·Hub também é WhatsApp-nativo, mas vai do anúncio à venda fechada num sistema só.",
    category: "Comparativos",
    readingMinutes: 6,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "KOMMO TRAVA SUA OPERAÇÃO NO WHATSAPP",
      highlight: "TRAVA",
      sticker: "ALÉM DO CHAT",
      accent: "orange",
    },
  },

  // Calculadoras
  {
    slug: "roas",
    href: "/calculadoras/roas",
    title: "Calculadora de ROAS — Retorno sobre Investimento em Anúncios",
    description:
      "Calcule o ROAS da sua campanha em segundos. Descubra se cada real investido em mídia paga está voltando em receita.",
    category: "Calculadoras",
    readingMinutes: 5,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "QUANTO O ANÚNCIO ESTÁ TRAZENDO DE VOLTA?",
      highlight: "DE VOLTA",
      sticker: "CALCULE GRÁTIS",
      accent: "red",
    },
  },
  {
    slug: "cac",
    href: "/calculadoras/cac",
    title: "Calculadora de CAC — Custo de Aquisição por Cliente",
    description:
      "Quanto custa pra você adquirir cada cliente novo? Cálculo com investimento de mídia + custos de equipe + ferramentas.",
    category: "Calculadoras",
    readingMinutes: 5,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "VOCÊ PAGA R$ 380 POR CADA CLIENTE NOVO",
      highlight: "R$ 380",
      sticker: "VEJA O REAL",
      accent: "yellow",
    },
  },
  {
    slug: "ltv-cac",
    href: "/calculadoras/ltv-cac",
    title: "LTV/CAC e Payback — saúde financeira do seu funil",
    description:
      "LTV/CAC mostra se seu negócio é saudável. Payback mostra em quantos meses o investimento volta.",
    category: "Calculadoras",
    readingMinutes: 5,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "SEU NEGÓCIO TÁ QUEBRANDO E VOCÊ NÃO SABE",
      highlight: "QUEBRANDO",
      sticker: "ALERTA",
      accent: "red",
    },
  },
  {
    slug: "cpl-ideal",
    href: "/calculadoras/cpl-ideal",
    title: "Calculadora de CPL ideal — quanto pagar por lead",
    description:
      "Quanto você pode pagar por lead pra fechar no positivo? Calcule o CPL máximo a partir do ticket, margem e taxa de conversão.",
    category: "Calculadoras",
    readingMinutes: 4,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "QUANTO VOCÊ PODE PAGAR POR CONTATO?",
      highlight: "POR CONTATO",
      sticker: "CALCULE",
      accent: "orange",
    },
  },

  // Guias
  {
    slug: "como-migrar-do-rd-station",
    href: "/guias/como-migrar-do-rd-station",
    title: "Como migrar do RD Station: guia passo a passo (2026)",
    description:
      "Plano de migração do RD Station pro AdSales·Hub em 7 dias com zero downtime: export, mapeamento, teste, go-live e validação.",
    category: "Guias",
    readingMinutes: 9,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "TROQUE O RD EM 7 DIAS SEM PARAR",
      highlight: "7 DIAS",
      sticker: "PASSO A PASSO",
      accent: "orange",
    },
  },
  {
    slug: "como-criar-campanha-no-meta-ads",
    href: "/guias/como-criar-campanha-no-meta-ads",
    title: "Como criar campanha no Meta Ads — passo a passo 2026",
    description:
      "Guia completo: do briefing à campanha publicada no Facebook e Instagram. Estrutura, criativos, públicos, lance e otimização contínua.",
    category: "Guias",
    readingMinutes: 11,
    publishedAt: "2026-05-01",
    featured: true,
    clickbait: {
      hook: "AGÊNCIA COBRA R$ 8K. VOCÊ FAZ EM 30MIN",
      highlight: "30MIN",
      sticker: "SEM AGÊNCIA",
      accent: "red",
    },
  },
  {
    slug: "quanto-custa-marketing-digital-pme",
    href: "/guias/quanto-custa-marketing-digital-pme",
    title: "Quanto custa marketing digital pra PME em 2026 — números reais",
    description:
      "Faixas reais de investimento em marketing digital pra PME brasileira: agência vs internalizado, mídia, ferramentas e ROI esperado.",
    category: "Guias",
    readingMinutes: 10,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "EMPRESAS GASTAM R$ 28 MIL — 40% NO LIXO",
      highlight: "40% NO LIXO",
      sticker: "VEJA ONDE",
      accent: "yellow",
    },
  },
  {
    slug: "como-demitir-agencia-sem-perder-resultado",
    href: "/guias/como-demitir-agencia-sem-perder-resultado",
    title: "Como demitir agência sem perder resultado — plano 60 dias",
    description:
      "Plano de transição em 60 dias pra internalizar marketing sem queda de pipeline: período paralelo, transferência de assets e go-live.",
    category: "Guias",
    readingMinutes: 8,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "DEMITA SUA AGÊNCIA: ECONOMIZE R$ 50K/ANO",
      highlight: "R$ 50K/ANO",
      sticker: "PLANO 60 DIAS",
      accent: "red",
    },
  },

  // Glossário
  {
    slug: "crm",
    href: "/glossario/crm",
    title: "O que é CRM — definição, exemplos e quando vale ter",
    description:
      "CRM (Customer Relationship Management) explicado pra PME brasileira: o que é, pra que serve e os 3 tipos principais.",
    category: "Glossário",
    readingMinutes: 5,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "PLANILHA NÃO É CRM E ESTÁ TE FAZENDO PERDER VENDA",
      highlight: "PERDER VENDA",
      sticker: "ATENÇÃO",
      accent: "dark",
    },
  },
  {
    slug: "roas-glossario",
    href: "/glossario/roas",
    title: "O que é ROAS — fórmula, exemplos e benchmarks 2026",
    description:
      "ROAS (Return on Ad Spend) explicado: fórmula simples, ROAS bom por modelo de negócio, e por que o ROAS da plataforma frequentemente mente.",
    category: "Glossário",
    readingMinutes: 4,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "O NÚMERO DO META ESTÁ INFLADO 50%",
      highlight: "INFLADO 50%",
      sticker: "EXPOSTO",
      accent: "red",
    },
  },
  {
    slug: "cac-glossario",
    href: "/glossario/cac",
    title: "O que é CAC — Custo de Aquisição por Cliente explicado",
    description:
      "CAC define se sua operação é sustentável. Definição, fórmula completa, benchmarks brasileiros e como reduzir sem cortar mídia.",
    category: "Glossário",
    readingMinutes: 5,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "QUANTO CADA CLIENTE NOVO TE CUSTA?",
      highlight: "TE CUSTA?",
      sticker: "MAIORIA ERRA",
      accent: "yellow",
    },
  },
  {
    slug: "atribuição",
    href: "/glossario/atribuição",
    title: "O que é atribuição de marketing — modelos e como escolher",
    description:
      "First-touch, last-touch, multi-touch, data-driven. Modelos de atribuição explicados, com qual usar pro seu negócio.",
    category: "Glossário",
    readingMinutes: 6,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "META E GOOGLE COBRAM A MESMA VENDA",
      highlight: "MESMA VENDA",
      sticker: "DUPLICADO",
      accent: "orange",
    },
  },
  {
    slug: "sdr",
    href: "/glossario/sdr",
    title: "O que é SDR — função, métricas e quando vale ter",
    description:
      "SDR (Sales Development Representative) explicado: o que faz, quanto custa, métricas de performance e humano vs IA.",
    category: "Glossário",
    readingMinutes: 5,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "TROQUE O VENDEDOR DE LIGAÇÃO POR IA: R$ 220",
      highlight: "R$ 220",
      sticker: "VS R$ 6.500",
      accent: "red",
    },
  },
  {
    slug: "trafego-pago",
    href: "/glossario/trafego-pago",
    title: "O que é tráfego pago — guia 2026 (Meta, Google, TikTok)",
    description:
      "Tráfego pago explicado pra quem nunca rodou anúncio: como funciona, quanto custa começar, quais plataformas e como evitar queimar dinheiro.",
    category: "Glossário",
    readingMinutes: 7,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "ORGÂNICO MORREU. ALCANCE NO IG: 2%",
      highlight: "MORREU",
      sticker: "REALIDADE 2026",
      accent: "dark",
    },
  },

  // Personas
  {
    slug: "agencias",
    href: "/para/agencias",
    title: "AdSales·Hub para agências de marketing — escala sem aumentar time",
    description:
      "Plataforma white-label pra agências operarem 30+ clientes com 3 pessoas. Workspace por cliente, branding customizável, relatórios automáticos.",
    category: "Para sua empresa",
    readingMinutes: 5,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "OPERA 30 CLIENTES COM 3 PESSOAS",
      highlight: "3 PESSOAS",
      sticker: "MARGEM 41%",
      accent: "orange",
    },
  },
  {
    slug: "ecommerce",
    href: "/para/ecommerce",
    title: "AdSales·Hub para e-commerce — ROAS por SKU e abandono recuperado",
    description:
      "Atribua receita por SKU, recupere carrinho abandonado via WhatsApp, sequencia pós-compra. Tudo conectado ao Meta Conversions API.",
    category: "Para sua empresa",
    readingMinutes: 4,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "O ANÚNCIO RENDE METADE DO QUE O META MOSTRA",
      highlight: "METADE",
      sticker: "EXPOSTO",
      accent: "red",
    },
  },
  {
    slug: "educacao",
    href: "/para/educacao",
    title: "AdSales·Hub para educação e cursos online — captação à matrícula",
    description:
      "Captação de aluno → qualificação por voz IA → reunião com consultor → matrícula com contrato eletrônico. Tudo num sistema só.",
    category: "Para sua empresa",
    readingMinutes: 5,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "VOCÊ PERDE MATRÍCULA POR DEMORAR PRA RESPONDER",
      highlight: "DEMORAR",
      sticker: "12H DE ATRASO",
      accent: "yellow",
    },
  },
  {
    slug: "prestadores-de-servico",
    href: "/para/prestadores-de-servico",
    title: "AdSales·Hub para prestadores de serviço — lead à proposta",
    description:
      "Advogados, consultores, dentistas, arquitetos: do anúncio à proposta assinada num sistema só. Lead → reunião → contrato.",
    category: "Para sua empresa",
    readingMinutes: 5,
    publishedAt: "2026-05-01",
    clickbait: {
      hook: "ADVOGADO PERDE LEAD EM 40 SEGUNDOS",
      highlight: "40 SEGUNDOS",
      sticker: "NUNCA LIGOU?",
      accent: "red",
    },
  },
];

export const CATEGORY_DESCRIPTIONS: Record<PostCategory, string> = {
  Comparativos:
    "AdSales·Hub lado a lado com as principais alternativas do mercado brasileiro e global.",
  Calculadoras:
    "Ferramentas grátis pra calcular ROAS, CAC, LTV/CAC e CPL ideal sem planilha.",
  Guias:
    "Tutoriais práticos com passo a passo: criar campanhas, migrar de outras ferramentas, internalizar marketing.",
  Glossário:
    "Conceitos de marketing e vendas explicados de forma direta, com fórmula e benchmark BR.",
  "Para sua empresa":
    "Casos de uso por setor e tipo de negócio: agências, e-commerce, educação, serviços.",
};

export function postsByCategory(): Record<PostCategory, Post[]> {
  return POSTS.reduce(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    },
    {} as Record<PostCategory, Post[]>,
  );
}
