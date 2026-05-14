import { CheckCircle2, AlertTriangle, Target, ThumbsUp, ThumbsDown } from "lucide-react";

export interface CallAnalysisRow {
  id: string;
  duration_seconds: number | null;
  ai_summary: string | null;
  ai_sentiment: string | null;
  qualification_result: string | null;
  wants?: unknown;
  objections?: unknown;
  strengths?: unknown;
  improvements?: unknown;
  next_action?: unknown;
  sentiment_timeline?: unknown;
  recording_url?: string | null;
  transcript?: string | null;
}

function toStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const t = (item as { text?: string }).text;
        if (typeof t === "string") return t;
      }
      return null;
    })
    .filter(Boolean) as string[];
}

const SENTIMENT_TONE: Record<string, string> = {
  positive: "text-[color:var(--good)]",
  neutral: "text-[color:var(--ink-3)]",
  negative: "text-[color:var(--bad)]",
};

export function CallAnalysisCard({ call }: { call: CallAnalysisRow }) {
  const wants = toStringArray(call.wants);
  const objections = toStringArray(call.objections);
  const strengths = toStringArray(call.strengths);
  const improvements = toStringArray(call.improvements);
  const nextAction = call.next_action as
    | { type?: string; description?: string; due_in_hours?: number }
    | null
    | undefined;
  const timeline = (call.sentiment_timeline as
    | Array<{ start_seconds?: number; sentiment?: string }>
    | undefined) ?? [];

  return (
    <div className="space-y-4 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">
            {call.ai_summary ?? "Sem resumo disponível."}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-[color:var(--ink-3)]">
            {call.duration_seconds != null && (
              <span>{Math.round((call.duration_seconds ?? 0) / 60)} min</span>
            )}
            {call.ai_sentiment && (
              <span className={SENTIMENT_TONE[call.ai_sentiment] ?? ""}>
                {call.ai_sentiment}
              </span>
            )}
            {call.qualification_result && (
              <span className="rounded-full bg-[color:var(--bg-2)] px-2 py-0.5">
                {call.qualification_result}
              </span>
            )}
          </div>
        </div>
      </div>

      {wants.length > 0 && (
        <section>
          <h4 className="mb-1 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
            O que ele quer
          </h4>
          <ul className="space-y-1 text-sm">
            {wants.map((w, i) => (
              <li key={i} className="flex items-start gap-2">
                <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--accent)]" />
                {w}
              </li>
            ))}
          </ul>
        </section>
      )}

      {objections.length > 0 && (
        <section>
          <h4 className="mb-1 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
            Objeções
          </h4>
          <ul className="space-y-1 text-sm">
            {objections.map((o, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--warn)]" />
                {o}
              </li>
            ))}
          </ul>
        </section>
      )}

      {nextAction?.description && (
        <section className="rounded-md border border-[color:var(--line)] bg-[color:var(--bg-2)] p-3">
          <h4 className="mb-1 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
            Próxima ação
          </h4>
          <p className="text-sm">{nextAction.description}</p>
          {nextAction.due_in_hours != null && (
            <p className="mt-1 text-xs text-[color:var(--ink-3)]">
              Em até {nextAction.due_in_hours}h
            </p>
          )}
        </section>
      )}

      {(strengths.length > 0 || improvements.length > 0) && (
        <section className="grid gap-3 md:grid-cols-2">
          {strengths.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-medium uppercase tracking-kicker text-[color:var(--good)]">
                Pontos fortes
              </h4>
              <ul className="space-y-1 text-xs">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <ThumbsUp className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--good)]" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {improvements.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-medium uppercase tracking-kicker text-[color:var(--warn)]">
                Pode melhorar
              </h4>
              <ul className="space-y-1 text-xs">
                {improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <ThumbsDown className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--warn)]" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {timeline.length > 0 && (
        <section>
          <h4 className="mb-1 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
            Sentimento ao longo da call
          </h4>
          <div className="flex h-2 overflow-hidden rounded-full">
            {timeline.map((t, i) => (
              <div
                key={i}
                className={
                  t.sentiment === "positive"
                    ? "h-full flex-1 bg-[color:var(--good)]"
                    : t.sentiment === "negative"
                      ? "h-full flex-1 bg-[color:var(--bad)]"
                      : "h-full flex-1 bg-[color:var(--line-2)]"
                }
              />
            ))}
          </div>
        </section>
      )}

      {call.recording_url && (
        <section>
          <h4 className="mb-1 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
            Gravação
          </h4>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls src={call.recording_url} className="w-full" />
        </section>
      )}

      {call.transcript && (
        <details className="text-sm">
          <summary className="cursor-pointer text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
            Transcrição completa
          </summary>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-[color:var(--ink-2)]">
            {call.transcript}
          </pre>
        </details>
      )}

      <p className="flex items-center gap-1.5 text-xs text-[color:var(--ink-4)]">
        <CheckCircle2 className="h-3 w-3" />
        Análise gerada por IA com base na transcrição
      </p>
    </div>
  );
}
