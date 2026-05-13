import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/guards";
import { ContractTemplatesManager } from "@/components/settings/contract-templates-manager";

export const metadata = { title: "Contratos · AdSales Hub" };

interface ProposalTemplateRow {
  id: string;
  name: string;
  description: string | null;
  default_validity_days: number;
  is_active: boolean;
}

interface ContractTemplateRow {
  id: string;
  name: string;
  description: string | null;
  content: string;
  is_active: boolean;
}

export default async function ContractTemplatesPage() {
  const session = await getSession();
  const sb = session.supabase;
  const [{ data: propRaw }, { data: contRaw }] = await Promise.all([
    sb
      .from("proposal_templates")
      .select("id, name, description, default_validity_days, is_active")
      .eq("workspace_id", session.workspaceId)
      .order("updated_at", { ascending: false }),
    sb
      .from("contract_templates")
      .select("id, name, description, content, is_active")
      .eq("workspace_id", session.workspaceId)
      .order("updated_at", { ascending: false }),
  ]);
  const proposals = (propRaw ?? []) as unknown as ProposalTemplateRow[];
  const contracts = (contRaw ?? []) as unknown as ContractTemplateRow[];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="Bloco F"
        title="Templates de proposta e contrato"
        description="Modelos reutilizaveis com variaveis. Sao instanciados em /contratos quando o vendedor cria uma proposta ou envia um contrato pra assinatura."
      />

      <ContractTemplatesManager proposals={proposals} contracts={contracts} />
    </div>
  );
}
