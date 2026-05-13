"use client";

import { useState, useTransition } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { importContacts } from "@/lib/actions/contacts";
import type { CompanyRow, ContactRow } from "@/lib/queries/crm";

interface ParsedRow {
  name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  position?: string | null;
  company_name?: string | null;
  lifecycle_stage:
    | "lead"
    | "mql"
    | "sql"
    | "opportunity"
    | "customer"
    | "lost";
  source?: string | null;
}

const HEADER_ALIASES: Record<string, keyof ParsedRow> = {
  nome: "name",
  name: "name",
  email: "email",
  "e-mail": "email",
  telefone: "phone",
  phone: "phone",
  whatsapp: "whatsapp",
  cargo: "position",
  position: "position",
  empresa: "company_name",
  company: "company_name",
  company_name: "company_name",
  fase: "lifecycle_stage",
  lifecycle: "lifecycle_stage",
  lifecycle_stage: "lifecycle_stage",
  origem: "source",
  source: "source",
};

const LIFECYCLE_VALUES = new Set([
  "lead",
  "mql",
  "sql",
  "opportunity",
  "customer",
  "lost",
]);

function parseCsv(text: string): { rows: ParsedRow[]; errors: string[] } {
  const errors: string[] = [];
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) {
    errors.push("CSV precisa de cabecalho + ao menos 1 linha.");
    return { rows: [], errors };
  }

  const splitLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((ch === "," || ch === ";") && !inQuotes) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };

  const headerCells = splitLine(lines[0]).map((h) => h.toLowerCase());
  const colMap: Record<number, keyof ParsedRow> = {};
  headerCells.forEach((h, i) => {
    const key = HEADER_ALIASES[h];
    if (key) colMap[i] = key;
  });

  if (!Object.values(colMap).includes("name")) {
    errors.push("Coluna 'nome' (ou 'name') e obrigatoria.");
    return { rows: [], errors };
  }

  const rows: ParsedRow[] = [];
  for (let lineIdx = 1; lineIdx < lines.length; lineIdx++) {
    const cells = splitLine(lines[lineIdx]);
    const row: ParsedRow = { name: "", lifecycle_stage: "lead" };
    for (let i = 0; i < cells.length; i++) {
      const key = colMap[i];
      if (!key) continue;
      const value = cells[i].trim();
      if (key === "lifecycle_stage") {
        row.lifecycle_stage = LIFECYCLE_VALUES.has(value)
          ? (value as ParsedRow["lifecycle_stage"])
          : "lead";
      } else if (key === "name") {
        row.name = value;
      } else if (value) {
        (row as unknown as Record<string, unknown>)[key] = value;
      }
    }
    if (row.name.length < 2) {
      errors.push(`Linha ${lineIdx + 1}: nome ausente ou muito curto, ignorada.`);
      continue;
    }
    rows.push(row);
  }

  return { rows, errors };
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

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function ImportExportButtons({
  contacts,
  companies,
}: {
  contacts: ContactRow[];
  companies: CompanyRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const companyById = new Map(companies.map((c) => [c.id, c]));

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const result = parseCsv(text);
      setParsed(result.rows);
      setErrors(result.errors);
    };
    reader.readAsText(file);
  }

  function handleImport() {
    if (!parsed || parsed.length === 0) return;
    start(async () => {
      const result = await importContacts({ rows: parsed });
      if (result.ok && result.data) {
        toast.success(
          `${result.data.inserted} contatos importados${
            result.data.companiesCreated > 0
              ? ` · ${result.data.companiesCreated} empresas criadas`
              : ""
          }${result.data.skipped > 0 ? ` · ${result.data.skipped} ignorados` : ""}`,
        );
        setParsed(null);
        setErrors([]);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro ao importar");
      }
    });
  }

  function handleExport() {
    const headers = [
      "nome",
      "email",
      "telefone",
      "whatsapp",
      "cargo",
      "empresa",
      "fase",
      "origem",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "criado_em",
    ];
    const lines = [headers.join(",")];
    for (const c of contacts) {
      const company = c.company_id ? companyById.get(c.company_id) : null;
      lines.push(
        [
          c.name,
          c.email,
          c.phone,
          c.whatsapp,
          c.position,
          company?.name,
          c.lifecycle_stage,
          c.source,
          c.utm_source,
          c.utm_medium,
          c.utm_campaign,
          c.created_at,
        ]
          .map(escapeCsv)
          .join(","),
      );
    }
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`contatos-${stamp}.csv`, lines.join("\n"));
    toast.success(`${contacts.length} contatos exportados`);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setParsed(null);
            setErrors([]);
            setOpen(true);
          }}
        >
          <Upload className="mr-1 h-4 w-4" /> Importar
        </Button>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Importar contatos via CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-[color:var(--ink-3)]">
              Use vírgula ou ponto e vírgula como separador. Cabeçalhos suportados:{" "}
              <span className="font-mono text-xs">
                nome (obrigatorio), email, telefone, whatsapp, cargo, empresa, fase, origem
              </span>
              .
            </p>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="block w-full text-xs file:mr-3 file:rounded-pill file:border file:border-[color:var(--line-2)] file:bg-[color:var(--bg)] file:px-3 file:py-1 file:text-xs file:font-medium hover:file:border-[color:var(--accent)]"
            />

            {errors.length > 0 && (
              <ul className="rounded-md border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/5 p-3 text-xs text-[color:var(--bad)]">
                {errors.slice(0, 5).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
                {errors.length > 5 && (
                  <li className="text-[color:var(--ink-3)]">
                    ...e mais {errors.length - 5} avisos
                  </li>
                )}
              </ul>
            )}

            {parsed && parsed.length > 0 && (
              <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--bg)] p-3">
                <div className="text-sm font-medium">
                  Pronto pra importar: {parsed.length} contato(s)
                </div>
                <div className="mt-1 text-xs text-[color:var(--ink-3)]">
                  Empresas novas serao criadas automaticamente. Origem e fase usadas conforme CSV
                  (default fase: lead).
                </div>
                <ul className="mt-2 max-h-40 overflow-y-auto text-xs text-[color:var(--ink-3)]">
                  {parsed.slice(0, 8).map((r, i) => (
                    <li key={i} className="truncate">
                      • {r.name} {r.email ? `· ${r.email}` : ""}{" "}
                      {r.company_name ? `(${r.company_name})` : ""}
                    </li>
                  ))}
                  {parsed.length > 8 && (
                    <li className="text-[color:var(--ink-4)]">...e mais {parsed.length - 8}</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={pending || !parsed || parsed.length === 0}
              onClick={handleImport}
            >
              {pending ? "Importando..." : `Importar ${parsed?.length ?? 0}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button size="sm" variant="outline" onClick={handleExport} disabled={contacts.length === 0}>
        <Download className="mr-1 h-4 w-4" /> Exportar
      </Button>
    </>
  );
}
