import { Workflow, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import {
  AutomationToggleButton,
  AutomationTemplateButton,
} from "@/components/sales/automation-actions";

export const metadata = { title: "Automacoes · AdSales Hub" };

interface AutomationRow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  is_active: boolean;
  run_count: number;
  last_run_at: string | null;
  updated_at: string;
}
interface LogRow {
  id: string;
  automation_id: string;
  status: string;
  error: string | null;
  executed_at: string;
}

export default async function AutomationsPage() {
  const session = await getSession();
  const sb = session.supabase;

  const [{ data: autRaw }, { data: logsRaw }] = await Promise.all([
    sb
      .from("automations")
      .select("id, name, description, trigger_type, is_active, run_count, last_run_at, updated_at")
      .eq("workspace_id", session.workspaceId)
      .order("updated_at", { ascending: false }),
    sb
      .from("automation_logs")
      .select("id, automation_id, status, error, executed_at")
      .eq("workspace_id", session.workspaceId)
      .order("executed_at", { ascending: false })
      .limit(20),
  ]);
  const automations = (autRaw ?? []) as unknown as AutomationRow[];
  const logs = (logsRaw ?? []) as unknown as LogRow[];

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="CRM + Marketing"
        title="Automacoes"
        description="Triggers → condicoes → acoes cruzando Meta Ads, WhatsApp, email, pipeline"
        actions={null}
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Automacoes" value={String(automations.length)} />
        <MetricCard label="Ativas" value={String(automations.filter((a) => a.is_active).length)} />
        <MetricCard
          label="Execucoes 30d"
          value={automations.reduce((a, b) => a + (b.run_count ?? 0), 0).toLocaleString("pt-BR")}
          emphasis="inverse"
        />
        <MetricCard
          label="Falhas"
          value={String(logs.filter((l) => l.status === "failed").length)}
          hint="ultimas 20"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WidgetCard kicker="Automacoes" title="Suas regras" padding="none">
            {automations.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Workflow className="mx-auto h-10 w-10 text-[color:var(--ink-4)]" />
                <p className="mt-3 text-sm text-[color:var(--ink-3)]">
                  Nenhuma automacao criada. Use um dos modelos ao lado para comecar em segundos.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[color:var(--line)]">
                {automations.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-[color:var(--accent)]" />
                        <span className="font-medium">{a.name}</span>
                        <StatusBadge label={a.is_active ? "Ativa" : "Pausada"} tone={a.is_active ? "good" : "neutral"} />
                      </div>
                      <div className="mt-0.5 text-xs text-[color:var(--ink-3)]">
                        Trigger: <strong>{a.trigger_type}</strong> · {a.run_count} execucoes
                      </div>
                    </div>
                    <AutomationToggleButton id={a.id} isActive={a.is_active} />
                  </li>
                ))}
              </ul>
            )}
          </WidgetCard>
        </div>

        <aside>
          <WidgetCard kicker="Modelos" title="Comece em segundos">
            <ul className="space-y-2 text-sm">
              {[
                { name: "Novo lead Meta -> WhatsApp boas-vindas", trigger: "lead_created" },
                { name: "Deal sem atividade 5d -> criar task", trigger: "deal_idle" },
                { name: "Falha de pagamento -> email dunning", trigger: "payment_failed" },
                { name: "Post reprovado -> notificar autor", trigger: "post_rejected" },
                { name: "Reuniao marcada -> enviar link Calendar", trigger: "meeting_scheduled" },
              ].map((t) => (
                <li key={t.trigger}>
                  <AutomationTemplateButton name={t.name} triggerType={t.trigger} />
                </li>
              ))}
            </ul>
          </WidgetCard>
        </aside>
      </div>

      {logs.length > 0 && (
        <section className="mt-8">
          <WidgetCard kicker="Execucoes" title="Historico recente" padding="none">
            <ul className="divide-y divide-[color:var(--line)]">
              {logs.map((l) => (
                <li key={l.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <div>
                    <StatusBadge
                      label={l.status}
                      tone={l.status === "success" ? "good" : l.status === "failed" ? "bad" : "neutral"}
                    />
                    {l.error && <span className="ml-2 text-xs text-[color:var(--bad)]">{l.error}</span>}
                  </div>
                  <span className="text-xs text-[color:var(--ink-4)]">
                    {new Date(l.executed_at).toLocaleString("pt-BR")}
                  </span>
                </li>
              ))}
            </ul>
          </WidgetCard>
        </section>
      )}
    </div>
  );
}
