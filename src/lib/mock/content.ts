export interface MockLandingPage {
  id: string;
  name: string;
  slug: string;
  template: string;
  published: boolean;
  domain: string;
  visits30d: number;
  conversions30d: number;
  conversionRate: number;
  updatedAt: string;
  abTest?: { variants: number; winner?: string };
  thumbnail: string;
}

export interface MockForm {
  id: string;
  name: string;
  fields: number;
  submissions30d: number;
  conversionRate: number;
  embedType: "landing" | "inline" | "popup";
  updatedAt: string;
}

export interface MockEmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: "draft" | "scheduled" | "sending" | "sent";
  audienceSize: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  scheduledAt?: string;
  sentAt?: string;
  createdBy: string;
}

export interface MockSocialAccount {
  id: string;
  platform: "instagram" | "facebook" | "linkedin" | "tiktok" | "youtube" | "pinterest";
  handle: string;
  followers: number;
  status: "active" | "expired";
}

export interface MockSocialPost {
  id: string;
  content: string;
  platforms: MockSocialAccount["platform"][];
  status: "idea" | "draft" | "pending_approval" | "approved" | "scheduled" | "published" | "rejected";
  scheduledAt?: string;
  publishedAt?: string;
  metrics?: {
    impressions: number;
    reach: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    engagementRate: number;
  };
  author: string;
  hashtags: string[];
  thumbnail: string;
}

export const MOCK_LANDING_PAGES: MockLandingPage[] = [
  { id: "lp_1", name: "Lead Gen SaaS PMEs", slug: "saas-pmes", template: "hero-form", published: true, domain: "lp.adsaleshub.com.br", visits30d: 12_400, conversions30d: 894, conversionRate: 7.21, updatedAt: new Date(Date.now() - 2 * 864e5).toISOString(), abTest: { variants: 2, winner: "B" }, thumbnail: "grad-1" },
  { id: "lp_2", name: "Trial 14 dias", slug: "trial-14", template: "benefits-grid", published: true, domain: "adsaleshub.com.br", visits30d: 8_400, conversions30d: 512, conversionRate: 6.10, updatedAt: new Date(Date.now() - 1 * 864e5).toISOString(), thumbnail: "grad-2" },
  { id: "lp_3", name: "Webinar Escala IA", slug: "webinar-ia", template: "webinar", published: true, domain: "eventos.adsaleshub.com.br", visits30d: 4_200, conversions30d: 812, conversionRate: 19.33, updatedAt: new Date(Date.now() - 5 * 864e5).toISOString(), abTest: { variants: 3 }, thumbnail: "grad-3" },
  { id: "lp_4", name: "E-book Meta Ads 2026", slug: "ebook-meta", template: "lead-magnet", published: false, domain: "lp.adsaleshub.com.br", visits30d: 0, conversions30d: 0, conversionRate: 0, updatedAt: new Date(Date.now() - 10 * 864e5).toISOString(), thumbnail: "grad-4" },
  { id: "lp_5", name: "Promo Black Friday", slug: "bf-2026", template: "countdown", published: false, domain: "lp.adsaleshub.com.br", visits30d: 0, conversions30d: 0, conversionRate: 0, updatedAt: new Date(Date.now() - 1 * 864e5).toISOString(), thumbnail: "grad-5" },
];

export const MOCK_FORMS: MockForm[] = [
  { id: "f_1", name: "Formulario Principal Home", fields: 5, submissions30d: 482, conversionRate: 8.2, embedType: "inline", updatedAt: new Date(Date.now() - 2 * 864e5).toISOString() },
  { id: "f_2", name: "Pop-up Exit Intent", fields: 3, submissions30d: 218, conversionRate: 12.4, embedType: "popup", updatedAt: new Date(Date.now() - 4 * 864e5).toISOString() },
  { id: "f_3", name: "Webinar Escala IA — Inscricao", fields: 4, submissions30d: 812, conversionRate: 19.3, embedType: "landing", updatedAt: new Date(Date.now() - 3 * 864e5).toISOString() },
];

