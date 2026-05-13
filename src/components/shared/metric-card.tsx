import type { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  hint?: string;
  delta?: { value: number; label?: string; invert?: boolean };
  icon?: ReactNode;
  emphasis?: "default" | "inverse";
}

export function MetricCard({ label, value, hint, delta, icon, emphasis = "default" }: Props) {
  const up = (delta?.value ?? 0) > 0;
  const down = (delta?.value ?? 0) < 0;
  const good = delta?.invert ? down : up;
  const bad = delta?.invert ? up : down;

  return (
    <div
      className={cn(
        "rounded-card border p-5 transition-colors",
        emphasis === "inverse"
          ? "border-transparent bg-[color:var(--ink)] text-[color:var(--bg)]"
          : "border-[color:var(--line)] bg-[color:var(--panel)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="kicker" style={emphasis === "inverse" ? { color: "rgba(10,10,11,0.55)" } : undefined}>
          {label}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full",
              emphasis === "inverse" ? "bg-[color:var(--bg)]/5 text-[color:var(--bg)]" : "bg-[color:var(--bg-2)] text-[color:var(--ink-3)]",
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 min-w-0">
        <div className="truncate text-3xl font-medium tracking-tighter2">{value}</div>
        {delta && (
          <span
            className={cn(
              "mt-1.5 inline-flex max-w-full items-center gap-1 rounded-pill px-1.5 py-0.5 text-[11px] font-medium",
              good && "bg-[color:var(--good)]/10 text-[color:var(--good)]",
              bad && "bg-[color:var(--bad)]/10 text-[color:var(--bad)]",
              !good && !bad && "bg-[color:var(--ink-4)]/10 text-[color:var(--ink-3)]",
            )}
          >
            {up ? (
              <ArrowUpRight className="h-3 w-3 shrink-0" />
            ) : down ? (
              <ArrowDownRight className="h-3 w-3 shrink-0" />
            ) : (
              <Minus className="h-3 w-3 shrink-0" />
            )}
            <span className="truncate">
              {delta.value > 0 ? "+" : ""}
              {delta.value.toFixed(1)}%
              {delta.label && (
                <span className="text-[color:var(--ink-4)]"> {delta.label}</span>
              )}
            </span>
          </span>
        )}
      </div>
      {hint && (
        <p className={cn("mt-2 text-xs", emphasis === "inverse" ? "text-[color:var(--bg)]/60" : "text-[color:var(--ink-4)]")}>
          {hint}
        </p>
      )}
    </div>
  );
}
