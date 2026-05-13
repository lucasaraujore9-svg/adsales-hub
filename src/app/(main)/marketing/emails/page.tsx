import Link from "next/link";
import { Mail, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/guards";
import { listEmailCampaigns } from "@/lib/queries/content";
import { EmailComposerButton } from "@/components/content/email-composer-button";

export const metadata = { title: "Email Marketing · AdSales Hub" };

const STATUS_LABELS = {
  draft: { label: "Rascunho", tone: "neutral" },
  scheduled: { label: "Agendado", tone: "warn" },
  sending: { label: "Enviando", tone: "accent" },
  sent: { label: "Enviado", tone: "good" },
  failed: { label: "Falha", tone: "bad" },
  canceled: { label: "Cancelado", tone: "neutral" },
} as const;

export default async function EmailMarketingPage() {
  const session = await getSession();
  const sb = session.supabase;
  const campaigns = await listEmailCampaigns(sb, session.workspaceId);

  const [{ data: tplRaw }, { data: emailIntegrationRaw }] = await Promise.all([
    sb
      .from("email_templates")
      .select("id, name, subject, body_html")
      .eq("workspace_id", session.workspaceId)
      .eq("is_active", true)
      .order("name"),
    sb
      .from("integrations")
      .select("credentials")
      .eq("workspace_id", session.workspaceId)
      .in("provider", ["resend", "smtp", "gmail"])
      .maybeSingle(),
  ]);
  const templates = (tplRaw ?? []) as unknown as Array<{
    id: string;
    name: string;
    subject: string;
    body_html: string;
  }>;
  const emailCreds =
    ((emailIntegrationRaw as { credentials?: Record<string, unknown> } | null)?.credentials ??
      {}) as Record<string, unknown>;

  const sent = campaigns.filter((c) => c.status === "sent");
  const totalSent = sent.reduce((a, c) => a + (c.metrics?.sent ?? 0), 0);
  const avgOpen =
    sent.length > 0
      ? sent.reduce((a, c) => a + (c.metrics?.open_rate ?? 0), 0) / sent.length
      : 0;
  const avgClick =
    sent.length > 0
      ? sent.reduce((a, c) => a + (c.metrics?.click_rate ?? 0), 0) / sent.length
      : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Bloco C · Mensagens"
        title="Email Marketing"
        description="Disparos em massa, segmentacao, metricas abertura/clique via Resend webhook"
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link href="/configuracoes/email-templates">Templates</Link>
            </Button>
            <EmailComposerButton
              templates={templates}
              defaultFromEmail={String(emailCreds.from_email ?? "")}
              defaultFromName={String(emailCreds.from_name ?? "")}
            />
          </>
        }
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Enviados 30d" value={totalSent.toLocaleString("pt-BR")} />
        <MetricCard label="Taxa abertura" value={`${avgOpen.toFixed(1)}%`} emphasis="inverse" />
        <MetricCard label="Taxa clique" value={`${avgClick.toFixed(1)}%`} />
        <MetricCard label="Campanhas" value={String(campaigns.length)} />
      </section>

      <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        {campaigns.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhuma campanha de email. Crie a primeira e use os templates transacionais.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Campanha</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Enviados</th>
                <th className="px-5 py-3 text-right font-medium">Abertura</th>
                <th className="px-5 py-3 text-right font-medium">Clique</th>
                <th className="px-5 py-3 text-left font-medium">Quando</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line)]">
              {campaigns.map((c) => {
                const m = STATUS_LABELS[c.status] ?? STATUS_LABELS.draft;
                return (
                  <tr key={c.id} className="hover:bg-[color:var(--bg-2)]/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-[color:var(--ink-4)]" />
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-[color:var(--ink-3)]">{c.subject}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><StatusBadge label={m.label} tone={m.tone} /></td>
                    <td className="px-5 py-3 text-right font-mono">
                      {(c.metrics?.sent ?? 0).toLocaleString("pt-BR")}
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      {c.metrics?.open_rate ? `${c.metrics.open_rate.toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-mono">
                      {c.metrics?.click_rate ? `${c.metrics.click_rate.toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-5 py-3 text-xs text-[color:var(--ink-3)]">
                      {c.sent_at
                        ? `Enviado ${new Date(c.sent_at).toLocaleDateString("pt-BR")}`
                        : c.scheduled_at
                          ? `Envia ${new Date(c.scheduled_at).toLocaleDateString("pt-BR")}`
                          : "Rascunho"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[color:var(--accent)]" />
          <h3 className="text-sm font-medium">Sequencias automaticas</h3>
        </div>
        <p className="mt-2 text-xs text-[color:var(--ink-3)]">
          Welcome flow, reativacao, nurture B2B. Gerenciados em <strong>/automacoes</strong>.
        </p>
      </div>
    </div>
  );
}
