import type { ReactNode } from "react";

interface Props {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ kicker, title, description, actions }: Props) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {kicker && <span className="kicker">{kicker}</span>}
        <h1 className="mt-2 text-3xl font-medium tracking-tighter2 md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-[color:var(--ink-3)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
