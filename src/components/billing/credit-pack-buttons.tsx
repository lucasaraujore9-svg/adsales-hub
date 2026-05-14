"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startCreditPurchase } from "@/lib/actions/credits";
import type { CreditPack } from "@/lib/billing/credits";

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function CreditPackButtons({ packs }: { packs: CreditPack[] }) {
  const [pending, start] = useTransition();

  function handleBuy(packId: CreditPack["id"]) {
    start(async () => {
      const result = await startCreditPurchase({ pack_id: packId });
      if (!result.ok || !result.data) {
        toast.error(result.error ?? "Falha ao iniciar compra");
        return;
      }
      window.open(result.data.invoice_url, "_blank", "noopener,noreferrer");
      toast.success("Pagamento aberto em nova aba. Os creditos sao adicionados após confirmacao.");
    });
  }

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
      {packs.map((p) => {
        const perCreditCents = Math.round(p.priceCents / p.credits);
        return (
          <div
            key={p.id}
            className="relative flex flex-col rounded-card border border-[color:var(--line)] bg-[color:var(--bg)] p-4"
          >
            {p.badge && (
              <span className="absolute -top-2 right-3 rounded-pill bg-[color:var(--accent)] px-2 py-0.5 text-[10px] font-medium uppercase text-white">
                {p.badge}
              </span>
            )}
            <div className="font-mono text-3xl">{p.credits}</div>
            <div className="text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
              creditos
            </div>
            <div className="mt-3 text-2xl font-medium">{formatBRL(p.priceCents)}</div>
            <div className="text-[11px] text-[color:var(--ink-4)]">
              ~ {formatBRL(perCreditCents)} por credito
            </div>
            <Button
              className="mt-4"
              size="sm"
              disabled={pending}
              onClick={() => handleBuy(p.id)}
            >
              {pending ? "Abrindo..." : "Comprar"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
