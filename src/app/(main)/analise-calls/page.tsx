import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { getSession } from "@/lib/auth/guards";
import { CallAnalysisCard, type CallAnalysisRow } from "@/components/calls/call-analysis-card";

export const metadata = { title: "Análise de Calls · AdSales Hub" };

export default async function CallAnalysisPage() {
  const session = await getSession();
  const sb = session.supabase;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sbAny = sb as any;
  const { data } = await sbAny
    .from("sdr_calls")
    .select(
      "id, duration_seconds, ai_summary, ai_sentiment, qualification_result, wants, objections, strengths, improvements, next_action, sentiment_timeline, recording_url, transcript, started_at",
    )
    .eq("workspace_id", session.workspaceId)
    .not("ai_summary", "is", null)
    .order("started_at", { ascending: false })
    .limit(20);

  const analyses = ((data ?? []) as Array<CallAnalysisRow & { started_at: string | null }>) ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <PageHeader
        kicker="CRM · IA"
        title="Análise de Calls"
        description="IA avalia gravações e gera sumário acionável: o que o lead quer, objeções, próxima ação e coaching para o vendedor."
      />

      <WidgetCard
        kicker="Últimas análises"
        title={`${analyses.length} ${analyses.length === 1 ? "call analisada" : "calls analisadas"}`}
        padding="none"
      >
        {analyses.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhuma análise ainda. Suba uma gravação ou deixe o SDR IA rodar uma fila de leads.
          </p>
        ) : (
          <div className="space-y-4 p-5">
            {analyses.map((a) => (
              <CallAnalysisCard key={a.id} call={a} />
            ))}
          </div>
        )}
      </WidgetCard>
    </div>
  );
}
