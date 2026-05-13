"use client";

import { Download, Mail, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ReportRowActions({
  pdfUrl,
  reportName,
  status,
}: {
  pdfUrl: string | null;
  reportName: string;
  status: string;
}) {
  function handleDownload() {
    if (!pdfUrl) {
      toast.error(
        status === "generating" ? "Relatorio ainda gerando..." : "PDF nao disponivel",
      );
      return;
    }
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }

  function handleShare() {
    if (!pdfUrl) {
      toast.error("PDF nao disponivel para compartilhar");
      return;
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({ title: reportName, url: pdfUrl })
        .catch(() => navigator.clipboard.writeText(pdfUrl).then(() => toast.success("Link copiado")));
    } else {
      navigator.clipboard
        .writeText(pdfUrl)
        .then(() => toast.success("Link copiado"))
        .catch(() => toast.error("Nao foi possivel copiar"));
    }
  }

  function handleEmail() {
    toast.info("Envio por email integra com /configuracoes/relatorios (agendamento) — em breve.");
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleDownload} title="Baixar PDF">
        <Download className="h-3.5 w-3.5" />
      </Button>
      <Button variant="outline" size="sm" onClick={handleShare} title="Compartilhar">
        <Share2 className="h-3.5 w-3.5" />
      </Button>
      <Button variant="outline" size="sm" onClick={handleEmail} title="Enviar por email">
        <Mail className="h-3.5 w-3.5" />
      </Button>
    </>
  );
}
