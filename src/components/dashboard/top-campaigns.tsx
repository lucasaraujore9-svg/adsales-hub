import Link from "next/link";
import { MOCK_CAMPAIGNS, CAMPAIGN_STATUS_LABELS, type MockCampaign } from "@/lib/mock/marketing";
import { formatCurrencyBRL } from "@/lib/mock/crm";
import { StatusBadge } from "@/components/shared/status-badge";
import { Sparkline } from "@/components/shared/sparkline";

function miniTrend(seed: number): number[] {
  return Array.from({ length: 10 }).map((_, i) =>
    Math.abs(Math.sin((i + 1) * 0.7 + seed) + 0.3 * Math.cos(i * 0.4 + seed * 2)),
  );
}

export function TopCampaigns() {
  const top = [...MOCK_CAMPAIGNS]
    .filter((c) => c.spend > 0)
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 4);

  return (
    <div className="divide-y divide-[color:var(--line)]">
      {top.map((c, i) => {
        const statusTone = c.status === "active" ? "good" : c.status === "paused" ? "warn" : "neutral";
        return (
          <Link
            key={c.id}
            href={`/campanhas/${c.id}`}
            className="flex items-center gap-4 px-1 py-3 transition-colors hover:bg-[color:var(--bg-2)]"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{c.name}</span>
                <StatusBadge
                  label={CAMPAIGN_STATUS_LABELS[c.status].label}
                  tone={statusTone}
                />
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-[color:var(--ink-3)]">
                <span>{c.leads} leads</span>
                <span>·</span>
                <span>CPL {formatCurrencyBRL(c.cpl)}</span>
                <span>·</span>
                <span>ROAS {c.roas.toFixed(1)}x</span>
              </div>
            </div>
            <div className="hidden w-24 sm:block">
              <Sparkline data={miniTrend(i)} height={28} />
            </div>
            <div className="w-20 text-right">
              <div className="font-mono text-sm font-medium">{formatCurrencyBRL(c.spend)}</div>
              <div className="text-[10px] text-[color:var(--ink-4)]">gasto</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function SmallCampaignRow({ c }: { c: MockCampaign }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="truncate">{c.name}</span>
      <span className="font-mono text-xs text-[color:var(--ink-3)]">{formatCurrencyBRL(c.spend)}</span>
    </div>
  );
}
