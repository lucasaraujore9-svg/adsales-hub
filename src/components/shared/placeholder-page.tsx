import { PageHeader } from "@/components/shared/page-header";
import { Sparkles } from "lucide-react";

interface Props {
  kicker: string;
  title: string;
  description: string;
  roadmap: string[];
  whichIssue?: string;
}

export function PlaceholderPage({ kicker, title, description, roadmap, whichIssue }: Props) {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <PageHeader kicker={kicker} title={title} description={description} />
      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-8">
        <div className="inline-flex items-center gap-2 rounded-pill border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 px-3 py-1 text-xs font-medium text-[color:var(--accent)]">
          <Sparkles className="h-3 w-3" />
          Proto — dados mockados, funcionalidade vira em behavior
        </div>
        <h3 className="mt-6 text-lg font-medium">No proximo bloco voce vai conseguir:</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {roadmap.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
        {whichIssue && (
          <p className="mt-6 text-xs text-[color:var(--ink-4)]">
            Behavior correspondente: <code className="font-mono">{whichIssue}</code>
          </p>
        )}
      </div>
    </div>
  );
}
