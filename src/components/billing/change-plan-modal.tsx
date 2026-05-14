"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { previewPlanChange } from "@/lib/actions/subscription-change";

type PlanId = "operacao" | "crescimento" | "escala";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanName?: string | null;
  newPlanId: PlanId;
  newPlanName: string;
  interval: "month" | "year";
  /**
   * Disparada quando user confirma. Receba (newPlanId, interval) e
   * leve para checkout / API de mudança.
   */
  onConfirm: () => Promise<void> | void;
}

function brl(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function ChangePlanModal({
  open,
  onOpenChange,
  currentPlanName,
  newPlanId,
  newPlanName,
  interval,
  onConfirm,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{
    immediateCharge: number;
    nextChargeAmount: number;
    nextChargeDate: string | null;
    simulated?: boolean;
  } | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    previewPlanChange({ newPlanId, interval })
      .then((r) => {
        if (r.ok) {
          setPreview({
            immediateCharge: r.immediateCharge ?? 0,
            nextChargeAmount: r.nextChargeAmount ?? 0,
            nextChargeDate: r.nextChargeDate ?? null,
            simulated: r.simulated,
          });
        } else {
          toast.error(r.error ?? "Falha ao carregar prévia");
        }
      })
      .finally(() => setLoading(false));
  }, [open, newPlanId, interval]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mudar para {newPlanName}?</DialogTitle>
          <DialogDescription>
            {currentPlanName
              ? `Você está mudando de ${currentPlanName} para ${newPlanName}.`
              : `Você está contratando o plano ${newPlanName}.`}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8 text-sm text-[color:var(--ink-3)]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculando valores...
          </div>
        )}

        {!loading && preview && (
          <div className="space-y-3">
            <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--bg-2)] p-4">
              <p className="text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
                Cobramos hoje (proporcional aos dias restantes)
              </p>
              <p className="mt-1 text-2xl font-medium">{brl(preview.immediateCharge)}</p>
            </div>
            <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
              <p className="text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
                Próxima cobrança recorrente
              </p>
              <p className="mt-1 text-lg font-medium">{brl(preview.nextChargeAmount)}</p>
              <p className="text-xs text-[color:var(--ink-3)]">
                em {formatDate(preview.nextChargeDate)}
              </p>
            </div>
            {preview.simulated && (
              <p className="rounded-md border border-[color:var(--warn)]/30 bg-[color:var(--warn)]/5 p-3 text-xs text-[color:var(--warn)]">
                Valores estimados. A cobrança definitiva pode variar levemente conforme o
                processamento Stripe.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button
            disabled={pending || loading}
            onClick={() => {
              start(async () => {
                await onConfirm();
                onOpenChange(false);
              });
            }}
          >
            {pending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Confirmar mudança
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
