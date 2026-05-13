import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession } from "@/lib/auth/guards";
import { updateWorkspace } from "@/lib/actions/workspace";

export const metadata = { title: "Empresa · AdSales Hub" };

interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  subdomain: string | null;
  timezone: string;
  locale: string;
  currency: string;
  settings: Record<string, unknown>;
}

export default async function WorkspacePage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("workspaces")
    .select("id, name, slug, domain, subdomain, timezone, locale, currency, settings")
    .eq("id", session.workspaceId)
    .single();
  const ws = data as unknown as WorkspaceRow;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link href="/configuracoes" className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]">
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>
      <PageHeader kicker="Workspace" title="Dados da empresa" description="Nome, dominio, fuso horario e localidade." />

      <WidgetCard kicker="Identificacao" title="Sobre o workspace">
        <form action={updateWorkspace} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da empresa</Label>
            <Input name="name" id="name" defaultValue={ws.name} required />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input name="slug" id="slug" defaultValue={ws.slug} required />
            </div>
            <div>
              <Label htmlFor="domain">Dominio custom</Label>
              <Input name="domain" id="domain" defaultValue={ws.domain ?? ""} placeholder="app.minhaempresa.com.br" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <Label htmlFor="timezone">Fuso horario</Label>
              <Input name="timezone" id="timezone" defaultValue={ws.timezone} />
            </div>
            <div>
              <Label htmlFor="locale">Idioma</Label>
              <select name="locale" id="locale" defaultValue={ws.locale} className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm">
                <option value="pt-BR">Portugues (BR)</option>
                <option value="en">English</option>
                <option value="es">Espanol</option>
              </select>
            </div>
            <div>
              <Label htmlFor="currency">Moeda</Label>
              <select name="currency" id="currency" defaultValue={ws.currency} className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm">
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <Button type="submit">Salvar</Button>
        </form>
      </WidgetCard>
    </div>
  );
}
