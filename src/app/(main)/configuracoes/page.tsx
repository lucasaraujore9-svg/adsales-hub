import Link from "next/link";
import {
  Building2,
  CreditCard,
  FileSignature,
  Globe,
  Headphones,
  Image as ImageIcon,
  Key,
  Mail,
  MessageCircle,
  Palette,
  Phone,
  Plug,
  ShieldCheck,
  Target,
  Users,
  Webhook,
  Workflow,
  Sparkles,
  FileText,
  AlertTriangle,
  PhoneCall,
  CalendarClock,
  Languages,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata = { title: "Configuracoes · AdSales Hub" };

interface Item {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: { label: string; tone: "good" | "warn" | "bad" | "accent" | "neutral" };
}

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Conta e empresa",
    items: [
      { href: "/configuracoes/perfil", label: "Meu perfil", description: "Nome, avatar, senha, preferencias", icon: Users },
      { href: "/configuracoes/empresa", label: "Dados da empresa", description: "CNPJ, endereco, razao social", icon: Building2 },
      { href: "/configuracoes/marca", label: "Marca", description: "Accent color, logo, white-label", icon: Palette },
      { href: "/configuracoes/usuários", label: "Usuarios e permissoes", description: "Admin, gestor, vendedor, media buyer, visualizador", icon: ShieldCheck },
      { href: "/configuracoes/billing", label: "Plano e faturamento", description: "Cesta atual, faturas, dados de pagamento", icon: CreditCard, badge: { label: "Trial 14d", tone: "accent" } },
    ],
  },
  {
    title: "CRM",
    items: [
      { href: "/configuracoes/campos", label: "Campos customizados", description: "Deals, contatos, empresas, atividades", icon: FileText },
      { href: "/configuracoes/importar", label: "Importar", description: "Planilhas, CSV, Pipedrive, HubSpot", icon: Plug },
      { href: "/configuracoes/produtos", label: "Produtos e precos", description: "Catalogo para propostas", icon: Target },
      { href: "/configuracoes/motivos-perda", label: "Motivos de perda", description: "Classificacao de deals perdidos", icon: AlertTriangle },
      { href: "/configuracoes/duplicatas", label: "Duplicatas", description: "Deteccao e merge de contatos", icon: Users },
    ],
  },
  {
    title: "Comunicacao",
    items: [
      { href: "/configuracoes/sequencias", label: "Sequencias", description: "Cadencias de follow-up CRM + marketing", icon: Workflow },
      { href: "/configuracoes/email-templates", label: "Email templates", description: "Transacionais + marketing", icon: Mail },
      { href: "/configuracoes/whatsapp-templates", label: "WhatsApp templates", description: "Templates aprovados pela Meta", icon: MessageCircle },
      { href: "/configuracoes/scripts-ligacao", label: "Scripts de ligacao", description: "Roteiros para time de vendas", icon: PhoneCall },
    ],
  },
  {
    title: "Marketing",
    items: [
      { href: "/configuracoes/meta-ads", label: "Meta Ads", description: "Conta conectada, pixel, Conversions API", icon: Target, badge: { label: "Conectado", tone: "good" } },
      { href: "/configuracoes/pixel", label: "Pixel e tracking", description: "Meta Pixel + GA4 + GTM", icon: Sparkles },
      { href: "/configuracoes/ia-ciclo", label: "Motor de IA", description: "Nivel de automação do otimizador", icon: Workflow },
      { href: "/configuracoes/dominio", label: "Dominio custom", description: "Hospedar landing pages em lp.seu-dominio", icon: Globe },
      { href: "/configuracoes/social", label: "Redes sociais", description: "Conectar Instagram, Facebook, LinkedIn, TikTok, YouTube", icon: ImageIcon },
    ],
  },
  {
    title: "Relatorios e IA",
    items: [
      { href: "/configuracoes/relatorios", label: "Relatorios", description: "Branding white-label dos PDFs", icon: Palette },
      { href: "/configuracoes/ia", label: "IA (geral)", description: "Preferencias de modelo, custos, limites", icon: Sparkles },
    ],
  },
  {
    title: "SDR + Contratos",
    items: [
      { href: "/configuracoes/sdr-ia", label: "SDR + Agente de voz IA", description: "Script, voz, horarios, número BR", icon: Headphones },
      { href: "/configuracoes/contratos", label: "Contratos", description: "Templates de proposta e contrato", icon: FileSignature },
    ],
  },
  {
    title: "Canais conectados",
    items: [
      { href: "/configuracoes/whatsapp", label: "WhatsApp Cloud API", description: "Phone number, token, webhook", icon: MessageCircle, badge: { label: "Conectado", tone: "good" } },
      { href: "/configuracoes/gmail", label: "Gmail / SMTP", description: "Envio de emails do time comercial", icon: Mail },
      { href: "/configuracoes/telefone", label: "Telefonia", description: "Motor de voz IA + número DID BR", icon: Phone },
      { href: "/configuracoes/calendario", label: "Calendario", description: "Google Calendar, Outlook, iCal", icon: CalendarClock },
    ],
  },
  {
    title: "Avancado",
    items: [
      { href: "/configuracoes/integracoes", label: "Integracoes", description: "Zapier, n8n, Make, custom webhooks", icon: Plug },
      { href: "/configuracoes/api", label: "API keys", description: "Tokens publicos e privados", icon: Key },
      { href: "/configuracoes/webhooks", label: "Webhooks", description: "Eventos para sistemas externos", icon: Webhook },
    ],
  },
];

export default function SettingsIndexPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PageHeader
        kicker="Workspace"
        title="Configuracoes"
        description="Tudo que você precisa para personalizar, integrar e escalar."
      />

      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-[11px] font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-start gap-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4 transition-colors hover:border-[color:var(--line-3)]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[color:var(--bg-2)] text-[color:var(--ink-3)] group-hover:bg-[color:var(--accent)]/10 group-hover:text-[color:var(--accent)]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.label}</span>
                        {item.badge && <StatusBadge label={item.badge.label} tone={item.badge.tone} />}
                      </div>
                      <p className="mt-0.5 text-xs text-[color:var(--ink-3)]">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
