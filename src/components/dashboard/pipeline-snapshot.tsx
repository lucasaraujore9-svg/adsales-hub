import { MOCK_DEALS, STAGES, formatCurrencyBRL } from "@/lib/mock/crm";

export function PipelineSnapshot() {
  const buckets = STAGES.filter((s) => s.id !== "perdido").map((stage) => {
    const items = MOCK_DEALS.filter((d) => d.stage === stage.id && d.status === "open");
    const total = items.reduce((acc, d) => acc + d.value, 0);
    const weighted = items.reduce((acc, d) => acc + d.value * (stage.probability / 100), 0);
    return { ...stage, count: items.length, total, weighted };
  });

  const maxTotal = Math.max(...buckets.map((b) => b.total), 1);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {buckets.map((b) => (
        <div
          key={b.id}
          className="rounded-xl border border-[color:var(--line)] bg-[color:var(--bg)] p-3"
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: b.color }}
            />
            <span className="text-xs font-medium text-[color:var(--ink-2)]">{b.label}</span>
            <span className="ml-auto text-[10px] text-[color:var(--ink-4)]">{b.count}</span>
          </div>
          <div className="mt-2 font-mono text-lg font-medium tracking-tight">
            {formatCurrencyBRL(b.total)}
          </div>
          <div className="mt-0.5 text-[10px] text-[color:var(--ink-4)]">
            ponderado {formatCurrencyBRL(b.weighted)}
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[color:var(--bg-2)]">
            <div
              className="h-full rounded-full"
              style={{ width: `${(b.total / maxTotal) * 100}%`, backgroundColor: b.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
