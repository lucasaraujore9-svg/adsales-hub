import Link from "next/link";
import { FileBarChart, Palette, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/guards";
import { ReportRowActions } from "@/components/analytics/report-row-actions";

export const metadata = { title: "Relatorios · AdSales Hub" };

interface ReportRow {
  id: string;
  name: string;
  type: string;
  status: string;
  period_start: string;
  period_end: string;
  pdf_url: string | null;
  created_at: string;
}
interface ReportTemplateRow {
  id: string;
  name: string;
  description: string | null;
  type: string;
  sections: unknown;
}

export default async function ReportsPage() {
  const session = await getSession();
  const sb = session.supabase;

  const [{ data: reportsRaw }, { data: templatesRaw }] = await Promise.all([
    sb
      .from("reports")
      .select("id, name, type, status, period_start, period_end, pdf_url, created_at")
      .eq("workspace_id", session.workspaceId)
      .order("created_at", { ascending: false })
      .limit(20),
    sb
      .from("report_templates")
      .select("id, name, description, type, sections")
      .eq("workspace_id", session.workspaceId),
  ]);
  const reports = (reportsRaw ?? []) as unknown as ReportRow[];
  const templates = (templatesRaw ?? []) as unknown as ReportTemplateRow[];

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Bloco D"
        title="Central de relatorios"
        description="Gerador com IA, templates white-label, PDF, agendamento"
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/configuracoes/relatorios">
                <Palette className="mr-1 h-4 w-4" /> White-label
              </Link>
            </Button>
            <Button size="sm" disabled title="Builder em desenvolvimento">
              <Plus className="mr-1 h-4 w-4" /> Novo relatorio
            </Button>
          </>
        }
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Gerados 30d" value={String(reports.length)} />
        <MetricCard label="Templates" value={String(templates.length)} />
        <MetricCard label="Prontos" value={String(reports.filter((r) => r.status === "ready").length)} />
        <MetricCard label="Enviados" value={String(reports.filter((r) => r.status === "sent").length)} emphasis="inverse" />
      </section>

      <section className="mb-8">
        <WidgetCard kicker="Templates" title="Modelos disponiveis">
          {templates.length === 0 ? (
            <p className="text-sm text-[color:var(--ink-3)]">Nenhum template ainda.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-[color:var(--line)] bg-[color:var(--bg)] p-4 transition-colors hover:border-[color:var(--accent)]"
                >
                  <div className="kicker">{t.type}</div>
                  <h3 className="mt-1 text-sm font-medium">{t.name}</h3>
                  <p className="mt-1 text-xs text-[color:var(--ink-3)] line-clamp-2">{t.description}</p>
                  <Button variant="outline" size="sm" className="mt-3" disabled title="Builder em desenvolvimento">
                    Usar template
                  </Button>
                </div>
              ))}
            </div>
          )}
        </WidgetCard>
      </section>

      <WidgetCard kicker="Gerados" title="Ultimos relatorios" padding="none">
        {reports.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhum relatorio ainda. Gere um a partir de um template.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {reports.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileBarChart className="h-3.5 w-3.5 text-[color:var(--ink-4)]" />
                    <span className="truncate text-sm font-medium">{r.name}</span>
                    <StatusBadge
                      label={r.status === "generating" ? "Gerando..." : r.status === "sent" ? "Enviado" : "Pronto"}
                      tone={r.status === "sent" ? "good" : r.status === "generating" ? "accent" : "neutral"}
                    />
                  </div>
                  <div className="mt-0.5 text-xs text-[color:var(--ink-3)]">
                    {new Date(r.period_start).toLocaleDateString("pt-BR")} →{" "}
                    {new Date(r.period_end).toLocaleDateString("pt-BR")} · {r.type}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <ReportRowActions
                    pdfUrl={r.pdf_url}
                    reportName={r.name}
                    status={r.status}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </WidgetCard>
    </div>
  );
}
