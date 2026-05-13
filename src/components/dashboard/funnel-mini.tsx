import { UNIFIED_FUNNEL } from "@/lib/mock/analytics";

export function FunnelMini() {
  const max = UNIFIED_FUNNEL[0]!.value;
  return (
    <div className="space-y-2">
      {UNIFIED_FUNNEL.map((stage, i) => {
        const pct = (stage.value / max) * 100;
        const prev = i > 0 ? UNIFIED_FUNNEL[i - 1]!.value : null;
        const conv = prev ? (stage.value / prev) * 100 : null;
        return (
          <div key={stage.label} className="group">
            <div className="mb-0.5 flex items-baseline justify-between text-xs">
              <span className="text-[color:var(--ink-2)]">{stage.label}</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-medium">
                  {stage.value.toLocaleString("pt-BR")}
                </span>
                {conv !== null && (
                  <span className="text-[color:var(--ink-4)]">{conv.toFixed(1)}%</span>
                )}
              </div>
            </div>
            <div className="h-5 overflow-hidden rounded-md bg-[color:var(--bg-2)]">
              <div
                className="h-full rounded-md bg-[color:var(--accent)] transition-all"
                style={{ width: `${Math.max(pct, 3)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
