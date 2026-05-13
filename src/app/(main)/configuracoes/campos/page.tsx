import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/guards";
import { CustomFieldsManager } from "@/components/settings/custom-fields-manager";

export const metadata = { title: "Campos customizados · AdSales Hub" };

interface CustomFieldRow {
  id: string;
  entity: string;
  name: string;
  field_key: string;
  type: string;
  options: string[] | null;
  required: boolean;
  position: number;
}

export default async function CustomFieldsPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("custom_fields")
    .select("id, entity, name, field_key, type, options, required, position")
    .eq("workspace_id", session.workspaceId)
    .order("entity")
    .order("position");
  const fields = (data ?? []) as unknown as CustomFieldRow[];

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="CRM"
        title="Campos customizados"
        description="Estende deals, contatos, empresas e atividades com campos especificos do seu negocio. Aparecerao em formularios e exportacoes."
      />

      <CustomFieldsManager fields={fields} />
    </div>
  );
}
