import Link from "next/link";
import {
  Check,
  Globe,
  Plug,
  Plus,
  Settings2,
  Webhook as WebhookIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/guards";
import { publicEnv } from "@/lib/env";
import { ChannelIcon, channelLabel, channelTone } from "@/components/inbox/channel-icon";
import { CopyButton } from "@/components/shared/copy-button";

export const metadata = { title: "Integracoes · AdSales Hub" };

interface IntegrationRow {
  id: string;
  provider: string;
  display_name: string | null;
  status: string;
  last_sync_at: string | null;
  created_at: string;
  credentials: Record<string, unknown>;
}

interface SocialAccountRow {
  id: string;
  platform: string;
  account_name: string;
  status: string;
  account_id: string;
}

interface AdAccountRow {
  id: string;
  name: string;
  provider: string;
  provider_account_id: string;
  status: string;
  token_expires_at: string | null;
}

interface LiveChatRow {
  id: string;
  token: string;
  is_active: boolean;
  welcome_message: string;
}

export default async function IntegrationsPage() {
  const session = await getSession();
  const sb = session.supabase;

  const [
    { data: integRaw },
    { data: socialRaw },
    { data: adsRaw },
    { data: widgetRaw },
  ] = await Promise.all([
    sb
      .from("integrations")
      .select("id, provider, display_name, status, last_sync_at, created_at, credentials")
      .eq("workspace_id", session.workspaceId),
    sb
      .from("social_accounts")
      .select("id, platform, account_name, status, account_id")
      .eq("workspace_id", session.workspaceId),
    sb
      .from("ad_accounts")
      .select("id, name, provider, provider_account_id, status, token_expires_at")
      .eq("workspace_id", session.workspaceId),
    sb
      .from("live_chat_widgets")
      .select("id, token, is_active, welcome_message")
      .eq("workspace_id", session.workspaceId)
      .maybeSingle(),
  ]);

  const integrations = (integRaw ?? []) as unknown as IntegrationRow[];
  const socials = (socialRaw ?? []) as unknown as SocialAccountRow[];
  const adAccounts = (adsRaw ?? []) as unknown as AdAccountRow[];
  const widget = widgetRaw as unknown as LiveChatRow | null;

  const host = publicEnv.NEXT_PUBLIC_APP_URL;

  // Organized by category
  const messagingIntegrations = [
    {
      key: "whatsapp_cloud",
      title: "WhatsApp Cloud API (oficial)",
      description: "API oficial da Meta. Templates pre-aprovados, sem risco de ban. Recomendado para produção.",
      status: integrations.find((i) => i.provider === "whatsapp_cloud")?.status ?? "disconnected",
      connectHref: "/configuracoes/whatsapp",
      webhookUrl: `${host}/api/webhooks/whatsapp`,
      docsNote: "Configure o webhook no painel Meta for Developers, e cole phone_number_id + token aqui.",
    },
    {
      key: "whatsapp_unofficial",
      title: "WhatsApp não oficial (QR Code)",
      description: "Via Baileys / WPPConnect. Sem limite de templates mas maior risco de ban. Use providers como Z-API, UAZAPI ou self-hosted.",
      status: integrations.find((i) => i.provider === "whatsapp_unofficial")?.status ?? "disconnected",
      connectHref: "/configuracoes/whatsapp-unofficial",
      webhookUrl: `${host}/api/webhooks/generic/whatsapp-unofficial`,
      docsNote: "Configure seu provider pra postar mensagens recebidas no endpoint acima.",
    },
    {
      key: "instagram_dm",
      title: "Instagram Direct",
      description: "DMs recebidas + enviadas via Meta Graph API. Precisa de conta business + Facebook Page.",
      status: socials.find((s) => s.platform === "instagram")?.status ?? "disconnected",
      connectHref: "/api/auth/meta/connect",
      webhookUrl: `${host}/api/webhooks/meta-messaging`,
      docsNote: "Conecte uma conta business via OAuth. DMs aparecerao automaticamente no /inbox.",
    },
    {
      key: "messenger",
      title: "Facebook Messenger",
      description: "Conversas de pages do Facebook. OAuth via Meta.",
      status: socials.find((s) => s.platform === "facebook")?.status ?? "disconnected",
      connectHref: "/api/auth/meta/connect",
      webhookUrl: `${host}/api/webhooks/meta-messaging`,
      docsNote: "Use o mesmo webhook do Instagram (Meta agrupou as duas APIs).",
    },
    {
      key: "email",
      title: "Email transacional (Resend)",
      description: "Send + inbound routing. Webhooks de open/click já estao configurados.",
      status: integrations.find((i) => i.provider === "resend")?.status ?? "disconnected",
      connectHref: "/configuracoes/gmail",
      webhookUrl: `${host}/api/webhooks/resend`,
      docsNote: "Configure RESEND_API_KEY no .env. Domain verification via painel Resend.",
    },
    {
      key: "live_chat",
      title: "Chat no site (widget)",
      description: "Embed o widget em qualquer site pra capturar conversas de visitantes direto no inbox.",
      status: widget?.is_active ? "active" : "disconnected",
      connectHref: null,
      webhookUrl: widget ? `${host}/api/chat-widget/${widget.token}` : null,
      docsNote: "Cole o snippet abaixo no HTML do seu site (antes do </body>).",
    },
  ];

  const marketingIntegrations = [
    {
      key: "meta_ads",
      title: "Meta Marketing API",
      description: "Contas de anuncio conectadas para campanhas, lead forms e insights.",
      count: adAccounts.length,
      status: adAccounts.some((a) => a.status === "active") ? "active" : "disconnected",
      connectHref: "/api/auth/meta/connect",
      extra: adAccounts.map((a) => `${a.name} · ${a.provider_account_id}`),
    },
    {
      key: "stripe",
      title: "Stripe",
      description: "Checkout, subscriptions, invoices.",
      status: integrations.find((i) => i.provider === "stripe")?.status ?? "disconnected",
      connectHref: "/configuracoes/billing",
      webhookUrl: `${host}/api/webhooks/stripe`,
    },
    {
      key: "voice-engine",
      title: "Motor de voz IA (SDR)",
      description: "Ligacoes IA inbound/outbound. Requer número DID BR configurado.",
      status: integrations.find((i) => i.provider === "voice-engine")?.status ?? "disconnected",
      connectHref: "/configuracoes/telefone",
      webhookUrl: `${host}/api/webhooks/voice-engine`,
    },
  ];

  const automationIntegrations = [
    {
      key: "zapier",
      title: "Zapier",
      description: "Conecte o AdSales Hub a 5000+ apps via triggers/actions.",
      status: "coming_soon",
    },
    {
      key: "n8n",
      title: "n8n",
      description: "Self-hosted automation. Ja suporta webhook receiver generico.",
      status: "ready",
      webhookUrl: `${host}/api/webhooks/generic/{seu-form-slug}`,
    },
    {
      key: "make",
      title: "Make (Integromat)",
      description: "Automation visual. Compativel com nosso webhook generico.",
      status: "ready",
      webhookUrl: `${host}/api/webhooks/generic/{seu-form-slug}`,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PageHeader
        kicker="Workspace · Configuracoes"
        title="Integracoes"
        description="Conecte canais de comunicacao, plataformas de ads e automações externas."
      />

      {/* === Canais de comunicacao === */}
      <section className="mb-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-medium">Canais de comunicacao</h2>
          <span className="text-xs text-[color:var(--ink-3)]">
            Aparecem no <Link href="/inbox" className="text-[color:var(--accent)]">/inbox</Link>
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {messagingIntegrations.map((i) => (
            <div
              key={i.key}
              className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${channelTone(i.key)}`}
                  >
                    <ChannelIcon channel={i.key} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium">{i.title}</h3>
                    <p className="mt-1 text-xs text-[color:var(--ink-3)]">{i.description}</p>
                  </div>
                </div>
                <StatusBadge
                  label={i.status === "active" ? "Conectado" : i.status === "expired" ? "Expirado" : "Desconectado"}
                  tone={i.status === "active" ? "good" : i.status === "expired" ? "warn" : "neutral"}
                />
              </div>

              {i.webhookUrl && (
                <div className="mt-4 rounded-lg border border-[color:var(--line-2)] bg-[color:var(--bg)] p-3">
                  <div className="flex items-center gap-1 text-[10px] uppercase tracking-kicker text-[color:var(--ink-4)]">
                    <WebhookIcon className="h-3 w-3" /> Webhook URL
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 truncate font-mono text-xs text-[color:var(--ink-2)]">
                      {i.webhookUrl}
                    </code>
                    <CopyButton text={i.webhookUrl} />
                  </div>
                  {i.docsNote && (
                    <p className="mt-2 text-[10px] text-[color:var(--ink-4)]">{i.docsNote}</p>
                  )}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {i.connectHref && (
                  <Button asChild size="sm">
                    <Link href={i.connectHref}>
                      {i.status === "active" ? <Settings2 className="mr-1 h-3.5 w-3.5" /> : <Plug className="mr-1 h-3.5 w-3.5" />}
                      {i.status === "active" ? "Configurar" : "Conectar"}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* === Widget snippet === */}
      {widget && (
        <section className="mb-10">
          <WidgetCard
            kicker="Live chat widget"
            title="Snippet de embed"
            description="Cole isto no HTML do seu site (antes do </body>) para mostrar o widget de chat."
          >
            <pre className="overflow-x-auto rounded-lg bg-[color:var(--bg)] p-4 text-xs font-mono text-[color:var(--ink-2)]">
{`<script async src="${host}/chat-widget.js" data-token="${widget.token}"></script>`}
            </pre>
            <div className="mt-3 flex gap-2">
              <CopyButton
                text={`<script async src="${host}/chat-widget.js" data-token="${widget.token}"></script>`}
                label="Copiar snippet"
              />
              <Button asChild variant="outline" size="sm">
                <Link href={`/configuracoes/live-chat`}>
                  <Settings2 className="mr-1 h-3.5 w-3.5" /> Personalizar widget
                </Link>
              </Button>
            </div>
            <p className="mt-3 text-xs text-[color:var(--ink-3)]">
              Endpoint da API: <code className="font-mono">{host}/api/chat-widget/{widget.token}</code>
            </p>
          </WidgetCard>
        </section>
      )}

      {/* === Marketing === */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium">Marketing &amp; Vendas</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {marketingIntegrations.map((i) => (
            <div key={i.key} className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{i.title}</h3>
                <StatusBadge
                  label={i.status === "active" ? "Ativo" : "Desconectado"}
                  tone={i.status === "active" ? "good" : "neutral"}
                />
              </div>
              <p className="mt-2 text-xs text-[color:var(--ink-3)]">{i.description}</p>
              {"count" in i && (
                <p className="mt-2 text-xs font-mono text-[color:var(--ink-4)]">
                  {i.count} conta{i.count === 1 ? "" : "s"} conectada{i.count === 1 ? "" : "s"}
                </p>
              )}
              {"extra" in i && i.extra && i.extra.length > 0 && (
                <ul className="mt-2 space-y-1 text-[10px] text-[color:var(--ink-3)]">
                  {i.extra.slice(0, 3).map((e, idx) => (
                    <li key={idx} className="truncate">
                      <Check className="mr-1 inline h-2.5 w-2.5 text-[color:var(--good)]" /> {e}
                    </li>
                  ))}
                </ul>
              )}
              {"webhookUrl" in i && i.webhookUrl && (
                <div className="mt-3 flex items-center gap-2 rounded border border-[color:var(--line-2)] bg-[color:var(--bg)] px-2 py-1 text-[10px] font-mono text-[color:var(--ink-3)]">
                  <span className="truncate">{i.webhookUrl}</span>
                  <CopyButton text={i.webhookUrl} />
                </div>
              )}
              {"connectHref" in i && i.connectHref && (
                <Button asChild size="sm" className="mt-4 w-full" variant="outline">
                  <Link href={i.connectHref}>Configurar</Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* === Automacao externa === */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium">Automacao externa</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {automationIntegrations.map((i) => (
            <div key={i.key} className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{i.title}</h3>
                <StatusBadge
                  label={
                    i.status === "ready" ? "Pronto" : i.status === "coming_soon" ? "Em breve" : "—"
                  }
                  tone={i.status === "ready" ? "accent" : "neutral"}
                />
              </div>
              <p className="mt-2 text-xs text-[color:var(--ink-3)]">{i.description}</p>
              {"webhookUrl" in i && i.webhookUrl && (
                <div className="mt-3 flex items-center gap-2 rounded border border-[color:var(--line-2)] bg-[color:var(--bg)] px-2 py-1 text-[10px] font-mono text-[color:var(--ink-3)]">
                  <span className="truncate">{i.webhookUrl}</span>
                  <CopyButton text={i.webhookUrl} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* === API & webhooks === */}
      <section>
        <WidgetCard
          kicker="Avancado"
          title="API & Webhooks"
          description="Para integrar qualquer coisa que não esta listada acima."
          action={{ label: "Ver API keys", href: "/configuracoes/api" }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[color:var(--accent)]" />
                <span className="text-sm font-medium">Base URL</span>
              </div>
              <code className="mt-2 block break-all font-mono text-xs text-[color:var(--ink-3)]">
                {host}/api/v1
              </code>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Plug className="h-4 w-4 text-[color:var(--accent)]" />
                <span className="text-sm font-medium">Webhook generico</span>
              </div>
              <code className="mt-2 block break-all font-mono text-xs text-[color:var(--ink-3)]">
                {host}/api/webhooks/generic/&#123;token&#125;
              </code>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <WebhookIcon className="h-4 w-4 text-[color:var(--accent)]" />
                <span className="text-sm font-medium">Outbound webhooks</span>
              </div>
              <Button asChild size="sm" variant="outline" className="mt-2 w-full">
                <Link href="/configuracoes/webhooks">
                  <Plus className="mr-1 h-3 w-3" /> Novo webhook
                </Link>
              </Button>
            </div>
          </div>
        </WidgetCard>
      </section>
    </div>
  );
}
