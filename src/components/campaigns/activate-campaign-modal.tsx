"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, AlertTriangle, X, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  fetchActivationChecklist,
  type ChecklistResult,
} from "@/lib/actions/campaign-activation";
import { toggleCampaignStatus } from "@/lib/actions/campaigns";

interface Props {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivateCampaignModal({ campaignId, open, onOpenChange }: Props) {
  const router = useRouter();
  const [data, setData] = useState<ChecklistResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmBudget, setConfirmBudget] = useState(false);
  const [confirmSpend, setConfirmSpend] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setConfirmBudget(false);
    setConfirmSpend(false);
    fetchActivationChecklist(campaignId)
      .then((r) => setData(r))
      .catch((e) => {
        console.error(e);
        toast.error("Falha ao carregar checklist");
      })
      .finally(() => setLoading(false));
  }, [open, campaignId]);

  const canActivate = !!data?.ready && confirmBudget && confirmSpend;

  function activate() {
    start(async () => {
      const r = await toggleCampaignStatus(campaignId, "active");
      if (r.ok) {
        toast.success("Campanha ativada!");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha ao ativar");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ativar campanha?</DialogTitle>
          <DialogDescription>
            Quando ativada, a campanha começa a gastar imediatamente. Confirme os pré-requisitos
            abaixo.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8 text-sm text-[color:var(--ink-3)]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...
          </div>
        )}

        {!loading && data && (
          <div className="space-y-4">
            <ul className="space-y-2">
              {data.checks.map((c) => (
                <li
                  key={c.id}
                  className="flex items-start gap-3 rounded-card border border-[color:var(--line)] bg-[color:var(--bg-2)]/30 p-3"
                >
                  {c.status === "pass" && (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--good)]" />
                  )}
                  {c.status === "warn" && (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--warn)]" />
                  )}
                  {c.status === "fail" && (
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--bad)]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        c.status === "fail" ? "text-[color:var(--bad)]" : ""
                      }`}
                    >
                      {c.label}
                    </p>
                    {c.details && (
                      <p className="mt-0.5 text-xs text-[color:var(--ink-3)]">{c.details}</p>
                    )}
                    {c.resolveUrl && c.status === "fail" && (
                      <Link
                        href={c.resolveUrl}
                        className="mt-1 inline-block text-xs font-medium text-[color:var(--accent)] hover:underline"
                      >
                        Resolver →
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {data.ready && (
              <div className="space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--bg-2)]/30 p-3">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={confirmBudget}
                    onChange={(e) => setConfirmBudget(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>Confirmo que revisei o orçamento e o público-alvo.</span>
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={confirmSpend}
                    onChange={(e) => setConfirmSpend(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    Entendo que a campanha começará a gastar dinheiro real imediatamente.
                  </span>
                </label>
              </div>
            )}

            {!data.ready && (
              <p className="rounded-md border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/10 p-3 text-xs text-[color:var(--bad)]">
                Resolva os itens marcados em vermelho antes de ativar.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button
            onClick={activate}
            disabled={!canActivate || pending || loading}
            variant="accent"
          >
            {pending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-1 h-4 w-4" />
            )}
            Ativar agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
