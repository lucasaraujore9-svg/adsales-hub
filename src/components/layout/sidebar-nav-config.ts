import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Kanban,
  Users,
  CheckSquare,
  Inbox,
  Megaphone,
  BarChart3,
  Target,
  Image as ImageIcon,
  Sparkles,
  Globe,
  FileText,
  Mail,
  Share2,
  LineChart,
  FileBarChart,
  BrainCircuit,
  Phone,
  Workflow,
  Search,
  Settings,
  FileSignature,
  Headphones,
  CalendarClock,
  Send,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Module slug required to unlock this item. null means CRM-only (always). */
  module?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "CRM",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Caixa de entrada", href: "/inbox", icon: Inbox },
      { label: "Pipeline", href: "/pipeline", icon: Kanban },
      { label: "Contatos", href: "/contatos", icon: Users },
      { label: "Atividades", href: "/atividades", icon: CheckSquare },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Campanhas", href: "/campanhas", icon: Megaphone, module: "ads" },
      { label: "Performance", href: "/campanhas/performance", icon: BarChart3, module: "ads" },
      { label: "Publicos", href: "/campanhas/publicos", icon: Target, module: "ads" },
      { label: "Criativos", href: "/campanhas/criativos", icon: ImageIcon, module: "ads" },
      { label: "Otimizador IA", href: "/campanhas/otimizador", icon: Sparkles, module: "ads" },
    ],
  },
  {
    label: "Conteudo",
    items: [
      { label: "Landing Pages", href: "/marketing/landing-pages", icon: Globe, module: "site" },
      { label: "Formularios", href: "/marketing/formularios", icon: FileText, module: "site" },
      { label: "Email Marketing", href: "/marketing/emails", icon: Mail, module: "msg" },
      { label: "Social Media", href: "/social", icon: Share2, module: "social" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { label: "Analytics", href: "/analytics", icon: LineChart, module: "bi" },
      { label: "Relatorios", href: "/relatorios", icon: FileBarChart, module: "bi" },
      { label: "Analise IA", href: "/analise", icon: BrainCircuit, module: "bi" },
    ],
  },
  {
    label: "Vendas",
    items: [
      { label: "Ligacoes", href: "/ligacoes", icon: Phone },
      { label: "Metas", href: "/metas", icon: Target },
      { label: "Automacoes", href: "/automacoes", icon: Workflow },
      { label: "Prospeccao", href: "/prospeccao", icon: Search },
      { label: "SDR IA", href: "/prospeccao/sdr-ia", icon: Headphones, module: "sdr" },
      { label: "Analise Calls", href: "/analise-calls", icon: CalendarClock },
      { label: "Contratos", href: "/contratos", icon: FileSignature, module: "sign" },
    ],
  },
];

export const FOOTER_NAV: NavItem[] = [
  { label: "Configuracoes", href: "/configuracoes", icon: Settings },
];

export const MODULE_LABELS: Record<string, string> = {
  crm: "CRM",
  ads: "Trafego Pago IA",
  social: "Social Media",
  msg: "Mensagens",
  sdr: "SDR IA",
  bi: "BI / Analytics",
  site: "Landing Pages",
  sign: "Contratos",
};
export { Send };
