import { CreditCard, Plus } from "lucide-react";
import { WidgetCard } from "@/components/shared/widget-card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";

export default function PaymentMethodPage() {
  return (
    <div className="space-y-4">
      <WidgetCard
        kicker="Metodo principal"
        title="Como você e cobrado"
        action={{ label: "Gerenciar no Stripe", href: "#" }}
      >
        <div className="flex items-center gap-4 rounded-lg border border-[color:var(--line)] bg-[color:var(--bg)] p-4">
          <div className="flex h-10 w-14 items-center justify-center rounded-md bg-[color:var(--ink)] font-mono text-xs font-bold text-[color:var(--bg)]">
            VISA
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Visa · 4242</div>
            <div className="text-xs text-[color:var(--ink-3)]">Expira em 12/2028 · Titular Lucas Pereira</div>
          </div>
          <StatusBadge label="Principal" tone="accent" />
        </div>

        <Button variant="outline" size="sm" className="mt-4">
          <Plus className="mr-1 h-4 w-4" /> Adicionar metodo
        </Button>
      </WidgetCard>

      <WidgetCard kicker="Outras opções" title="Metodos aceitos">
        <ul className="grid gap-2 sm:grid-cols-3">
          <li className="flex items-center gap-2 rounded-lg border border-[color:var(--line)] bg-[color:var(--bg)] p-3 text-sm">
            <CreditCard className="h-4 w-4 text-[color:var(--ink-3)]" />
            Cartao de credito
          </li>
          <li className="flex items-center gap-2 rounded-lg border border-[color:var(--line)] bg-[color:var(--bg)] p-3 text-sm">
            <span className="font-mono text-sm text-[color:var(--good)]">Pix</span>
            Pix (instantaneo)
          </li>
          <li className="flex items-center gap-2 rounded-lg border border-[color:var(--line)] bg-[color:var(--bg)] p-3 text-sm">
            <span className="font-mono text-sm text-[color:var(--ink-3)]">|||</span>
            Boleto (em breve)
          </li>
        </ul>
      </WidgetCard>

      <WidgetCard kicker="Notas fiscais" title="CNPJ e emissao">
        <p className="text-sm text-[color:var(--ink-3)]">
          Notas fiscais sao emitidas automaticamente apos cada cobranca e enviadas para
          <strong className="text-[color:var(--ink)]"> financeiro@adsaleshub.com.br</strong>.
          Para alterar, acesse <strong>Dados da empresa</strong>.
        </p>
      </WidgetCard>
    </div>
  );
}
