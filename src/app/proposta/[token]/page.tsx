import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ProposalAcceptActions } from "@/components/public/proposal-accept-actions";

interface ProposalRow {
  id: string;
  workspace_id: string;
  title: string;
  content: unknown;
  products: unknown;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  validity_date: string | null;
  status: string;
  share_token: string;
  viewed_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  decline_reason: string | null;
}

interface Block {
  type: string;
  title?: string | null;
  content?: string | null;
}

interface Product {
  id?: string;
  name: string;
  price: number;
  currency?: string;
  billing_cycle?: string;
}

function asBlock(raw: unknown): Block | null {
  if (typeof raw !== "object" || raw === null) return null;
  const b = raw as Record<string, unknown>;
  return {
    type: String(b.type ?? "custom"),
    title: typeof b.title === "string" ? b.title : null,
    content: typeof b.content === "string" ? b.content : null,
  };
}

function asProduct(raw: unknown): Product | null {
  if (typeof raw !== "object" || raw === null) return null;
  const p = raw as Record<string, unknown>;
  if (typeof p.name !== "string") return null;
  return {
    id: typeof p.id === "string" ? p.id : undefined,
    name: p.name,
    price: Number(p.price ?? 0),
    currency: typeof p.currency === "string" ? p.currency : "BRL",
    billing_cycle: typeof p.billing_cycle === "string" ? p.billing_cycle : "one_time",
  };
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

const CYCLE_LABELS: Record<string, string> = {
  one_time: "Pagamento unico",
  monthly: "/mes",
  yearly: "/ano",
  custom: "",
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const sb = createAdminSupabaseClient();
  const { data } = await sb
    .from("proposals")
    .select("title")
    .eq("share_token", token)
    .maybeSingle();
  return { title: (data as { title?: string } | null)?.title ?? "Proposta" };
}

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const sb = createAdminSupabaseClient();

  const { data } = await sb
    .from("proposals")
    .select(
      "id, workspace_id, title, content, products, subtotal, discount, tax, total, validity_date, status, share_token, viewed_at, accepted_at, declined_at, decline_reason",
    )
    .eq("share_token", token)
    .maybeSingle();
  const proposal = data as ProposalRow | null;
  if (!proposal) notFound();

  // Mark viewed if not yet
  if (!proposal.viewed_at && proposal.status === "sent") {
    await sb
      .from("proposals")
      .update({ status: "viewed", viewed_at: new Date().toISOString() } as never)
      .eq("id", proposal.id);
  }

  const rawContent = proposal.content as { blocks?: unknown } | null;
  const rawBlocks = Array.isArray(rawContent?.blocks) ? (rawContent!.blocks as unknown[]) : [];
  const blocks = rawBlocks.map(asBlock).filter((b): b is Block => b !== null);

  const rawProducts = Array.isArray(proposal.products) ? proposal.products : [];
  const products = (rawProducts as unknown[])
    .map(asProduct)
    .filter((p): p is Product => p !== null);

  const isExpired =
    proposal.validity_date && new Date(proposal.validity_date) < new Date();
  const isAccepted = proposal.status === "accepted";
  const isDeclined = proposal.status === "declined";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 antialiased">
      <article className="mx-auto max-w-3xl space-y-10 rounded-2xl bg-white p-10 shadow-sm">
        <header className="border-b border-slate-200 pb-6">
          <div className="text-sm font-medium uppercase tracking-wider text-orange-500">
            Proposta comercial
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{proposal.title}</h1>
          {proposal.validity_date && (
            <p className="mt-2 text-sm text-slate-500">
              Valida ate{" "}
              <strong className={isExpired ? "text-red-500" : "text-slate-700"}>
                {new Date(proposal.validity_date).toLocaleDateString("pt-BR")}
              </strong>
            </p>
          )}
        </header>

        {blocks.map((b, i) => {
          if (b.type === "products") {
            return (
              <section key={i} className="space-y-4">
                {b.title && <h2 className="text-2xl font-semibold">{b.title}</h2>}
                {products.length > 0 ? (
                  <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200">
                    {products.map((p, idx) => (
                      <li key={idx} className="flex items-center justify-between p-4">
                        <span className="text-sm font-medium">{p.name}</span>
                        <span className="font-mono text-sm">
                          {formatBRL(p.price)}
                          {CYCLE_LABELS[p.billing_cycle ?? "one_time"]
                            ? ` ${CYCLE_LABELS[p.billing_cycle ?? "one_time"]}`
                            : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Sem itens.</p>
                )}
              </section>
            );
          }
          if (b.type === "pricing") {
            return (
              <section key={i} className="space-y-4">
                {b.title && <h2 className="text-2xl font-semibold">{b.title}</h2>}
                <div className="rounded-xl border border-slate-200 p-6">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt>Subtotal</dt>
                      <dd className="font-mono">{formatBRL(Number(proposal.subtotal))}</dd>
                    </div>
                    {Number(proposal.discount) > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <dt>Desconto</dt>
                        <dd className="font-mono">-{formatBRL(Number(proposal.discount))}</dd>
                      </div>
                    )}
                    {Number(proposal.tax) > 0 && (
                      <div className="flex justify-between">
                        <dt>Impostos</dt>
                        <dd className="font-mono">{formatBRL(Number(proposal.tax))}</dd>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
                      <dt>Total</dt>
                      <dd className="font-mono">{formatBRL(Number(proposal.total))}</dd>
                    </div>
                  </dl>
                </div>
              </section>
            );
          }
          return (
            <section key={i} className="space-y-3">
              {b.title && <h2 className="text-2xl font-semibold">{b.title}</h2>}
              {b.content && (
                <div className="whitespace-pre-line text-base leading-relaxed text-slate-700">
                  {b.content}
                </div>
              )}
            </section>
          );
        })}

        <footer className="border-t border-slate-200 pt-8">
          {isAccepted ? (
            <div className="rounded-xl bg-emerald-50 p-6 text-center text-emerald-700">
              <div className="text-2xl">✓</div>
              <p className="mt-2 font-semibold">Proposta aceita!</p>
              {proposal.accepted_at && (
                <p className="mt-1 text-sm">
                  Em {new Date(proposal.accepted_at).toLocaleString("pt-BR")}
                </p>
              )}
            </div>
          ) : isDeclined ? (
            <div className="rounded-xl bg-red-50 p-6 text-center text-red-700">
              <p className="font-semibold">Proposta recusada</p>
              {proposal.decline_reason && (
                <p className="mt-1 text-sm">{proposal.decline_reason}</p>
              )}
            </div>
          ) : isExpired ? (
            <div className="rounded-xl bg-amber-50 p-6 text-center text-amber-800">
              <p className="font-semibold">Proposta expirada</p>
              <p className="mt-1 text-sm">Entre em contato com o vendedor.</p>
            </div>
          ) : (
            <ProposalAcceptActions token={token} />
          )}
        </footer>
      </article>
    </div>
  );
}
