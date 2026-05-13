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
import { createLandingPage } from "@/lib/actions/content";

export function NewLandingButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const body = {
      name: String(form.get("name") ?? ""),
      slug: String(form.get("slug") ?? "").toLowerCase(),
    };
    start(async () => {
      const result = await createLandingPage(body);
      if (result.ok && result.data) {
        toast.success("Landing criada");
        setOpen(false);
        router.push(`/marketing/landing-pages/${result.data.id}`);
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" /> Nova landing
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova landing page</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="nl-name">Nome</Label>
            <Input
              id="nl-name"
              name="name"
              required
              autoFocus
              placeholder="LP Black Friday 2026"
            />
          </div>
          <div>
            <Label htmlFor="nl-slug">Slug</Label>
            <Input
              id="nl-slug"
              name="slug"
              required
              pattern="[a-z][a-z0-9-]*"
              placeholder="black-friday-2026"
            />
            <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
              Vai virar URL: <code className="font-mono">/{`{slug}`}</code> no dominio configurado.
              Inicia com 1 bloco hero.
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
