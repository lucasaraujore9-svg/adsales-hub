import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { getSession } from "@/lib/auth/guards";

export const metadata = { title: "Analise de Calls · AdSales Hub" };

interface CallAnalysisRow {
  id: string;
  score: number;
  summary: string | null;
  sentiment: string | null;
  created_at: string;
  call_id: string;
}

export default async function CallAnalysisPage() {
  const session = await getSession();
  const sb = session.supabase;
  const { data } = await sb
    .from("call_analyses")
    .select("id, score, summary, sentiment, created_at, call_id")
    .eq("workspace_id", session.workspaceId)
    .order("created_at", { ascending: false })
    .limit(20);
  const analyses = (data ?? []) as unknown as CallAnalysisRow[];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <PageHeader
        kicker="CRM · IA"
        title="Analise de Calls"
        description="IA avalia gravacoes e gera nota + feedback. Integra com o motor de telefonia e upload manual."
      />

      <WidgetCard kicker="Ultimas analises" title={`${analyses.length} calls analisadas`} padding="none">
        {analyses.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhuma analise ainda. Suba uma gravacao ou deixe o SDR IA rodar.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {analyses.map((a) => (
              <li key={a.id} className="flex items-start gap-4 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--accent)] text-sm font-medium text-white">
                  {a.score}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Call #{a.call_id.slice(0, 8)}</div>
                  <p className="mt-1 text-xs text-[color:var(--ink-2)] line-clamp-2">{a.summary}</p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-[color:var(--ink-4)]">
                    <span>{a.sentiment ?? "—"}</span>
                    <span>·</span>
                    <span>{new Date(a.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </WidgetCard>
    </div>
  );
}