export const MOCK_EMAIL_CAMPAIGNS: MockEmailCampaign[] = [
  { id: "ec_1", name: "Newsletter Q2 #4", subject: "Como escalamos R$0 -> R$120k em 60 dias", status: "sent", audienceSize: 4280, sent: 4280, delivered: 4235, opened: 1692, clicked: 384, unsubscribed: 12, openRate: 39.95, clickRate: 9.07, sentAt: new Date(Date.now() - 4 * 864e5).toISOString(), createdBy: "u1" },
  { id: "ec_2", name: "Welcome Flow — Dia 1", subject: "Bem-vindo ao AdSales Hub", status: "sent", audienceSize: 1250, sent: 1250, delivered: 1240, opened: 892, clicked: 312, unsubscribed: 4, openRate: 71.94, clickRate: 25.16, sentAt: new Date(Date.now() - 10 * 864e5).toISOString(), createdBy: "u2" },
  { id: "ec_3", name: "Black Friday Teaser", subject: "Vem ai: 50% off no primeiro trimestre", status: "scheduled", audienceSize: 12_800, sent: 0, delivered: 0, opened: 0, clicked: 0, unsubscribed: 0, openRate: 0, clickRate: 0, scheduledAt: new Date(Date.now() + 6 * 864e5).toISOString(), createdBy: "u1" },
  { id: "ec_4", name: "Reativacao — 60 dias sem login", subject: "Voltamos? Tem novidade te esperando", status: "draft", audienceSize: 840, sent: 0, delivered: 0, opened: 0, clicked: 0, unsubscribed: 0, openRate: 0, clickRate: 0, createdBy: "u3" },
];

export const MOCK_SOCIAL_ACCOUNTS: MockSocialAccount[] = [
  { id: "sa_1", platform: "instagram", handle: "@adsaleshub", followers: 12_400, status: "active" },
  { id: "sa_2", platform: "facebook", handle: "AdSales Hub", followers: 4_200, status: "active" },
  { id: "sa_3", platform: "linkedin", handle: "AdSales Hub", followers: 8_900, status: "active" },
  { id: "sa_4", platform: "tiktok", handle: "@adsaleshub", followers: 2_100, status: "active" },
  { id: "sa_5", platform: "youtube", handle: "AdSales Hub", followers: 1_450, status: "expired" },
];

export const MOCK_SOCIAL_POSTS: MockSocialPost[] = [
  {
    id: "sp_1",
    content: "A diferenca entre uma agencia e um sistema que pensa por voce? A IA nao tira ferias. Rodamos R$180k em 30 dias, 100% automatizado.",
    platforms: ["instagram", "linkedin"],
    status: "published",
    publishedAt: new Date(Date.now() - 3 * 864e5).toISOString(),
    metrics: { impressions: 12_400, reach: 8_200, likes: 432, comments: 48, shares: 82, saves: 124, engagementRate: 5.7 },
    author: "u1",
    hashtags: ["#MetaAds", "#CRM", "#GrowthMarketing", "#IA"],
    thumbnail: "grad-1",
  },
  {
    id: "sp_2",
    content: "Briefing em texto → IA gera 4 ad_sets, 12 ads, 2 lead forms, copy + criativos visuais. 2 minutos. Depois aprova no celular. Vale a pena?",
    platforms: ["instagram", "facebook", "tiktok"],
    status: "scheduled",
    scheduledAt: new Date(Date.now() + 2 * 864e5).toISOString(),
    author: "u2",
    hashtags: ["#AIMarketing", "#Automation"],
    thumbnail: "grad-2",
  },
  {
    id: "sp_3",
    content: "Acabei de descobrir uma feature. Quando uma campanha da CPL 3x acima da media, a IA aqui DESATIVA sozinha. Nao espera voce acordar.",
    platforms: ["instagram", "linkedin", "facebook"],
    status: "pending_approval",
    author: "u3",
    hashtags: ["#Produto", "#Automation"],
    thumbnail: "grad-3",
  },
  {
    id: "sp_4",
    content: "Case de cliente: +412 leads em 18 dias com R$4.5k investidos. CPL R$10.92. Full funnel automatizado. Role para ver os prints.",
    platforms: ["instagram", "linkedin"],
    status: "draft",
    author: "u1",
    hashtags: ["#Case", "#ROI"],
    thumbnail: "grad-4",
  },
  {
    id: "sp_5",
    content: "Quer rodar seu trafego pago sem precisar de uma agencia? Testamos em 30+ contas e o CPL cai em media 40%. Link na bio.",
    platforms: ["instagram", "tiktok"],
    status: "idea",
    author: "u2",
    hashtags: ["#Growth"],
    thumbnail: "grad-5",
  },
];

export function platformLabel(p: MockSocialAccount["platform"]): string {
  return { instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", tiktok: "TikTok", youtube: "YouTube", pinterest: "Pinterest" }[p];
}
