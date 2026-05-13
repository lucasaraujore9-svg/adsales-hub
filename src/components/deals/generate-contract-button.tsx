"use client";

import { useState, useTransition } from "react";
import { FileSignature, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateContractFromTemplate } from "@/lib/actions/contracts";

interface TemplateOption {
  id: string;
  name: string;
}

interface Signer {
  name: string;
  email: string;
  role: "signer" | "witness" | "approver";
}

export function GenerateContractButton({
  dealId,
  templates,
  defaultContact,
}: {
  dealId: string;
  templates: TemplateOption[];
  defaultContact: { name: string; email: string } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [signers, setSigners] = useState<Signer[]>(
    defaultContact ? [{ ...defaultContact, role: "signer" }] : [],
  );

  function addSigner() {
    setSigners((prev) => [...prev, { name: "", email: "", role: "signer" }]);
  }
  function removeSigner(idx: number) {
    setSigners((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateSigner(idx: number, patch: Partial<Signer>) {
    setSigners((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function handleSubmit(form: FormData) {
    if (signers.length === 0) {
      toast.error("Adicione ao menos um signatario");
      return;
    }
    if (signers.some((s) => !s.email || !s.name)) {
      toast.error("Preencha nome + email de todos");
      return;
    }
    const body = {
      deal_id: dealId,
      template_id: String(form.get("template_id") ?? ""),
      signers,
      expires_in_days: Number(form.get("expires_in_days") ?? 30),
    };
    start(async () => {
      const result = await generateContractFromTemplate(body);
      if (result.ok && result.data) {
        toast.success("Contrato gerado");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  if (templates.length === 0) {
    return (
      <Button asChild variant="outline" size="sm">
        <a href="/configuracoes/contratos">
          <FileSignature className="mr-1 h-4 w-4" /> Criar template primeiro
        </a>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <FileSignature className="mr-1 h-4 w-4" /> Gerar contrato
      </Button>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Gerar contrato + assinatura</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="gc-template">Template</Label>
              <select
                id="gc-template"
                name="template_id"
                required
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                <option value="">Selecionar...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="gc-expires">Validade (dias)</Label>
              <Input
                id="gc-expires"
                name="expires_in_days"
                type="number"
                min={1}
                max={180}
                defaultValue={30}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label>Signatarios (ordem importa)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSigner}>
                <Plus className="mr-1 h-3 w-3" /> Adicionar
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              {signers.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] p-3"
                >
                  <span className="mt-1 font-mono text-xs text-[color:var(--ink-4)]">
                    {idx + 1}.
                  </span>
                  <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-3">
                    <Input
                      value={s.name}
                      onChange={(e) => updateSigner(idx, { name: e.target.value })}
                      placeholder="Nome"
                      required
                    />
                    <Input
                      type="email"
                      value={s.email}
                      onChange={(e) => updateSigner(idx, { email: e.target.value })}
                      placeholder="email@cliente.com"
                      required
                    />
                    <select
                      value={s.role}
                      onChange={(e) =>
                        updateSigner(idx, {
                          role: e.target.value as Signer["role"],
                        })
                      }
                      className="rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 text-xs"
                    >
                      <option value="signer">Signatario</option>
                      <option value="witness">Testemunha</option>
                      <option value="approver">Aprovador</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSigner(idx)}
                    className="text-[color:var(--ink-4)] hover:text-[color:var(--bad)]"
                    aria-label="Remover"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {signers.length === 0 && (
                <p className="rounded-md border border-dashed border-[color:var(--line-2)] p-4 text-center text-xs text-[color:var(--ink-3)]">
                  Adicione pelo menos um signatario.
                </p>
              )}
            </div>
          </div>

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
              {pending ? "Gerando..." : "Gerar contrato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
