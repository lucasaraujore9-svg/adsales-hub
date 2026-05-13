export interface MockContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  company: string | null;
  position: string;
  lifecycle: "lead" | "mql" | "sql" | "opportunity" | "customer" | "lost";
  source: "meta_ads" | "google_ads" | "organic" | "referral" | "prospecting" | "website";
  utm: { source: string; medium: string; campaign: string } | null;
  owner: string;
  lastContactedAt: string;
  tags: string[];
}

export interface MockDeal {
  id: string;
  title: string;
  value: number;
  currency: "BRL";
  stage: "qualificacao" | "proposta" | "negociacao" | "fechamento" | "perdido";
  status: "open" | "won" | "lost";
  contactId: string;
  company: string | null;
  owner: string;
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  stageEnteredAt: string;
  source: MockContact["source"];
  lossReason?: string;
  tags: string[];
}

export interface MockActivity {
  id: string;
  type: "call" | "email" | "whatsapp" | "meeting" | "task" | "note";
  title: string;
  dealId?: string;
  contactId?: string;
  dueDate: string; // ISO
  completed: boolean;
  outcome?: string;
  owner: string;
}

export const OWNERS = [
  { id: "u1", name: "Ana Julia", avatar: "AJ", color: "#FF5E1A" },
  { id: "u2", name: "Bruno Costa", avatar: "BC", color: "#3B82F6" },
  { id: "u3", name: "Carla Mendes", avatar: "CM", color: "#10B981" },
  { id: "u4", name: "Diego Ramos", avatar: "DR", color: "#A855F7" },
];

export const STAGES = [
  { id: "qualificacao", label: "Qualificacao", probability: 10, color: "#6366F1" },
  { id: "proposta", label: "Proposta", probability: 40, color: "#F59E0B" },
  { id: "negociacao", label: "Negociacao", probability: 70, color: "#FF5E1A" },
  { id: "fechamento", label: "Fechamento", probability: 90, color: "#10B981" },
  { id: "perdido", label: "Perdido", probability: 0, color: "#EF4444" },
] as const;

export const SOURCE_LABELS: Record<MockContact["source"], string> = {
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  organic: "Organico",
  referral: "Indicacao",
  prospecting: "Prospeccao",
  website: "Site",
};

export const LIFECYCLE_LABELS: Record<MockContact["lifecycle"], string> = {
  lead: "Lead",
  mql: "MQL",
  sql: "SQL",
  opportunity: "Oportunidade",
  customer: "Cliente",
  lost: "Perdido",
};

const TAG_POOL = ["B2B", "Quente", "Retorno", "Upsell", "Trial", "Parceiro", "Conta estrategica"];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seededRandom(42);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!;

const FIRST_NAMES = [
  "Joao", "Maria", "Pedro", "Ana", "Lucas", "Julia", "Carlos",
  "Fernanda", "Roberto", "Beatriz", "Gabriel", "Larissa", "Thiago",
  "Camila", "Rafael", "Isabela", "Guilherme", "Patricia",
];
const LAST_NAMES = [
  "Silva", "Santos", "Souza", "Costa", "Pereira", "Rocha", "Lima",
  "Almeida", "Nunes", "Alves", "Gomes", "Barbosa", "Mendes", "Araujo",
];
const COMPANIES = [
  "Acme Corp", "Globex", "Initech", "Umbrella", "Hooli", "Vehement",
  "Pied Piper", "Stark Industries", "Wayne Enterprises", "Cyberdyne",
  "Aperture", "Soylent", null, null,
];
const POSITIONS = [
  "CEO", "CFO", "CMO", "Diretor Comercial", "Gerente de Marketing",
  "Head de Growth", "Fundador", "Socio", "Consultor",
];

function genPhone(i: number): string {
  const suffix = String(10000 + i).slice(-4);
  return `+5511 9${String(rand() * 10000 | 0).padStart(4, "0")}-${suffix}`;
}

