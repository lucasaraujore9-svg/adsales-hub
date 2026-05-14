"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { convertConversationToDeal } from "@/lib/actions/inbox-ops";

interface Props {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  defaultTitle: string;
}

export function ConvertToDealDialog({ open, onClose, conversationId, defaultTitle }: Props) {
  const [title, setTitle] = useState(defaultTitle);
  const [value, setValue] = useState("0");
  const [pending, start] = useTransition();

  function submit() {
    const fd = new FormData();
    fd.set("conversation_id", conversationId);
    fd.set("title", title);
    fd.set("value", value);
    start(async () => {
      try {
        await convertConversationToDeal(fd);
        toast.success("Negocio criado");
        onClose();
      } catch (err) {
        if (err instanceof Error && err.message?.includes("NEXT_REDIRECT")) {
          return;
        }
        toast.error("Nao foi possível criar o negocio");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[color:var(--panel)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[color:var(--accent)]" />
            Converter em negocio
          </DialogTitle>
          <DialogDescription>
            O contato sera colocado na primeira etapa do pipeline padrao.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="deal-title">Titulo do negocio</Label>
            <Input
              id="deal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="deal-value">Valor estimado (R$)</Label>
            <Input
              id="deal-value"
              type="number"
              min={0}
              step={100}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={pending || title.trim().length < 2}>
            {pending ? "Criando..." : "Criar negocio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
