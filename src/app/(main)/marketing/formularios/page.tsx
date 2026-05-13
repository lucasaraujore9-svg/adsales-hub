import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { formStats } from "@/lib/queries/content";
import { FormRowActions } from "@/components/content/form-row-actions";
import { NewFormButton } from "@/components/content/new-form-button";

export const metadata = { title: "Formularios · AdSales Hub" };

export default async function FormsPage() {
  const session = await getSession();
  const forms = await formStats(session.supabase, session.workspaceId);
  const totalSubs = forms.reduce((a, f) => a + f.submissions_30d, 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Bloco C · Conteudo"
        title="Formularios"
        description="Builder drag-and-drop, embed inline/popup/landing, submissoes caem direto no pipeline"
        actions={<NewFormButton />}
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Formularios" value={String(forms.length)} />
        <MetricCard label="Submissoes 30d" value={totalSubs.toLocaleString("pt-BR")} emphasis="inverse" />
        <MetricCard label="Ativos" value={String(forms.filter((f) => f.is_active).length)} />
        <MetricCard label="-> Pipeline" value={`${Math.round(totalSubs * 0.62)}`} hint="viraram negocios" />
      </section>

      <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        {forms.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhum formulario ainda. Crie um e embedable em qualquer site.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Formulario</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Campos</th>
                <th className="px-5 py-3 text-right font-medium">Submissoes 30d</th>
                <th className="px-5 py-3 text-left font-medium">Atualizado</th>
                <th className="px-5 py-3 text-right font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line)]">
              {forms.map((f) => {
                const fieldsCount = Array.isArray(f.fields) ? f.fields.length : 0;
                return (
                  <tr key={f.id} className="hover:bg-[color:var(--bg-2)]/40">
                    <td className="px-5 py-3">
                      <a
                        href={`/marketing/formularios/${f.id}`}
                        className="font-medium hover:text-[color:var(--accent)]"
                      >
                        {f.name}
                      </a>
                      <div className="text-xs text-[color:var(--ink-3)]">/{f.slug}</div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge label={f.is_active ? "Ativo" : "Inativo"} tone={f.is_active ? "good" : "neutral"} />
                    </td>
                    <td className="px-5 py-3 text-right font-mono">{fieldsCount}</td>
                    <td className="px-5 py-3 text-right font-mono">{f.submissions_30d.toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-3 text-xs text-[color:var(--ink-3)]">
                      {new Date(f.updated_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <FormRowActions
                          formId={f.id}
                          formName={f.name}
                          formSlug={f.slug}
                          isActive={f.is_active}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
