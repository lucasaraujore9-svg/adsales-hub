import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { getSession } from "@/lib/auth/guards";
import { publicEnv } from "@/lib/env";
import { CopyButton } from "@/components/shared/copy-button";
import { ApiKeysManager } from "@/components/settings/api-keys-manager";

export const metadata = { title: "API keys · AdSales Hub" };

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export default async function ApiKeysPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("api_keys")
    .select("id, name, key_prefix, scopes, last_used_at, expires_at, revoked_at, created_at")
    .eq("workspace_id", session.workspaceId)
    .order("created_at", { ascending: false });
  const keys = (data ?? []) as unknown as ApiKeyRow[];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>
      <PageHeader
        kicker="Avancado"
        title="API keys"
        description="Tokens para acessar a API do workspace programaticamente. Headers de autenticação: Authorization: Bearer ahk_..."
        actions={
          <Link
            href="/configuracoes/api/docs"
            className="rounded-pill border border-[color:var(--line-2)] px-3 py-1.5 text-xs font-medium text-[color:var(--ink-2)] hover:bg-[color:var(--bg-2)]"
          >
            Ver docs
          </Link>
        }
      />

      <WidgetCard kicker="Base URL" title="Endpoint">
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-md bg-[color:var(--bg)] px-3 py-2 font-mono text-sm">
            {publicEnv.NEXT_PUBLIC_APP_URL}/api/v1
          </code>
          <CopyButton text={`${publicEnv.NEXT_PUBLIC_APP_URL}/api/v1`} />
        </div>
        <p className="mt-2 text-xs text-[color:var(--ink-3)]">
          Endpoints disponiveis: <code className="font-mono">/contacts</code>,{" "}
          <code className="font-mono">/deals</code>, <code className="font-mono">/forms/&#123;slug&#125;/submit</code>.
          Cada chamada checa scopes da API key.
        </p>
      </WidgetCard>

      <div className="mt-6">
        <ApiKeysManager keys={keys} />
      </div>
    </div>
  );
}
