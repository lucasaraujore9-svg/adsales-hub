/**
 * Mapas de tradução de termos técnicos para português leigo.
 * Mantém valor original no banco; só altera apresentação.
 */

export function lifecycleStageLabel(value: string | null | undefined): string {
  if (!value) return "—";
  const map: Record<string, string> = {
    lead: "Lead novo",
    mql: "Interesse confirmado",
    sql: "Qualificado",
    opportunity: "Oportunidade",
    customer: "Cliente",
    lost: "Perdido",
  };
  return map[value] ?? value;
}

export function sourceLabel(value: string | null | undefined): string {
  if (!value) return "—";
  const map: Record<string, string> = {
    meta_ads: "Meta Ads",
    facebook_ads: "Facebook Ads",
    instagram_ads: "Instagram Ads",
    google_ads: "Google Ads",
    tiktok_ads: "TikTok Ads",
    linkedin_ads: "LinkedIn Ads",
    organic: "Orgânico",
    referral: "Indicação",
    manual: "Cadastro manual",
    form: "Formulário",
    landing_page: "Landing page",
    imported: "Importado",
    whatsapp: "WhatsApp",
    phone: "Telefone",
    email: "Email",
    chat: "Chat",
    sdr_voice: "SDR + Voz IA",
    api: "API",
  };
  return map[value] ?? value;
}

export function dealStatusLabel(value: string | null | undefined): string {
  if (!value) return "—";
  const map: Record<string, string> = {
    open: "Em andamento",
    won: "Ganho",
    lost: "Perdido",
    archived: "Arquivado",
  };
  return map[value] ?? value;
}

export function activityTypeLabel(value: string | null | undefined): string {
  if (!value) return "—";
  const map: Record<string, string> = {
    call: "Ligação",
    email: "Email",
    whatsapp: "WhatsApp",
    meeting: "Reunião",
    task: "Tarefa",
    note: "Nota",
    sms: "SMS",
    video_meeting: "Reunião por vídeo",
    demo: "Demo",
    follow_up: "Follow-up",
    linkedin: "LinkedIn",
  };
  return map[value] ?? value;
}

export function callStatusLabel(value: string | null | undefined): string {
  if (!value) return "—";
  const map: Record<string, string> = {
    completed: "Atendida",
    no_answer: "Não atendeu",
    busy: "Ocupado",
    failed: "Falhou",
    voicemail: "Caixa postal",
    in_progress: "Em andamento",
    qualified: "Qualificado",
    not_qualified: "Não qualificado",
  };
  return map[value] ?? value;
}

export function conversationChannelLabel(value: string | null | undefined): string {
  if (!value) return "—";
  const map: Record<string, string> = {
    whatsapp_cloud: "WhatsApp",
    instagram_dm: "Instagram DM",
    messenger: "Messenger",
    email: "Email",
    sms: "SMS",
    live_chat: "Chat do site",
    telegram: "Telegram",
  };
  return map[value] ?? value;
}

export function conversationStatusLabel(value: string | null | undefined): string {
  if (!value) return "—";
  const map: Record<string, string> = {
    open: "Aberta",
    pending: "Aguardando",
    snoozed: "Pausada",
    resolved: "Resolvida",
    spam: "Spam",
  };
  return map[value] ?? value;
}

export function metricTooltip(metric: string): string {
  const map: Record<string, string> = {
    cpl: "Custo por Lead — quanto custa em média trazer 1 contato",
    cpa: "Custo por Aquisição — quanto custa fechar 1 cliente",
    roas: "Retorno sobre Investimento em Ads — receita gerada / valor gasto",
    ctr: "Taxa de Clique — % de pessoas que viram o anúncio e clicaram",
    cpm: "Custo por mil impressões",
    cpc: "Custo por Clique",
    ltv: "Lifetime Value — receita total esperada por cliente",
    cac: "Custo de Aquisição de Cliente",
    mrr: "Receita Recorrente Mensal",
    arr: "Receita Recorrente Anual",
    churn: "Taxa de cancelamento de clientes",
    arpu: "Receita média por usuário",
  };
  return map[metric.toLowerCase()] ?? metric;
}

export function userRoleLabel(value: string | null | undefined): string {
  if (!value) return "—";
  const map: Record<string, string> = {
    admin: "Administrador",
    gestor: "Gestor",
    vendedor: "Vendedor",
    media_buyer: "Mídia / Trafego",
    visualizador: "Visualizador",
  };
  return map[value] ?? value;
}
