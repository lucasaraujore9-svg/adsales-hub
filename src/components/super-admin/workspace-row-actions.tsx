"use client";

import { useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  grantCredits,
  setWorkspaceBasket,
  toggleUnlimitedCredits,
} from "@/lib/actions/super-admin";

interface Props {
  workspaceId: string;
  currentBasket: string | null;
  unlimited: boolean;
}

const BASKETS = ["operação", "crescimento", "escala", "custom", "master"] as const;

export function WorkspaceRowActions({ workspaceId, currentBasket, unlimited }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState<"grant" | "basket" | null>(null);
  const [pending, start] = useTransition();
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [basket, setBasket] = useState(currentBasket ?? "operação");

  function handleGrant() {
    start(async () => {
      const r = await grantCredits({
        workspace_id: workspaceId,
        amount: Number(amount),
        note: note || undefined,
      });
      if (r.ok) {
        toast.success(`Concedido. Saldo agora: ${r.data?.balance ?? 0}.`);
        setOpen(null);
        setAmount("100");
        setNote("");
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha");
      }
    });
  }

  function handleSetBasket() {
    start(async () => {
      const r = await setWorkspaceBasket({
        workspace_id: workspaceId,
        basket_name: basket,
      });
      if (r.ok) {
        toast.success(`Plano alterado para ${basket}.`);
        setOpen(null);
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha");
      }
    });
  }

  function handleToggleUnlimited() {
    start(async () => {
      const r = await toggleUnlimitedCredits({
        workspace_id: workspaceId,
        unlimited: !unlimited,
      });
      if (r.ok) {
        toast.success(unlimited ? "Limite reativado." : "Creditos ilimitados ativados.");
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha");
      }
    });
  }

  return (
    <>
      <div className="flex justify-end gap-1">
        <Button size="sm" variant="outline" onClick={() => setOpen("grant")}>
          + creditos
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen("basket")}>
          plano
        </Button>
        <Button
          size="sm"
          variant={unlimited ? "default" : "outline"}
          onClick={handleToggleUnlimited}
          disabled={pending}
        >
          {unlimited ? "ilimitado ✓" : "ilimitado"}
        </Button>
      </div>

      <Dialog open={open === "grant"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conceder creditos</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="amt">Quantidade</Label>
              <Input
                id="amt"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="note">Nota (opcional)</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="ex: bonus de boas-vindas"
              />
            </div>
            <p className="text-[11px] text-[color:var(--ink-4)]">
              Cria uma transacao do tipo <span className="font-mono">purchase</span> com origem manual.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={handleGrant} disabled={pending || Number(amount) < 1}>
              {pending ? "Concedendo..." : `Conceder ${amount}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open === "basket"} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar plano</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Plano</Label>
            <div className="flex flex-wrap gap-1.5">
              {BASKETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBasket(b)}
                  className={`rounded-pill border px-3 py-1 text-xs font-medium uppercase transition-colors ${
                    basket === b
                      ? b === "master"
                        ? "border-[color:var(--bad)]/40 bg-[color:var(--bad)]/10 text-[color:var(--bad)]"
                        : "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                      : "border-[color:var(--line-2)] text-[color:var(--ink-3)]"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[color:var(--ink-4)]">
              Ao escolher <span className="font-mono">master</span>, a assinatura fica ativa por 100
              anos sem cobranca.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(null)} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={handleSetBasket} disabled={pending}>
              {pending ? "Salvando..." : `Definir ${basket}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
