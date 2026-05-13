"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateProposalFromTemplate } from "@/lib/actions/proposals";

interface TemplateOption {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_cycle: string;
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}

export function GenerateProposalButton({
  dealId,
  templates,
  products,
}: {
  dealId: string;
  templates: TemplateOption[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  function toggleProduct(id: string) {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleSubmit(form: FormData) {
    const body = {
      deal_id: dealId,
      template_id: String(form.get("template_id") ?? ""),
      product_ids: selectedProducts,
    };
    if (!body.template_id) {
      toast.error("Selecione um template");
      return;
    }
    start(async () => {
      const result = await generateProposalFromTemplate(body);
      if (result.ok && result.data) {
        toast.success("Proposta gerada");
        const previewUrl = `/proposta/${result.data.share_token}`;
        navigator.clipboard.writeText(window.location.origin + previewUrl).catch(() => undefined);
        toast.info("Link copiado pra clipboard");
        setOpen(false);
        router.refresh();
        window.open(previewUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  if (templates.length === 0) {
    return (
      <Button asChild variant="outline" size="sm">
        <a href="/configuracoes/contratos">
          <Sparkles className="mr-1 h-4 w-4" /> Criar template primeiro
        </a>
      </Button>
    );
  }

  const totalSelected = products
    .filter((p) => selectedProducts.includes(p.id))
    .reduce((a, p) => a + Number(p.price), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Sparkles className="mr-1 h-4 w-4" /> Gerar proposta
      </Button>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Gerar proposta</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="gp-template">Template</Label>
            <select
              id="gp-template"
              name="template_id"
              required
              className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
            >
              <option value="">Selecionar template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {products.length > 0 && (
            <div>
              <Label>Produtos (opcional — usa valor do deal se vazio)</Label>
              <div className="mt-2 max-h-60 space-y-1 overflow-y-auto rounded-md border border-[color:var(--line-2)] p-2">
                {products.map((p) => {
                  const active = selectedProducts.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProduct(p.id)}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                          : "hover:bg-[color:var(--bg-2)]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={active}
                          readOnly
                          className="pointer-events-none"
                        />
                        {p.name}
                      </span>
                      <span className="font-mono text-xs">{formatBRL(Number(p.price))}</span>
                    </button>
                  );
                })}
              </div>
              {selectedProducts.length > 0 && (
                <p className="mt-2 text-xs text-[color:var(--ink-3)]">
                  {selectedProducts.length} item(s) · Total {formatBRL(totalSelected)}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Gerando..." : "Gerar e abrir preview"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
