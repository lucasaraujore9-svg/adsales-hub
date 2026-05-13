"use client";

import { useState, useTransition } from "react";
import { Plus, RefreshCw, Upload } from "lucide-react";
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
import { createAudience, syncCrmAudience } from "@/lib/actions/audiences";

const TYPES = [
  { key: "saved", label: "Salvo (interesses + demografia)" },
  { key: "lookalike", label: "Lookalike (semelhante a clientes)" },
  { key: "retargeting", label: "Retargeting (visitantes/leads)" },
  { key: "custom", label: "Customizado (lista própria)" },
] as const;

export function AudienceActions() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  async function handleCreate(form: FormData) {
    const body = {
      name: String(form.get("name") ?? ""),
      type: String(form.get("type") ?? "saved") as
        | "saved"
        | "lookalike"
        | "retargeting"
        | "custom",
      config: {
        notes: String(form.get("notes") ?? ""),
      },
    };
    start(async () => {
      const result = await createAudience(body);
      if (result.ok) {
        toast.success("Publico criado");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleSyncCrm() {
    start(async () => {
      const result = await syncCrmAudience();
      if (result.ok && result.data) {
        toast.success(
          result.data.created
            ? `Publico "CRM Customers" criado com ${result.data.size} contatos`
            : `Publico "CRM Customers" atualizado: ${result.data.size} contatos`,
        );
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleImport() {
    toast.info("Importacao de CSV chegando em breve. Use 'Novo publico' por enquanto.");
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleSyncCrm} disabled={pending}>
        <RefreshCw className={`mr-1 h-4 w-4 ${pending ? "animate-spin" : ""}`} /> Sync CRM
      </Button>
      <Button variant="outline" size="sm" onClick={handleImport}>
        <Upload className="mr-1 h-4 w-4" /> Importar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Novo publico
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo publico</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-3">
            <div>
              <Label htmlFor="aud-name">Nome</Label>
              <Input
                id="aud-name"
                name="name"
                required
                autoFocus
                placeholder="Ex: SP - Diretores B2B"
              />
            </div>
            <div>
              <Label htmlFor="aud-type">Tipo</Label>
              <select
                id="aud-type"
                name="type"
                defaultValue="saved"
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                {TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="aud-notes">Anotacoes (opcional)</Label>
              <Input
                id="aud-notes"
                name="notes"
                placeholder="Faixa etaria, interesses, etc."
              />
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
                Criar publico
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
