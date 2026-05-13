import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/guards";
import { LossReasonsManager } from "@/components/settings/loss-reasons-manager";

export const metadata = { title: "Motivos de perda · AdSales Hub" };

interface LossReasonRow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export default async function LossReasonsPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("loss_reasons")
    .select("id, name, description, is_active")
    .eq("workspace_id", session.workspaceId)
    .order("name");
  const reasons = (data ?? []) as unknown as LossReasonRow[];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="CRM"
        title="Motivos de perda"
        description="Classificacao padronizada para analisar onde o time esta perdendo deals."
      />

      <LossReasonsManager reasons={reasons} />
    </div>
  );
}
