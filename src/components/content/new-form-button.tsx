"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
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
import { createForm } from "@/lib/actions/content";

export function NewFormButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const body = {
      name: String(form.get("name") ?? ""),
      slug: String(form.get("slug") ?? "").toLowerCase(),
    };
    start(async () => {
      const result = await createForm(body);
      if (result.ok && result.data) {
        toast.success("Formulario criado");
        setOpen(false);
        router.push(`/marketing/formularios/${result.data.id}`);
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" /> Novo formulario
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo formulario</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="nf-name">Nome</Label>
            <Input
              id="nf-name"
              name="name"
              required
              autoFocus
              placeholder="Captura de leads — site"
            />
          </div>
          <div>
            <Label htmlFor="nf-slug">Slug (URL)</Label>
            <Input
              id="nf-slug"
              name="slug"
              required
              pattern="[a-z][a-z0-9-]*"
              placeholder="captura-leads-site"
            />
            <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
              Vai virar URL: <code className="font-mono">/forms/&#123;slug&#125;</code>. Inicia com 2
              campos padrao (nome + email) que voce edita depois.
            </p>
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
              Criar e editar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
