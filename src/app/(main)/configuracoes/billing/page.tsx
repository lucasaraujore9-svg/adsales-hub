import { Check, Sparkles, X } from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/guards";
import { getWorkspaceAccess } from "@/lib/billing/feature-gate";
import { startBasketCheckout, cancelSubscriptionAction, openBillingPortal } from "@/lib/actions/billing";
import { serverEnv } from "@/lib/env";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

const BASKETS = [
  { name: "operação", label: "Operacao", price: 29000, users: "3 usuários", modules: ["CRM", "Trafego IA", "Landing Pages"], featured: false },
  { name: "crescimento", label: "Crescimento", price: 69000, users: "8 usuários", modules: ["CRM", "Trafego IA", "Social", "Mensagens", "BI"], featured: true },
  { name: "escala", label: "Escala", price: 149000, users: "Usuarios ilimitados", modules: ["CRM", "Trafego IA", "Social", "Mensagens", "SDR IA", "BI", "Landing Pages", "Contratos"], featured: false },
] as const;

export default async function BillingOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; basket?: string; error?: string }>;
}) {
  const { status, basket, error } = await searchParams;
  const session = await getSession();
  const access = await getWorkspaceAccess(session.workspaceId);
  const isTrial = access?.isTrialing ?? false;
  const currentBasket = access?.basketName;
  const stripeConfigured = Boolean(serverEnv().STRIPE_SECRET_KEY);

  return (
    <div className="space-y-8">
      {status === "demo_activated" && (
        <div className="rounded-lg border border-[color:var(--good)]/30 bg-[color:var(--good)]/10 px-4 py-3 text-sm text-[color:var(--good)]">
          <Check className="mr-1 inline h-4 w-4" />
          Cesta <strong>{basket}</strong> ativada no modo demo. Configure STRIPE_SECRET_KEY para cobranca real.
        </div>
      )}
      {status === "canceled" && (
        <div className="rounded-lg border border-[color:var(--warn)]/30 bg-[color:var(--warn)]/10 px-4 py-3 text-sm text-[color:var(--warn)]">
          Cancelamento agendado para o fim do periodo.
        </div>
      )}
      {error === "stripe_not_configured" && (
        <div className="rounded-lg border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/10 px-4 py-3 text-sm text-[color:var(--bad)]">
          <X className="mr-1 inline h-4 w-4" />
          Stripe nao configurado (STRIPE_SECRET_KEY ausente no .env). Portal indisponivel.
        </div>
      )}

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard
          label="Plano atual"
          value={currentBasket ? currentBasket.charAt(0).toUpperCase() + currentBasket.slice(1) : "—"}
          hint={isTrial ? `Trial · expira em ${access?.trialDaysLeft} dias` : access?.subscriptionStatus ?? "—"}
          emphasis="inverse"
        />
        <MetricCard
          label="Modulos ativos"
          value={String(access?.modules.length ?? 0)}
          hint="de 8 totais"
        />
        <MetricCard
          label="Status"
          value={access?.isValid ? "Ativo" : "Pendente"}
          hint={access?.periodEnd ? `ate ${new Date(access.periodEnd).toLocaleDateString("pt-BR")}` : "—"}
        />
      </section>

      <WidgetCard kicker="Cestas pre-montadas" title="Todos os planos com trial de 14 dias">
        <div className="grid gap-4 md:grid-cols-3">
          {BASKETS.map((b) => {
            const current = currentBasket === b.name;
            return (
              <div
                key={b.name}
                className={`flex flex-col rounded-card border p-5 ${
                  b.featured
                    ? "border-[color:var(--accent)] bg-[color:var(--accent)]/5"
                    : "border-[color:var(--line)] bg-[color:var(--bg)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="kicker">{b.featured ? "Recomendado" : "Cesta"}</span>
                  {current && <StatusBadge label="Atual" tone="accent" />}
                </div>
                <h3 className="mt-2 text-xl font-medium">{b.label}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-medium tracking-tighter2">{formatBRL(b.price / 100)}</span>
                  <span className="text-xs text-[color:var(--ink-3)]">/mes</span>
                </div>
                <p className="mt-1 text-xs text-[color:var(--ink-3)]">{b.users}</p>
                <ul className="mt-4 flex-1 space-y-1.5 text-sm">
                  {b.modules.map((m) => (
                    <li key={m} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[color:var(--good)]" />
                      {m}
                    </li>
                  ))}
                </ul>
                {current ? (
                  <Button className="mt-5 w-full" variant="outline" disabled>
                    Plano atual
                  </Button>
                ) : (
                  <form action={startBasketCheckout} className="mt-5">
                    <input type="hidden" name="basket" value={b.name} />
                    <Button type="submit" className="w-full" variant={b.featured ? "default" : "outline"}>
                      {stripeConfigured ? "Assinar" : "Ativar (demo)"}
                    </Button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </WidgetCard>

      <div className="flex flex-wrap items-center gap-2">
        {stripeConfigured && (
          <form action={openBillingPortal}>
            <Button type="submit" variant="outline">
              Gerenciar no Stripe
            </Button>
          </form>
        )}
        {currentBasket && (
          <form action={cancelSubscriptionAction}>
            <Button type="submit" variant="outline">
              Cancelar ao final do periodo
            </Button>
          </form>
        )}
      </div>

      {!stripeConfigured && (
        <div className="rounded-lg border border-[color:var(--line)] bg-[color:var(--bg-2)]/50 p-4 text-xs text-[color:var(--ink-3)]">
          <Sparkles className="mr-1 inline h-3 w-3 text-[color:var(--accent)]" />
          Modo demo ativo: os botoes de assinatura ativam a cesta localmente (sem cartao). Configure{" "}
          <code className="font-mono">STRIPE_SECRET_KEY</code> e{" "}
          <code className="font-mono">STRIPE_PRICE_OPERACAO / CRESCIMENTO / ESCALA</code> para habilitar o checkout real.
        </div>
      )}
    </div>
  );
}
