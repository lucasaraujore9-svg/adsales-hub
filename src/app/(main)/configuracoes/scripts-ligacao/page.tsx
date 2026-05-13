import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/guards";
import { CallScriptsManager } from "@/components/settings/call-scripts-manager";

export const metadata = { title: "Scripts de ligacao · AdSales Hub" };

interface CallScriptRow {
  id: string;
  name: string;
  content: string;
  is_active: boolean;
  updated_at: string;
}

export default async function CallScriptsPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("call_scripts")
    .select("id, name, content, is_active, updated_at")
    .eq("workspace_id", session.workspaceId)
    .order("updated_at", { ascending: false });
  const scripts = (data ?? []) as unknown as CallScriptRow[];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="Comunicacao"
        title="Scripts de ligacao"
        description="Roteiros padronizados para o time. Disponiveis durante a ligacao no detalhe do negocio."
      />

      <CallScriptsManager scripts={scripts} />
    </div>
  );
}
