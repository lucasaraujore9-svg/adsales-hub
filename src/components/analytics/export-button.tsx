"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Kpis {
  revenue: number;
  cac: number;
  roas: number;
  ltvcac: number;
  wonCount: number;
  cost: number;
}

interface SourceRow {
  source: string;
  leads: number;
  revenue: number;
  cost: number;
}

interface SellerRow {
  name: string;
  open: number;
  won: number;
  revenue: number;
}

interface Funnel {
  impressions: number;
  clicks: number;
  leads: number;
  opportunities: number;
  meetings: number;
  sales: number;
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

export function AnalyticsExportButton({
  periodLabel,
  kpis,
  sources,
  sellers,
  funnel,
}: {
  periodLabel: string;
  kpis: Kpis;
  sources: SourceRow[];
  sellers: SellerRow[];
  funnel: Funnel;
}) {
  function handleExport() {
    const lines: string[] = [];
    lines.push("AdSales Hub - Analytics Export");
    lines.push(`Periodo,${escapeCsv(periodLabel)}`);
    lines.push(`Gerado em,${escapeCsv(new Date().toISOString())}`);
    lines.push("");
    lines.push("KPI,Valor");
    lines.push(`Receita gerada,${kpis.revenue.toFixed(2)}`);
    lines.push(`Investimento (lead_sources.cost),${kpis.cost.toFixed(2)}`);
    lines.push(`CAC,${kpis.cac.toFixed(2)}`);
    lines.push(`ROAS,${kpis.roas.toFixed(2)}`);
    lines.push(`LTV/CAC,${kpis.ltvcac.toFixed(2)}`);
    lines.push(`Negocios fechados,${kpis.wonCount}`);
    lines.push("");
    lines.push("Funil");
    lines.push("Etapa,Quantidade");
    lines.push(`Impressoes,${funnel.impressions}`);
    lines.push(`Cliques,${funnel.clicks}`);
    lines.push(`Leads,${funnel.leads}`);
    lines.push(`Oportunidades,${funnel.opportunities}`);
    lines.push(`Reunioes,${funnel.meetings}`);
    lines.push(`Vendas,${funnel.sales}`);

    if (sources.length > 0) {
      lines.push("");
      lines.push("Atribuicao por origem");
      lines.push("Origem,Leads,Receita,Custo");
      for (const s of sources) {
        lines.push(
          `${escapeCsv(s.source)},${s.leads},${s.revenue.toFixed(2)},${s.cost.toFixed(2)}`,
        );
      }
    }

    if (sellers.length > 0) {
      lines.push("");
      lines.push("Performance vendedores");
      lines.push("Vendedor,Abertos,Ganhos,Receita");
      for (const s of sellers) {
        lines.push(
          `${escapeCsv(s.name)},${s.open},${s.won},${s.revenue.toFixed(2)}`,
        );
      }
    }

    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`analytics-${stamp}.csv`, lines.join("\n"));
    toast.success("Analytics exportado");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-1 h-4 w-4" /> Exportar
    </Button>
  );
}
