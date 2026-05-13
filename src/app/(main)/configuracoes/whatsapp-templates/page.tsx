import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/guards";
import { WhatsappTemplatesManager } from "@/components/settings/whatsapp-templates-manager";

export const metadata = { title: "WhatsApp templates · AdSales Hub" };

interface WaTemplateRow {
  id: string;
  name: string;
  body: string;
  language: string;
  category: string | null;
  status: string;
  is_active: boolean;
}

export default async function WhatsappTemplatesPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("whatsapp_templates")
    .select("id, name, body, language, category, status, is_active")
    .eq("workspace_id", session.workspaceId)
    .order("updated_at", { ascending: false });
  const templates = (data ?? []) as unknown as WaTemplateRow[];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="Comunicacao"
        title="WhatsApp templates"
        description="Templates Meta WhatsApp Business — categoria, idioma, variaveis no padrao {{1}}, {{2}}. Submeta para aprovacao da Meta antes de usar em disparos."
      />

      <WhatsappTemplatesManager templates={templates} />
    </div>
  );
}
