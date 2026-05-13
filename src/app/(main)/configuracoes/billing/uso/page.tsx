import { WidgetCard } from "@/components/shared/widget-card";
import { getSession } from "@/lib/auth/guards";

interface UsageRow {
  resource: string;
  current_count: number;
  limit_count: number;
  period_start: string;
  period_end: string;
}

const LABELS: Record<string, string> = {
  users: "Usuarios",
  ad_accounts: "Contas de anuncio",
  campaigns: "Campanhas ativas",
  landing_pages: "Landing pages",
  emails_sent: "Emails enviados",
  social_networks: "Redes sociais conectadas",
  ai_generations: "Geracoes IA",
  sdr_minutes: "Minutos SDR IA",
  media_monthly: "Midia gerida (R$)",
  reports: "Relatorios",
  contracts: "Contratos",
};

export default async function UsagePage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("usage_records")
    .select("resource, current_count, limit_count, period_start, period_end")
    .eq("workspace_id", session.workspaceId);
  const usage = ((data ?? []) as unknown as UsageRow[]).sort((a, b) =>
    a.resource.localeCompare(b.resource),
  );

  return (
    <div className="space-y-4">
      <WidgetCard kicker="Periodo atual" title="Uso do workspace no ciclo vigente" padding="none">
        {usage.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Sem registros de uso ainda. Serao preenchidos quando o primeiro consumo acontecer.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {usage.map((u) => {
              const unlimited = u.limit_count === -1 || u.limit_count === 0;
              const pct = unlimited ? 0 : (Number(u.current_count) / Number(u.limit_count)) * 100;
              const warn = pct >= 80;
              const critical = pct >= 95;
              return (
                <li key={u.resource} className="px-5 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{LABELS[u.resource] ?? u.resource}</span>
                    <div className="flex items-baseline gap-2 font-mono text-xs">
                      <span className={critical ? "text-[color:var(--bad)]" : warn ? "text-[color:var(--warn)]" : ""}>
                        {Number(u.current_count).toLocaleString("pt-BR")}
                      </span>
                      {!unlimited && (
                        <span className="text-[color:var(--ink-4)]">
                          / {Number(u.limit_count).toLocaleString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--bg-2)]">
                    <div
                      className={`h-full rounded-full ${
                        critical
                          ? "bg-[color:var(--bad)]"
                          : warn
                            ? "bg-[color:var(--warn)]"
                            : "bg-[color:var(--accent)]"
                      }`}
                      style={{ width: unlimited ? "10%" : `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-kicker text-[color:var(--ink-4)]">
                    {unlimited ? "Ilimitado no plano atual" : `${pct.toFixed(0)}% do limite`}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </WidgetCard>
    </div>
  );
}
