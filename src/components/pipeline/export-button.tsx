"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ContactRow, DealRow, StageRow } from "@/lib/queries/crm";

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

export function PipelineExportButton({
  deals,
  stages,
  contacts,
  pipelineName,
  status,
}: {
  deals: DealRow[];
  stages: StageRow[];
  contacts: ContactRow[];
  pipelineName: string;
  status: string;
}) {
  function handleExport() {
    if (deals.length === 0) {
      toast.error("Nada pra exportar");
      return;
    }
    const stageById = new Map(stages.map((s) => [s.id, s]));
    const contactById = new Map(contacts.map((c) => [c.id, c]));
    const headers = [
      "titulo",
      "estagio",
      "valor",
      "status",
      "origem",
      "contato",
      "email",
      "telefone",
      "fechamento_previsto",
      "criado_em",
      "fechado_em",
    ];
    const lines = [headers.join(",")];
    for (const d of deals) {
      const stage = stageById.get(d.stage_id);
      const contact = d.contact_id ? contactById.get(d.contact_id) : null;
      lines.push(
        [
          d.title,
          stage?.name ?? "",
          Number(d.value || 0).toFixed(2),
          d.status,
          d.source ?? "",
          contact?.name ?? "",
          contact?.email ?? "",
          contact?.phone ?? "",
          d.expected_close_date ?? "",
          d.created_at,
          d.closed_at ?? "",
        ]
          .map(escapeCsv)
          .join(","),
      );
    }
    const stamp = new Date().toISOString().slice(0, 10);
    const slug = pipelineName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    downloadCsv(`pipeline-${slug}-${status}-${stamp}.csv`, lines.join("\n"));
    toast.success(`${deals.length} negocios exportados`);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={deals.length === 0}
    >
      <Download className="mr-1 h-4 w-4" /> Exportar
    </Button>
  );
}
