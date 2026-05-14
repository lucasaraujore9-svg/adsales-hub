"use client";

import { useState, useTransition } from "react";
import { Phone, PhoneCall, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { initiateClickToCall } from "@/lib/actions/calls";

interface Props {
  contactId?: string;
  dealId?: string;
  phoneNumber: string;
  contactName?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm";
}

/**
 * Botão "Ligar agora" — inicia call via click-to-dial.
 */
export function CallNowButton({
  contactId,
  dealId,
  phoneNumber,
  contactName,
  variant = "outline",
  size = "sm",
}: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  function handleCall() {
    start(async () => {
      const r = await initiateClickToCall({
        contactId: contactId ?? null,
        dealId: dealId ?? null,
        phoneNumber,
      });
      if (r.ok) {
        toast.success("Chamada iniciada — seu telefone vai tocar em alguns segundos.");
        setConfirming(false);
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha ao iniciar chamada");
      }
    });
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setConfirming(true)}
        disabled={!phoneNumber}
        title={phoneNumber || "Sem telefone cadastrado"}
      >
        <Phone className="mr-1 h-4 w-4" />
        Ligar
      </Button>
      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Iniciar ligação?</DialogTitle>
            <DialogDescription>
              Vamos discar para {contactName ? <strong>{contactName}</strong> : "este contato"} no
              número{" "}
              <span className="font-mono text-sm">{phoneNumber}</span>. Seu telefone de callback
              tocará primeiro e, ao atender, a chamada será conectada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={handleCall} disabled={pending}>
              {pending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <PhoneCall className="mr-1 h-4 w-4" />
              )}
              Discar agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
