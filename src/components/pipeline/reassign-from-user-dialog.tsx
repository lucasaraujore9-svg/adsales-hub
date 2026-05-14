"use client";

import { useState, useTransition } from "react";
import { UserCog } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { reassignAllDealsFromUser } from "@/lib/actions/deals";

interface Member {
  id: string;
  name: string | null;
  email: string;
}

interface Props {
  members: Member[];
}

/**
 * Dialog para gestores transferirem todos os deals abertos de um vendedor
 * para outro. Útil quando alguém sai da equipe.
 */
export function ReassignFromUserDialog({ members }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fromId || !toId) return;
    start(async () => {
      const r = await reassignAllDealsFromUser({
        fromOwnerId: fromId,
        toOwnerId: toId,
        onlyOpen,
      });
      if (r.ok && r.data) {
        toast.success(`${r.data.count} negócio(s) reatribuído(s)`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserCog className="mr-1 h-4 w-4" /> Reatribuir em massa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transferir negócios entre vendedores</DialogTitle>
          <DialogDescription>
            Move todos os negócios de um vendedor para outro. Útil quando alguém sai da equipe ou troca de carteira.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from">De (vendedor atual)</Label>
            <select
              id="from"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              required
              className="w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
            >
              <option value="">Selecione um vendedor</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name ?? m.email}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">Para (novo vendedor)</Label>
            <select
              id="to"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              required
              className="w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
            >
              <option value="">Selecione um vendedor</option>
              {members
                .filter((m) => m.id !== fromId)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name ?? m.email}
                  </option>
                ))}
            </select>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Apenas negócios abertos
              <span className="block text-xs text-[color:var(--ink-3)]">
                Marcado: ignora negócios já ganhos ou perdidos.
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
            <Button type="submit" disabled={pending || !fromId || !toId}>
              {pending ? "Reatribuindo..." : "Reatribuir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
