import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/guards";
import { MetaAdsForm } from "@/components/settings/meta-ads-form";
import { MetaConnectedAccounts } from "@/components/settings/meta-connected-accounts";

export const metadata = { title: "Meta Ads · AdSales Hub" };

interface IntegrationRow {
  display_name: string | null;
  credentials: {
    business_id?: string;
    ad_account_id?: string;
    pixel_id?: string;
    page_id?: string;
    system_user_token?: string;
    app_id?: string;
    app_secret?: string;
  } | null;
  status: string;
}

interface AdAccountRow {
  id: string;
  provider_account_id: string;
  name: string;
  currency: string;
  timezone: string;
  status: string;
  token_expires_at: string | null;
  created_at: string;
}

interface SearchParams {
  connected?: string;
  error?: string;
  desc?: string;
  meta_user?: string;
  failed?: string;
}

export default async function MetaAdsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  const sp = await searchParams;

  const [{ data: integ }, { data: accountsRaw }] = await Promise.all([
    session.supabase
      .from("integrations")
      .select("display_name, credentials, status")
      .eq("workspace_id", session.workspaceId)
      .eq("provider", "meta_ads")
      .maybeSingle(),
    session.supabase
      .from("ad_accounts")
      .select(
        "id, provider_account_id, name, currency, timezone, status, token_expires_at, created_at",
      )
      .eq("workspace_id", session.workspaceId)
      .eq("provider", "meta")
      .order("created_at", { ascending: false }),
  ]);

  const integration = integ as IntegrationRow | null;
  const creds = integration?.credentials ?? {};
  const adAccounts = (accountsRaw ?? []) as AdAccountRow[];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="Marketing"
        title="Meta Marketing API"
        description="Conecte sua conta Facebook/Instagram para criar campanhas, receber leads e usar Conversions API."
        actions={
          adAccounts.length > 0 && (
            <StatusBadge label={`${adAccounts.length} conta(s)`} tone="good" />
          )
        }
      />

      {sp.connected && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-[color:var(--good)]/30 bg-[color:var(--good)]/10 px-4 py-3 text-sm text-[color:var(--good)]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{sp.connected} conta(s) de anuncio conectada(s) com sucesso.</span>
        </div>
      )}
      {sp.error === "no_ad_accounts" && (
        <div className="mb-4 rounded-md border border-[color:var(--warn)]/30 bg-[color:var(--warn)]/10 px-4 py-3 text-sm text-[color:var(--warn)]">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <strong>Nenhuma conta de anuncio encontrada{sp.meta_user ? ` para ${sp.meta_user}` : ""}.</strong>
              <p className="mt-1 text-[color:var(--ink-2)]">Causas comuns:</p>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-[color:var(--ink-2)]">
                <li>
                  Voce nao tem nenhuma <strong>conta de anuncio Meta</strong> ativa. Crie uma em{" "}
                  <a
                    href="https://business.facebook.com/adsmanager"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    business.facebook.com/adsmanager
                  </a>
                  .
                </li>
                <li>
                  Voce nao concedeu acesso a nenhuma conta na tela &quot;Selecionar contas de
                  anuncio&quot; do popup. Tente <strong>Conectar com Facebook</strong> de novo e
                  marque pelo menos uma conta.
                </li>
                <li>
                  As permissoes <code className="font-mono">ads_management</code> /{" "}
                  <code className="font-mono">ads_read</code> nao foram aprovadas (em modo dev,
                  voce precisa estar em <strong>Funcoes</strong> do app como Admin/Tester).
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
      {sp.error === "app_not_configured" && (
        <div className="mb-4 rounded-md border border-[color:var(--warn)]/30 bg-[color:var(--warn)]/10 px-4 py-3 text-sm text-[color:var(--warn)]">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <strong>App Facebook nao configurado.</strong> O administrador precisa criar um app
              em{" "}
              <a
                href="https://developers.facebook.com/apps"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                developers.facebook.com/apps
              </a>{" "}
              e setar <code className="font-mono">META_APP_ID</code> +{" "}
              <code className="font-mono">META_APP_SECRET</code> no servidor. Redirect URI:{" "}
              <code className="font-mono">
                https://adsaleshub.7iegroup.com.br/api/auth/meta/callback
              </code>
            </div>
          </div>
        </div>
      )}
      {sp.error && sp.error !== "app_not_configured" && sp.error !== "no_ad_accounts" && (
        <div className="mb-4 rounded-md border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/10 px-4 py-3 text-sm text-[color:var(--bad)]">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <strong>Falha na conexao:</strong> <code className="font-mono">{sp.error}</code>
              {sp.desc && <p className="mt-1 text-xs opacity-80">{sp.desc}</p>}
            </div>
          </div>
        </div>
      )}

      <WidgetCard
        kicker="Recomendado"
        title="Conectar via Facebook Login"
        description="OAuth oficial. Voce autoriza o app dentro do Facebook, escolhe quais contas e Pages liberar, e nos guardamos um token criptografado com refresh automatico."
      >
        <Button asChild size="lg" className="bg-[#1877F2] text-white hover:bg-[#1564d3]">
          <a href="/api/auth/meta/connect">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M24 12a12 12 0 1 0-13.875 11.854V15.469H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.313 0 2.686.234 2.686.234v2.953h-1.513c-1.49 0-1.954.925-1.954 1.875V12h3.328l-.532 3.469h-2.796v8.385A12.001 12.001 0 0 0 24 12z" />
            </svg>
            Conectar com Facebook
          </a>
        </Button>
        <p className="mt-3 text-xs text-[color:var(--ink-4)]">
          Permissoes solicitadas: <code className="font-mono">ads_management</code>,{" "}
          <code className="font-mono">ads_read</code>, <code className="font-mono">leads_retrieval</code>,{" "}
          <code className="font-mono">pages_manage_ads</code>,{" "}
          <code className="font-mono">business_management</code>,{" "}
          <code className="font-mono">instagram_basic</code>.
        </p>
      </WidgetCard>

      {adAccounts.length > 0 && (
        <WidgetCard
          kicker="Contas conectadas"
          title={`${adAccounts.length} ad account(s)`}
          className="mt-6"
        >
          <MetaConnectedAccounts
            accounts={adAccounts.map((a) => ({
              id: a.id,
              providerAccountId: a.provider_account_id,
              name: a.name,
              currency: a.currency,
              timezone: a.timezone,
              status: a.status,
              tokenExpiresAt: a.token_expires_at,
              createdAt: a.created_at,
            }))}
          />
        </WidgetCard>
      )}

      <details className="mt-6 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
        <summary className="cursor-pointer text-sm font-medium">
          Configuracao avancada (System User token + Pixel + Pages)
        </summary>
        <p className="mt-2 text-xs text-[color:var(--ink-4)]">
          Use isto se voce ja tem um Business Manager configurado e prefere informar tokens
          manualmente em vez do OAuth. Recomendado apenas pra ambientes corporativos.
        </p>
        <div className="mt-4">
          <MetaAdsForm
            initialBusinessId={creds.business_id ?? ""}
            initialAdAccountId={creds.ad_account_id ?? ""}
            initialPixelId={creds.pixel_id ?? ""}
            initialPageId={creds.page_id ?? ""}
            initialSystemUserToken={creds.system_user_token ?? ""}
            initialAppId={creds.app_id ?? ""}
            initialAppSecret={creds.app_secret ?? ""}
            hasIntegration={!!integration}
          />
        </div>
      </details>
    </div>
  );
}
