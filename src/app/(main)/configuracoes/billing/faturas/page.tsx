import { Download } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth/guards";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface InvoiceRow {
  id: string;
  number: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  pdf_url: string | null;
  paid_at: string | null;
  created_at: string;
}

const STATUS_META: Record<string, { label: string; tone: "good" | "warn" | "bad" | "neutral" }> = {
  paid: { label: "Paga", tone: "good" },
  open: { label: "Em aberto", tone: "warn" },
  void: { label: "Cancelada", tone: "neutral" },
  uncollectible: { label: "Inadimplente", tone: "bad" },
  draft: { label: "Rascunho", tone: "neutral" },
};

export default async function InvoicesPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("invoices")
    .select("id, number, amount, currency, status, payment_method, pdf_url, paid_at, created_at")
    .eq("workspace_id", session.workspaceId)
    .order("created_at", { ascending: false });
  const invoices = (data ?? []) as unknown as InvoiceRow[];

  return (
    <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
      {invoices.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
          Nenhuma fatura emitida ainda. Apos a primeira cobranca real via Stripe, elas aparecerao aqui.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Numero</th>
              <th className="px-5 py-3 text-right font-medium">Valor</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3 text-left font-medium">Metodo</th>
              <th className="px-5 py-3 text-left font-medium">Quando</th>
              <th className="px-5 py-3 text-right font-medium">PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--line)]">
            {invoices.map((inv) => {
              const meta = STATUS_META[inv.status] ?? STATUS_META.draft;
              return (
                <tr key={inv.id} className="hover:bg-[color:var(--bg-2)]/40">
                  <td className="px-5 py-3 font-mono font-medium">{inv.number ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-mono">
                    {formatBRL(Number(inv.amount))} {inv.currency}
                  </td>
                  <td className="px-5 py-3"><StatusBadge label={meta.label} tone={meta.tone} /></td>
                  <td className="px-5 py-3 text-xs text-[color:var(--ink-3)]">{inv.payment_method ?? "—"}</td>
                  <td className="px-5 py-3 text-xs text-[color:var(--ink-3)]">
                    {inv.paid_at
                      ? new Date(inv.paid_at).toLocaleDateString("pt-BR")
                      : new Date(inv.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {inv.pdf_url ? (
                      <Button asChild variant="outline" size="sm">
                        <a href={inv.pdf_url} target="_blank" rel="noopener">
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    ) : (
                      <span className="text-xs text-[color:var(--ink-4)]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
