interface FunnelData {
  impressions: number;
  clicks: number;
  visits: number;
  leads: number;
  opportunities: number;
  meetings: number;
  sales: number;
}

export function DashboardFunnel({ funnel }: { funnel: FunnelData }) {
  const stages = [
    { label: "Impressoes", value: funnel.impressions, sub: "Meta Ads 30d" },
    { label: "Cliques", value: funnel.clicks, sub: funnel.impressions > 0 ? `CTR ${((funnel.clicks / funnel.impressions) * 100).toFixed(2)}%` : "" },
    { label: "Visitas LP", value: funnel.visits, sub: "" },
    { label: "Leads", value: funnel.leads, sub: funnel.visits > 0 ? `Conv ${((funnel.leads / funnel.visits) * 100).toFixed(1)}%` : "" },
    { label: "Oportunidades", value: funnel.opportunities, sub: "" },
    { label: "Reunioes", value: funnel.meetings, sub: "" },
    { label: "Vendas", value: funnel.sales, sub: funnel.leads > 0 ? `Close ${((funnel.sales / Math.max(funnel.leads, 1)) * 100).toFixed(1)}%` : "" },
  ];
  const max = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="space-y-2">
      {stages.map((stage, i) => {
        const pct = (stage.value / max) * 100;
        const prev = i > 0 ? stages[i - 1]!.value : null;
        const conv = prev && prev > 0 ? (stage.value / prev) * 100 : null;
        return (
          <div key={stage.label}>
            <div className="mb-0.5 flex items-baseline justify-between text-xs">
              <span className="text-[color:var(--ink-2)]">{stage.label}</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-medium">{stage.value.toLocaleString("pt-BR")}</span>
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
