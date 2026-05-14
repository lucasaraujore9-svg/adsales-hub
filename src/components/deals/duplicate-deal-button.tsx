"use client";

import { useState, useTransition } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { duplicateDeal } from "@/lib/actions/deals";

interface Props {
  dealId: string;
  dealTitle: string;
}

export function DuplicateDealButton({ dealId, dealTitle }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [newTitle, setNewTitle] = useState(`${dealTitle} (cópia)`);
  const [copyContact, setCopyContact] = useState(true);
  const [copyNotes, setCopyNotes] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await duplicateDeal({
        dealId,
        newTitle: newTitle.trim() || undefined,
        copyContact,
        copyNotes,
      });
      if (r.ok && r.data) {
        toast.success("Negócio duplicado");
        setOpen(false);
        router.push(`/negocios/${r.data.id}`);
      } else {
        toast.error(r.error ?? "Falha ao duplicar");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Copy className="mr-1 h-4 w-4" /> Duplicar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicar negócio</DialogTitle>
          <DialogDescription>
            Cria um novo negócio com as mesmas informações no primeiro estágio do pipeline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_title">Título do novo negócio</Label>
            <Input
              id="new_title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={copyContact}
              onChange={(e) => setCopyContact(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Manter contato e empresa
              <span className="block text-xs text-[color:var(--ink-3)]">
                Útil para renovações ou novos produtos para o mesmo cliente.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={copyNotes}
              onChange={(e) => setCopyNotes(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Copiar notas
              <span className="block text-xs text-[color:var(--ink-3)]">
                Todas as notas do negócio original serão copiadas como suas.
              </span>
            </span>
          </label>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Duplicando..." : "Duplicar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
