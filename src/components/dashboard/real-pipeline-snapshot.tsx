import { createServerSupabaseClient } from "@/lib/supabase/server";
import { listPipelinesAndStages } from "@/lib/queries/crm";
import type { DealRow } from "@/lib/queries/crm";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export async function DashboardPipelineSnapshot({
  deals,
  workspaceId,
}: {
  deals: DealRow[];
  workspaceId: string;
}) {
  const supabase = await createServerSupabaseClient();
  const { stages } = await listPipelinesAndStages(supabase, workspaceId);

  const buckets = stages
    .filter((s) => !s.is_lost)
    .sort((a, b) => a.position - b.position)
    .map((stage) => {
      const items = deals.filter((d) => d.stage_id === stage.id);
      const total = items.reduce((acc, d) => acc + Number(d.value || 0), 0);
      const weighted = items.reduce(
        (acc, d) => acc + Number(d.value || 0) * (stage.probability / 100),
        0,
      );
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
              style={{ backgroundColor: b.color ?? "#6366F1" }}
            />
            <span className="text-xs font-medium text-[color:var(--ink-2)]">{b.name}</span>
            <span className="ml-auto text-[10px] text-[color:var(--ink-4)]">{b.count}</span>
          </div>
          <div className="mt-2 font-mono text-lg font-medium tracking-tight">
            {formatBRL(b.total)}
          </div>
          <div className="mt-0.5 text-[10px] text-[color:var(--ink-4)]">
            ponderado {formatBRL(b.weighted)}
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[color:var(--bg-2)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(b.total / maxTotal) * 100}%`,
                backgroundColor: b.color ?? "#6366F1",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
