"use client";

import { useState, useTransition } from "react";
import { Code2, Copy, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { duplicateForm, toggleFormActive } from "@/lib/actions/content";

interface Props {
  formId: string;
  formName: string;
  formSlug: string;
  isActive: boolean;
}

export function FormRowActions({ formId, formName, formSlug, isActive }: Props) {
  const router = useRouter();
  const [embedOpen, setEmbedOpen] = useState(false);
  const [pending, start] = useTransition();

  function handleDuplicate() {
    start(async () => {
      const result = await duplicateForm(formId);
      if (result.ok) {
        toast.success("Formulario duplicado");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleToggle() {
    start(async () => {
      const result = await toggleFormActive({ id: formId, active: !isActive });
      if (result.ok) {
        toast.success(isActive ? "Formulario desativado" : "Formulario ativado");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function copyEmbed(snippet: string) {
    navigator.clipboard.writeText(snippet).then(() => toast.success("Copiado"));
  }

  const baseOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://app";
  const inlineSnippet = `<iframe src="${baseOrigin}/embed/forms/${formSlug}" width="100%" height="540" frameborder="0" style="border:0;border-radius:12px"></iframe>`;
  const scriptSnippet = `<script async src="${baseOrigin}/embed/forms/${formSlug}.js" data-form="${formSlug}"></script>`;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setEmbedOpen(true)}
        title="Embed"
      >
        <Code2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDuplicate}
        disabled={pending}
        title="Duplicar"
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={pending}
        title={isActive ? "Desativar" : "Ativar"}
      >
        <Settings2 className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={embedOpen} onOpenChange={setEmbedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Embed: {formName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <div className="kicker">Iframe (recomendado)</div>
              <div className="mt-2 flex items-start gap-2">
                <pre className="flex-1 max-w-full overflow-x-auto rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] p-3 text-xs">
                  <code>{inlineSnippet}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyEmbed(inlineSnippet)}
                >
                  Copiar
                </Button>
              </div>
            </div>
            <div>
              <div className="kicker">Script tag</div>
              <div className="mt-2 flex items-start gap-2">
                <pre className="flex-1 max-w-full overflow-x-auto rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] p-3 text-xs">
                  <code>{scriptSnippet}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyEmbed(scriptSnippet)}
                >
                  Copiar
                </Button>
              </div>
            </div>
            <p className="text-xs text-[color:var(--ink-3)]">
              Submissoes deste formulario alimentam diretamente o pipeline (lead automatico).
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
