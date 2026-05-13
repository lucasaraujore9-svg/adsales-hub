import { notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ContractSignForm } from "@/components/public/contract-sign-form";

interface SignatoryRow {
  id: string;
  contract_id: string;
  name: string;
  email: string;
  role: string;
  sign_order: number;
  status: string;
  signed_at: string | null;
}

interface ContractRow {
  id: string;
  title: string;
  content: string;
  status: string;
  expires_at: string | null;
  workspace_id: string;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const sb = createAdminSupabaseClient();
  const { data } = await sb
    .from("contract_signatories")
    .select("contracts(title)")
    .eq("id", token)
    .maybeSingle();
  const title = (data as { contracts?: { title?: string } | null } | null)?.contracts?.title;
  return { title: title ?? "Assinatura de contrato" };
}

export default async function PublicContractPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const sb = createAdminSupabaseClient();

  // Token é signatory.id
  const { data: sigData } = await sb
    .from("contract_signatories")
    .select(
      "id, contract_id, name, email, role, sign_order, status, signed_at",
    )
    .eq("id", token)
    .maybeSingle();
  const signatory = sigData as SignatoryRow | null;
  if (!signatory) notFound();

  const { data: contractData } = await sb
    .from("contracts")
    .select("id, title, content, status, expires_at, workspace_id")
    .eq("id", signatory.contract_id)
    .maybeSingle();
  const contract = contractData as ContractRow | null;
  if (!contract) notFound();

  // All signatories status (mostra ordem)
  const { data: allSigs } = await sb
    .from("contract_signatories")
    .select("id, name, role, sign_order, status, signed_at")
    .eq("contract_id", contract.id)
    .order("sign_order", { ascending: true });
  const signatories = (allSigs ?? []) as unknown as Array<{
    id: string;
    name: string;
    role: string;
    sign_order: number;
    status: string;
    signed_at: string | null;
  }>;

  const isExpired =
    contract.expires_at && new Date(contract.expires_at) < new Date();
  const isCanceled = contract.status === "canceled";
  const isComplete = contract.status === "signed";
  const alreadySigned = signatory.status === "signed";

  // Verifica se vez deste signatory chegou (signing order)
  const previousSigners = signatories.filter(
    (s) => s.sign_order < signatory.sign_order,
  );
  const allPreviousSigned = previousSigners.every((s) => s.status === "signed");
  const canSignNow =
    !alreadySigned && !isExpired && !isCanceled && !isComplete && allPreviousSigned;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 antialiased">
      <article className="mx-auto max-w-3xl space-y-8 rounded-2xl bg-white p-10 shadow-sm">
        <header className="border-b border-slate-200 pb-6">
          <div className="text-sm font-medium uppercase tracking-wider text-orange-500">
            Contrato
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{contract.title}</h1>
          {contract.expires_at && (
            <p className="mt-2 text-sm text-slate-500">
              Valido ate{" "}
              <strong className={isExpired ? "text-red-500" : "text-slate-700"}>
                {new Date(contract.expires_at).toLocaleDateString("pt-BR")}
              </strong>
            </p>
          )}
        </header>

        <section
          className="prose prose-slate max-w-none whitespace-pre-line text-base leading-relaxed text-slate-700"
          dangerouslySetInnerHTML={{ __html: contract.content }}
        />

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
            Signatarios
          </h3>
          <ol className="mt-3 space-y-2 text-sm">
            {signatories.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2"
              >
                <span>
                  <span className="font-mono text-xs text-slate-400">{s.sign_order}.</span>{" "}
                  <strong className="text-slate-700">{s.name}</strong>
                  <span className="ml-1 text-xs text-slate-400">({s.role})</span>
                  {s.id === signatory.id && (
                    <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                      voce
                    </span>
                  )}
                </span>
                {s.status === "signed" ? (
                  <span className="text-xs text-emerald-600">
                    ✓ assinado{" "}
                    {s.signed_at
                      ? new Date(s.signed_at).toLocaleDateString("pt-BR")
                      : ""}
                  </span>
                ) : s.status === "declined" ? (
                  <span className="text-xs text-red-500">recusado</span>
                ) : (
                  <span className="text-xs text-slate-400">aguardando</span>
                )}
              </li>
            ))}
          </ol>
        </section>

        <footer className="border-t border-slate-200 pt-8">
          {isComplete ? (
            <div className="rounded-xl bg-emerald-50 p-6 text-center text-emerald-700">
              <div className="text-2xl">✓</div>
              <p className="mt-2 font-semibold">Contrato totalmente assinado</p>
            </div>
          ) : isCanceled ? (
            <div className="rounded-xl bg-slate-100 p-6 text-center text-slate-600">
              <p className="font-semibold">Contrato cancelado</p>
            </div>
          ) : isExpired ? (
            <div className="rounded-xl bg-amber-50 p-6 text-center text-amber-800">
              <p className="font-semibold">Contrato expirado</p>
            </div>
          ) : alreadySigned ? (
            <div className="rounded-xl bg-emerald-50 p-6 text-center text-emerald-700">
              <p className="font-semibold">Voce ja assinou</p>
              {signatory.signed_at && (
                <p className="mt-1 text-sm">
                  Em {new Date(signatory.signed_at).toLocaleString("pt-BR")}
                </p>
              )}
              <p className="mt-1 text-sm">Aguardando demais signatarios.</p>
            </div>
          ) : !allPreviousSigned ? (
            <div className="rounded-xl bg-amber-50 p-6 text-center text-amber-800">
              <p className="font-semibold">Aguardando signatario anterior</p>
              <p className="mt-1 text-sm">
                Voce sera notificado quando for sua vez.
              </p>
            </div>
          ) : (
            <ContractSignForm
              token={token}
              signerName={signatory.name}
              signerEmail={signatory.email}
            />
          )}
        </footer>
      </article>
    </div>
  );
}
