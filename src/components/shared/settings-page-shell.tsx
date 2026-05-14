import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";

interface Props {
  kicker?: string;
  title: string;
  description: string;
  roadmap: string[];
  relatedIssue?: string;
}

/**
 * Shared shell for settings pages whose deep implementation is deferred to
 * the next iteration. Shows the planned feature set so users understand
 * what's coming while keeping the navigation alive (no 404s).
 */
export function SettingsPageShell({ kicker, title, description, roadmap, relatedIssue }: Props) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader kicker={kicker ?? "Configuracoes"} title={title} description={description} />

      <WidgetCard
        kicker="Proximo ciclo"
        title="O que esta vindo"
        description="Estes controles serao wirados na próxima sprint. Infraestrutura de backend já esta no lugar."
      >
        <ul className="space-y-2 text-sm">
          {roadmap.map((r, i) => (
            <li key={i} className="flex items-start gap-2">
              <Construction className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--accent)]" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
        {relatedIssue && (
          <p className="mt-4 text-xs text-[color:var(--ink-4)]">
            Backend correspondente: <code className="font-mono">{relatedIssue}</code>
          </p>
        )}
      </WidgetCard>
    </div>
  );
}
