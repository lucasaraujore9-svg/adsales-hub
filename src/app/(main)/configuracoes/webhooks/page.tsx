import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/guards";
import { WebhooksManager } from "@/components/settings/webhooks-manager";

export const metadata = { title: "Webhooks · AdSales Hub" };

interface WebhookRow {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export default async function WebhooksPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("webhooks")
    .select("id, name, url, events, is_active, created_at")
    .eq("workspace_id", session.workspaceId)
    .order("created_at", { ascending: false });
  const webhooks = (data ?? []) as unknown as WebhookRow[];

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
        title="Webhooks"
        description="Eventos do AdSales Hub enviados para URLs externas. Use para integrar com Zapier, n8n, Make ou seu proprio backend."
      />

      <WebhooksManager webhooks={webhooks} />
    </div>
  );
}
