import Link from "next/link";

export default function MainNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[.14em] text-[color:var(--ink-3)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
        Erro 404
      </span>
      <h1 className="m-0 text-4xl font-medium tracking-tight md:text-5xl">
        Página não encontrada
      </h1>
      <p className="m-0 max-w-md text-base leading-relaxed text-[color:var(--ink-3)]">
        Esta página não existe ou foi movida. Use a busca (Cmd+K) ou volte para o dashboard.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-full bg-[color:var(--ink)] px-5 py-2.5 text-sm font-medium text-[color:var(--bg)]"
        >
          Voltar ao Dashboard
        </Link>
        <Link
          href="/pipeline"
          className="inline-flex items-center rounded-full border border-[color:var(--line)] px-5 py-2.5 text-sm font-medium text-[color:var(--ink)] hover:bg-[color:var(--bg-2)]"
        >
          Ir ao Pipeline
        </Link>
      </div>
    </div>
  );
}
