interface SliceData {
  source: string;
  label: string;
  count: number;
  color: string;
}

const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
  meta_ads: { label: "Meta Ads", color: "#1877F2" },
  google_ads: { label: "Google Ads", color: "#4285F4" },
  tiktok_ads: { label: "TikTok Ads", color: "#FE2C55" },
  linkedin_ads: { label: "LinkedIn Ads", color: "#0A66C2" },
  organic: { label: "Organico", color: "#22C55E" },
  prospecting: { label: "Prospeccao", color: "#FF5E1A" },
  referral: { label: "Indicacao", color: "#F5A524" },
  website: { label: "Site", color: "#A78BFA" },
  form: { label: "Formulario", color: "#06B6D4" },
  import: { label: "Importacao", color: "#94A3B8" },
  api: { label: "API", color: "#475569" },
  manual: { label: "Manual", color: "#6B7280" },
};

export function LeadsBySourceChart({ data }: { data: SliceData[] }) {
  const total = data.reduce((a, s) => a + s.count, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-sm text-[color:var(--ink-3)]">
        Sem leads atribuidos no periodo.
      </div>
    );
  }

  const radius = 56;
  const stroke = 18;
  const innerRadius = radius - stroke / 2;
  const cx = 80;
  const cy = 80;

  let cumulative = 0;
  const arcs = data.map((s) => {
    const start = cumulative / total;
    cumulative += s.count;
    const end = cumulative / total;
    const angle = (a: number) => 2 * Math.PI * a - Math.PI / 2;
    const x1 = cx + innerRadius * Math.cos(angle(start));
    const y1 = cy + innerRadius * Math.sin(angle(start));
    const x2 = cx + innerRadius * Math.cos(angle(end));
    const y2 = cy + innerRadius * Math.sin(angle(end));
    const largeArc = end - start > 0.5 ? 1 : 0;
    return {
      slice: s,
      d: `M ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
    };
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <svg width={160} height={160} viewBox="0 0 160 160" aria-label="Leads por origem">
        {arcs.map((a, i) => (
          <path
            key={i}
            d={a.d}
            stroke={a.slice.color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="butt"
          />
        ))}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="fill-[color:var(--ink)] font-mono text-xl font-medium"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          className="fill-[color:var(--ink-3)] text-[10px] uppercase tracking-kicker"
        >
          leads
        </text>
      </svg>

      <ul className="flex-1 space-y-2 text-xs">
        {data.map((s) => {
          const pct = ((s.count / total) * 100).toFixed(1);
          return (
            <li key={s.source} className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="flex-1 truncate text-[color:var(--ink-2)]">{s.label}</span>
              <span className="font-mono text-[color:var(--ink-3)]">{s.count}</span>
              <span className="font-mono text-[10px] text-[color:var(--ink-4)]">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function buildLeadsBySource(
  rows: { source_type: string }[],
): SliceData[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    counts.set(r.source_type, (counts.get(r.source_type) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => {
      const cfg = SOURCE_CONFIG[source] ?? { label: source, color: "#6B7280" };
      return { source, label: cfg.label, count, color: cfg.color };
    });
}
