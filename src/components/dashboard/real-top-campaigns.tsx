import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";

interface Campaign {
  id: string;
  name: string;
  status: string;
  leads: number;
  spend: number;
  cpl: number;
  roas: number;
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function DashboardTopCampaigns({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) {
    return (
      <p className="py-4 text-sm text-[color:var(--ink-3)]">
        Nenhuma campanha com gasto nos ultimos 30 dias. Crie uma em{" "}
        <Link href="/campanhas/nova" className="text-[color:var(--accent)]">
          /campanhas/nova
        </Link>
        .
      </p>
    );
  }
  return (
    <div className="divide-y divide-[color:var(--line)]">
      {campaigns.map((c) => {
        const tone =
          c.status === "active" ? "good" : c.status === "paused" ? "warn" : "neutral";
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
                  label={c.status === "active" ? "Ativa" : c.status === "paused" ? "Pausada" : c.status}
                  tone={tone}
                />
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-[color:var(--ink-3)]">
                <span>{c.leads} leads</span>
                <span>·</span>
                <span>CPL {formatBRL(c.cpl)}</span>
                <span>·</span>
                <span>ROAS {c.roas.toFixed(1)}x</span>
              </div>
            </div>
            <div className="w-20 text-right">
              <div className="font-mono text-sm font-medium">{formatBRL(c.spend)}</div>
              <div className="text-[10px] text-[color:var(--ink-4)]">gasto</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