export const MOCK_CONTACTS: MockContact[] = Array.from({ length: 28 }).map((_, i) => {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const company = pick(COMPANIES);
  const source = pick(["meta_ads", "meta_ads", "organic", "referral", "google_ads", "prospecting", "website"] as const);
  const tags = rand() > 0.5 ? [pick(TAG_POOL), ...(rand() > 0.7 ? [pick(TAG_POOL)] : [])] : [];
  const phone = genPhone(i);
  return {
    id: `c${i + 1}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@${(company ?? "gmail.com").toLowerCase().replace(/\s+/g, "")}.com`,
    phone,
    whatsapp: phone,
    company,
    position: pick(POSITIONS),
    lifecycle: pick(["lead", "mql", "mql", "sql", "sql", "opportunity", "customer", "lost"] as const),
    source,
    utm: source.endsWith("_ads")
      ? {
          source: source === "meta_ads" ? "facebook" : "google",
          medium: "cpc",
          campaign: pick(["lead-gen-q2", "retargeting", "prospecting-sdr", "brand-pt-br"]),
        }
      : null,
    owner: pick(OWNERS).id,
    lastContactedAt: new Date(Date.now() - rand() * 45 * 864e5).toISOString(),
    tags: Array.from(new Set(tags)),
  };
});

export const MOCK_DEALS: MockDeal[] = Array.from({ length: 22 }).map((_, i) => {
  const contact = pick(MOCK_CONTACTS);
  const stage = pick(["qualificacao", "qualificacao", "proposta", "proposta", "negociacao", "fechamento", "perdido"] as const);
  const status: MockDeal["status"] = stage === "perdido" ? "lost" : stage === "fechamento" && rand() > 0.6 ? "won" : "open";
  const value = Math.round((rand() * 150 + 5) * 100) * 10;
  const stageMeta = STAGES.find((s) => s.id === stage)!;
  return {
    id: `d${i + 1}`,
    title: `${contact.company ?? contact.name} — ${pick(["Plano Anual", "Implantacao", "POC 3m", "Expansao", "Retoque", "Consultoria"])}`,
    value,
    currency: "BRL",
    stage,
    status,
    contactId: contact.id,
    company: contact.company,
    owner: contact.owner,
    probability: stageMeta.probability,
    expectedCloseDate: new Date(Date.now() + (rand() * 60 - 10) * 864e5).toISOString(),
    createdAt: new Date(Date.now() - rand() * 90 * 864e5).toISOString(),
    stageEnteredAt: new Date(Date.now() - rand() * 20 * 864e5).toISOString(),
    source: contact.source,
    lossReason: status === "lost" ? pick(["Preco alto", "Concorrencia", "Timing", "Sem orcamento"]) : undefined,
    tags: contact.tags,
  };
});

const ACTIVITY_TITLES: Record<MockActivity["type"], string[]> = {
  call: ["Ligar para follow-up", "Ligacao de qualificacao", "Confirmar reuniao por telefone"],
  email: ["Enviar proposta", "Enviar material de apoio", "Resposta a pergunta tecnica"],
  whatsapp: ["Mensagem de bom dia", "Confirmar recebimento", "Enviar video explicativo"],
  meeting: ["Reuniao de apresentacao", "Demo tecnica", "Kick-off do projeto"],
  task: ["Atualizar CRM", "Preparar deck", "Enviar contrato"],
  note: ["Anotacao sobre call", "Resumo de reuniao"],
};

export const MOCK_ACTIVITIES: MockActivity[] = Array.from({ length: 34 }).map((_, i) => {
  const deal = rand() > 0.25 ? pick(MOCK_DEALS) : null;
  const type = pick(["call", "email", "whatsapp", "meeting", "task", "note"] as const);
  const hoursOffset = (rand() * 14 - 3) * 24;
  return {
    id: `a${i + 1}`,
    type,
    title: pick(ACTIVITY_TITLES[type]),
    dealId: deal?.id,
    contactId: deal?.contactId ?? pick(MOCK_CONTACTS).id,
    dueDate: new Date(Date.now() + hoursOffset * 36e5).toISOString(),
    completed: hoursOffset < 0 && rand() > 0.35,
    outcome: hoursOffset < 0 && rand() > 0.5 ? pick(["Avancou", "Sem resposta", "Reagendou", "Objecao: preco"]) : undefined,
    owner: pick(OWNERS).id,
  };
});

export function formatCurrencyBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = d.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const minutes = Math.round(abs / 60000);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const suffix = diffMs >= 0 ? "" : " atras";
  const prefix = diffMs >= 0 ? "em " : "";
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${prefix}${minutes}min${suffix}`;
  if (hours < 24) return `${prefix}${hours}h${suffix}`;
  if (days < 30) return `${prefix}${days}d${suffix}`;
  return d.toLocaleDateString("pt-BR");
}

export function ownerById(id: string) {
  return OWNERS.find((o) => o.id === id) ?? OWNERS[0]!;
}
export function contactById(id: string) {
  return MOCK_CONTACTS.find((c) => c.id === id);
}
export function dealById(id: string) {
  return MOCK_DEALS.find((d) => d.id === id);
}
