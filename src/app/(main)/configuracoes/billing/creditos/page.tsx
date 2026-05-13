import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import {
  getCreditBalance,
  listCreditPacks,
  listCreditPricing,
  listCreditTransactions,
} from "@/lib/billing/credits";
import { CreditPackButtons } from "@/components/billing/credit-pack-buttons";

export const metadata = { title: "Creditos · Billing · AdSales Hub" };

const TX_LABEL: Record<string, string> = {
  grant: "Bonus mensal",
  spend: "Consumo",
  refund: "Reembolso",
  purchase: "Compra",
  expire: "Expiracao",
  adjust: "Ajuste",
};

const KIND_LABEL: Record<string, string> = {
  image: "Imagem",
  image_premium: "Imagem premium",
  video: "Video",
  video_premium: "Video premium",
  topup: "Recarga",
  monthly_grant: "Mensal incluso",
};

export default async function CreditosPage() {
  const session = await getSession();
  const [balance, pricing, transactions] = await Promise.all([
    getCreditBalance(session.workspaceId),
    listCreditPricing(),
    listCreditTransactions(session.workspaceId, 30),
  ]);
  const packs = listCreditPacks();

  return (
    <section className="space-y-8">
      <div>
        <span className="kicker">Saldo</span>
        <h2 className="mt-2 text-2xl font-medium tracking-tighter2">
          Creditos para gerar imagens e videos
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--ink-3)]">
          Cada geracao de imagem ou video desconta creditos do seu saldo. Planos com
          Social Media incluem creditos mensais; voce pode comprar pacotes adicionais a
          qualquer momento.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard
          label="Saldo atual"
          value={String(balance.balance)}
          hint="creditos"
          emphasis="inverse"
        />
        <MetricCard
          label="Inclusos no mes"
          value={`${balance.monthlyAllowanceRemaining}/${balance.monthlyAllowance}`}
          hint="restantes / mensal"
        />
        <MetricCard label="Total comprado" value={String(balance.totalPurchased)} />
        <MetricCard label="Total consumido" value={String(balance.totalSpent)} />
      </div>

      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
        <h3 className="text-sm font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          Custos por geracao
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {pricing.map((p) => (
            <div
              key={p.kind}
              className="rounded-lg border border-[color:var(--line)] bg-[color:var(--bg)] p-3"
            >
              <div className="text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
                {p.display_name}
              </div>
              <div className="mt-1 font-mono text-2xl">{p.cost}</div>
              <div className="text-[11px] text-[color:var(--ink-4)]">creditos</div>
              {p.description && (
                <p className="mt-2 text-[11px] text-[color:var(--ink-3)]">{p.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
        <h3 className="text-sm font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          Comprar creditos
        </h3>
        <CreditPackButtons packs={packs} />
        <p className="mt-3 text-[11px] text-[color:var(--ink-4)]">
          Pagamento via PIX, cartao ou boleto. Os creditos sao adicionados automaticamente
          apos confirmacao.
        </p>
      </div>

      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        <header className="flex items-center justify-between border-b border-[color:var(--line)] px-5 py-3">
          <h3 className="text-sm font-medium">Historico recente</h3>
          <span className="text-xs text-[color:var(--ink-4)]">ultimas 30 movimentacoes</span>
        </header>
        {transactions.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhuma movimentacao ainda.
          </div>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {transactions.map((tx) => {
              const positive = tx.amount > 0;
              const tone = tx.refunded
                ? "neutral"
                : tx.type === "spend"
                  ? "neutral"
                  : tx.type === "purchase"
                    ? "good"
                    : tx.type === "grant"
                      ? "accent"
                      : tx.type === "refund"
                        ? "warn"
                        : "neutral";
              return (
                <li key={tx.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <StatusBadge label={TX_LABEL[tx.type] ?? tx.type} tone={tone} />
                    {tx.kind && (
                      <span className="text-[color:var(--ink-3)]">
                        {KIND_LABEL[tx.kind] ?? tx.kind}
                      </span>
                    )}
                    {tx.refunded && (
                      <span className="text-[10px] uppercase tracking-kicker text-[color:var(--ink-4)]">
                        revertido
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <span
                      className={`font-mono ${
                        positive ? "text-[color:var(--good)]" : "text-[color:var(--ink)]"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {tx.amount}
                    </span>
                    <span className="text-[11px] text-[color:var(--ink-4)]">
                      {new Date(tx.created_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
