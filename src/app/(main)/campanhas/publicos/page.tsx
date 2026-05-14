import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { listAudiences } from "@/lib/queries/marketing";
import { AudienceActions } from "@/components/campaigns/audience-actions";

export const metadata = { title: "Publicos · AdSales Hub" };

const TYPE_LABELS = {
  saved: "Salvo",
  custom: "Customizado",
  lookalike: "Lookalike",
  retargeting: "Retargeting",
} as const;

const TYPE_TONES = {
  saved: "neutral",
  custom: "accent",
  lookalike: "good",
  retargeting: "warn",
} as const;

function formatSize(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString("pt-BR");
}

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const h = Math.round((Date.now() - new Date(iso).getTime()) / 36e5);
  if (h < 24) return `${h}h atrás`;
  return `${Math.round(h / 24)}d atrás`;
}

export default async function AudiencesPage() {
  const session = await getSession();
  const audiences = await listAudiences(session.supabase, session.workspaceId);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Meta Ads"
        title="Publicos"
        description="Salvos, lookalikes, retargeting e customizados. Sync CRM↔Meta disponível."
        actions={<AudienceActions />}
      />

      {audiences.length === 0 ? (
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-10 text-center text-sm text-[color:var(--ink-3)]">
          Nenhum publico criado ainda. Sincronize sua lista de clientes do CRM para criar um lookalike em segundos.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {audiences.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-12 items-center gap-4 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
            >
              <div className="col-span-12 md:col-span-5">
                <StatusBadge label={TYPE_LABELS[a.type]} tone={TYPE_TONES[a.type]} />
                <h3 className="mt-1.5 font-medium">{a.name}</h3>
              </div>
              <div className="col-span-4 md:col-span-2">
                <div className="kicker">Tamanho</div>
                <div className="mt-1 text-lg font-medium">{formatSize(a.size_estimate)}</div>
              </div>
              <div className="col-span-4 md:col-span-2">
                <div className="kicker">Provider</div>
                <div className="mt-1 text-sm">{a.provider_audience_id ?? "—"}</div>
              </div>
              <div className="col-span-4 md:col-span-3">
                <div className="kicker">Ultimo sync</div>
                <div className="mt-1 text-xs text-[color:var(--ink-3)]">{formatRelative(a.last_synced_at ?? a.updated_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
