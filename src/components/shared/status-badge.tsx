import { cn } from "@/lib/utils";

type Tone = "good" | "warn" | "bad" | "accent" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  good: "bg-[color:var(--good)]/10 text-[color:var(--good)] border-[color:var(--good)]/30",
  warn: "bg-[color:var(--warn)]/10 text-[color:var(--warn)] border-[color:var(--warn)]/30",
  bad: "bg-[color:var(--bad)]/10 text-[color:var(--bad)] border-[color:var(--bad)]/30",
  accent: "bg-[color:var(--accent)]/10 text-[color:var(--accent)] border-[color:var(--accent)]/30",
  neutral: "bg-[color:var(--bg-2)] text-[color:var(--ink-3)] border-[color:var(--line-2)]",
};

interface Props {
  label: string;
  tone?: Tone;
  className?: string;
}

export function StatusBadge({ label, tone = "neutral", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border px-2 py-0.5 text-[11px] font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
