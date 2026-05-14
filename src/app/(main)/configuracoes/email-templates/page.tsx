import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/guards";
import { EmailTemplatesManager } from "@/components/settings/email-templates-manager";

export const metadata = { title: "Email templates · AdSales Hub" };

interface EmailTemplateRow {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  category: string | null;
  is_active: boolean;
  updated_at: string;
}

export default async function EmailTemplatesPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("email_templates")
    .select("id, name, subject, body_html, category, is_active, updated_at")
    .eq("workspace_id", session.workspaceId)
    .order("updated_at", { ascending: false });
  const templates = (data ?? []) as unknown as EmailTemplateRow[];

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
        title="Email templates"
        description="Templates reutilizaveis com variaveis. Usados em automações, sequencias e disparos manuais."
      />

      <EmailTemplatesManager templates={templates} />
    </div>
  );
}
