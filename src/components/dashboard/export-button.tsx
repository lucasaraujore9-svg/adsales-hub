"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface KpiSnapshot {
  periodLabel: string;
  totalSpend: number;
  totalLeads: number;
  avgCpl: number;
  avgRoas: number;
  pipelineTotal: number;
  pipelineCount: number;
  mrr: number;
  wonCount: number;
  wonTotal: number;
  spendDelta: number;
  leadsDelta: number;
  cplDelta: number;
  roasDelta: number;
  mrrDelta: number;
}

interface TopCampaignRow {
  name: string;
  spend: number;
  leads: number;
  roas: number;
}

interface FunnelRow {
  label: string;
  count: number;
}

interface SourceRow {
  label: string;
  count: number;
}

function escapeCsv(value: string | number | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function DashboardExportButton({
  kpis,
  topCampaigns,
  funnel,
  sources,
}: {
  kpis: KpiSnapshot;
  topCampaigns: TopCampaignRow[];
  funnel: FunnelRow[];
  sources: SourceRow[];
}) {
  function handleExport() {
    const lines: string[] = [];
    lines.push(`AdSales Hub - Dashboard Export`);
    lines.push(`Periodo,${escapeCsv(kpis.periodLabel)}`);
    lines.push(`Gerado em,${escapeCsv(new Date().toISOString())}`);
    lines.push("");
    lines.push("KPI,Valor,Variacao %");
    lines.push(`Investimento em midia,${kpis.totalSpend.toFixed(2)},${kpis.spendDelta.toFixed(1)}`);
    lines.push(`Leads gerados,${kpis.totalLeads},${kpis.leadsDelta.toFixed(1)}`);
    lines.push(`CPL medio,${kpis.avgCpl.toFixed(2)},${kpis.cplDelta.toFixed(1)}`);
    lines.push(`ROAS medio,${kpis.avgRoas.toFixed(2)}x,${kpis.roasDelta.toFixed(1)}`);
    lines.push(
      `Pipeline aberto,${kpis.pipelineTotal.toFixed(2)} (${kpis.pipelineCount} negocios),`,
    );
    lines.push(`MRR estimado,${kpis.mrr.toFixed(2)},${kpis.mrrDelta.toFixed(1)}`);
    lines.push(`Vendas fechadas,${kpis.wonCount},`);
    lines.push(`Receita ganha,${kpis.wonTotal.toFixed(2)},`);

    if (topCampaigns.length > 0) {
      lines.push("");
      lines.push("Top campanhas");
      lines.push("Nome,Investimento,Leads,ROAS");
      for (const c of topCampaigns) {
        lines.push(
          `${escapeCsv(c.name)},${c.spend.toFixed(2)},${c.leads},${c.roas.toFixed(2)}`,
        );
      }
    }

    if (funnel.length > 0) {
      lines.push("");
      lines.push("Funil unificado");
      lines.push("Etapa,Quantidade");
      for (const f of funnel) {
        lines.push(`${escapeCsv(f.label)},${f.count}`);
      }
    }

    if (sources.length > 0) {
      lines.push("");
      lines.push("Leads por origem");
      lines.push("Origem,Quantidade");
      for (const s of sources) {
        lines.push(`${escapeCsv(s.label)},${s.count}`);
      }
    }

    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`dashboard-${stamp}.csv`, lines.join("\n"));
    toast.success("Dashboard exportado");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-1 h-4 w-4" /> Exportar
    </Button>
  );
}
