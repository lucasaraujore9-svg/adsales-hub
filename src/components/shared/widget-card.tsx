import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  kicker?: string;
  action?: { label: string; href: string };
  className?: string;
  children: ReactNode;
  padding?: "default" | "none";
}

export function WidgetCard({
  title,
  description,
  kicker,
  action,
  className,
  children,
  padding = "default",
}: Props) {
  return (
    <section
      className={cn(
        "rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4 border-b border-[color:var(--line)] px-5 py-4">
        <div className="min-w-0">
          {kicker && <span className="kicker">{kicker}</span>}
          <h2 className="mt-1 text-base font-medium tracking-tight">{title}</h2>
          {description && (
            <p className="mt-1 text-xs text-[color:var(--ink-3)]">{description}</p>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className="inline-flex shrink-0 items-center gap-1 rounded-pill border border-[color:var(--line-2)] px-3 py-1 text-xs font-medium text-[color:var(--ink-2)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
          >
            {action.label}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </header>
      <div className={padding === "default" ? "p-5" : ""}>{children}</div>
    </section>
  );
}
