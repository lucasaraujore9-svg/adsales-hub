import { Phone, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";

export const metadata = { title: "SDR IA · AdSales Hub" };

interface SDRCall {
  id: string;
  status: string;
  duration_seconds: number;
  qualification_result: string | null;
  ai_sentiment: string | null;
  phone_number_called: string;
  created_at: string;
}
interface SDRQueueItem {
  id: string;
  status: string;
  priority: number;
  lead_score: number;
  next_attempt_at: string | null;
  attempts_made: number;
}

export default async function SdrPage() {
  const session = await getSession();
  const sb = session.supabase;
  const [{ data: callsRaw }, { data: queueRaw }, { data: configRaw }] = await Promise.all([
    sb
      .from("sdr_calls")
      .select("id, status, duration_seconds, qualification_result, ai_sentiment, phone_number_called, created_at")
      .eq("workspace_id", session.workspaceId)
      .order("created_at", { ascending: false })
      .limit(20),
    sb
      .from("sdr_queue")
      .select("id, status, priority, lead_score, next_attempt_at, attempts_made")
      .eq("workspace_id", session.workspaceId)
      .order("priority", { ascending: false })
      .limit(20),
    sb
      .from("sdr_configs")
      .select("is_active, phone_number, tone, language")
      .eq("workspace_id", session.workspaceId)
      .maybeSingle(),
  ]);
  const calls = (callsRaw ?? []) as unknown as SDRCall[];
  const queue = (queueRaw ?? []) as unknown as SDRQueueItem[];
  const config = configRaw as unknown as {
    is_active: boolean;
    phone_number: string | null;
    tone: string;
    language: string;
  } | null;

  const qualified = calls.filter((c) => c.qualification_result === "qualified").length;
  const completed = calls.filter((c) => c.status === "completed").length;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="Bloco E"
        title="SDR + Agente de Voz IA"
        description="Qualificacao automatica por telefone em ate 90s"
        actions={
          <StatusBadge
            label={config?.is_active ? "Agente ativo" : "Inativo"}
            tone={config?.is_active ? "good" : "neutral"}
          />
        }
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Na fila" value={String(queue.length)} hint="aguardando qualificação" />
        <MetricCard label="Ligacoes 30d" value={String(calls.length)} />
        <MetricCard label="Qualificados" value={String(qualified)} emphasis="inverse" />
        <MetricCard
          label="Taxa"
          value={completed > 0 ? `${((qualified / completed) * 100).toFixed(0)}%` : "—"}
          hint="qualificados / completas"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WidgetCard kicker="Fila" title="Leads aguardando" padding="none">
          {queue.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
              Fila vazia. Leads novos chegam automaticamente da integracao com Meta Ads.
            </p>
          ) : (
            <ul className="divide-y divide-[color:var(--line)]">
              {queue.map((q) => (
                <li key={q.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <div className="text-sm font-medium">Lead #{q.id.slice(0, 8)}</div>
                    <div className="text-xs text-[color:var(--ink-3)]">
                      Prioridade {q.priority} · score {q.lead_score}
                    </div>
                  </div>
                  <StatusBadge label={q.status} tone={q.status === "pending" ? "warn" : "neutral"} />
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>

        <WidgetCard kicker="Ligacoes" title="Historico recente" padding="none">
          {calls.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
              Nenhuma ligacao do SDR IA ainda.
            </p>
          ) : (
            <ul className="divide-y divide-[color:var(--line)]">
              {calls.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <Phone className="h-4 w-4 text-[color:var(--ink-4)]" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">{c.phone_number_called}</div>
                    <div className="text-xs text-[color:var(--ink-3)]">
                      {Math.round(c.duration_seconds / 60)}m · {c.status}
                      {c.qualification_result ? ` · ${c.qualification_result}` : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </WidgetCard>
      </div>

      <section className="mt-8">
        <WidgetCard kicker="Configuracao" title="Ajustar agente">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <div className="kicker">Tom</div>
              <div className="mt-1 text-sm">{config?.tone ?? "formal"}</div>
            </div>
            <div>
              <div className="kicker">Idioma</div>
              <div className="mt-1 text-sm">{config?.language ?? "pt-BR"}</div>
            </div>
            <div>
              <div className="kicker">Numero BR</div>
              <div className="mt-1 text-sm">{config?.phone_number ?? "não configurado"}</div>
            </div>
          </div>
          <p className="mt-4 text-xs text-[color:var(--ink-4)]">
            <Sparkles className="mr-1 inline h-3 w-3 text-[color:var(--accent)]" />
            Edite script, voz, horarios e numero em <strong>/configuracoes/sdr-ia</strong>.
          </p>
        </WidgetCard>
      </section>
    </div>
  );
}
