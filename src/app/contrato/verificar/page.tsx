import { notFound } from "next/navigation";
import { ShieldCheck, FileText, AlertTriangle } from "lucide-react";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Verificar contrato · AdSales Hub",
  robots: { index: false },
};

interface ContractRow {
  id: string;
  title: string;
  status: string;
  signed_at: string | null;
  content_hash: string | null;
  workspace_id: string;
}

interface SignatoryRow {
  name: string;
  email: string;
  status: string;
  signed_at: string | null;
}

interface EventRow {
  event_type: string;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
  geolocation: Record<string, unknown> | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const EVENT_LABELS: Record<string, string> = {
  link_sent: "Link enviado",
  viewed: "Visualizado",
  signed: "Assinado",
  declined: "Recusado",
  revoked: "Revogado",
  reminder_sent: "Lembrete enviado",
  fully_signed: "Contrato finalizado",
};

export default async function VerifyContractPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token;
  if (!token) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminSupabaseClient() as any;

  const { data: contractRow } = await admin
    .from("contracts")
    .select("id, title, status, signed_at, content_hash, workspace_id")
    .eq("verification_token", token)
    .maybeSingle();
  const contract = contractRow as ContractRow | null;
  if (!contract) notFound();

  const [{ data: sigs }, { data: events }] = await Promise.all([
    admin
      .from("contract_signatories")
      .select("name, email, status, signed_at")
      .eq("contract_id", contract.id)
      .order("sign_order", { ascending: true }),
    admin
      .from("contract_signature_events")
      .select("event_type, created_at, ip_address, user_agent, geolocation")
      .eq("contract_id", contract.id)
      .order("created_at", { ascending: true }),
  ]);

  const signatories = (sigs ?? []) as SignatoryRow[];
  const evts = (events ?? []) as EventRow[];

  const isComplete = contract.status === "signed";

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-6 flex items-center gap-3">
        {isComplete ? (
          <ShieldCheck className="h-8 w-8 text-[color:var(--good)]" />
        ) : (
          <AlertTriangle className="h-8 w-8 text-[color:var(--warn)]" />
        )}
        <div>
          <span className="kicker">Verificação pública</span>
          <h1 className="text-2xl font-medium tracking-tight">
            {isComplete ? "Contrato verificado" : "Contrato em andamento"}
          </h1>
        </div>
      </div>

      <section className="space-y-4 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-6">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-[color:var(--ink-3)]" />
          <span className="font-medium">{contract.title}</span>
        </div>

        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
              Status
            </dt>
            <dd className="font-medium">{contract.status}</dd>
          </div>
          {contract.signed_at && (
            <div>
              <dt className="text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
                Concluído em
              </dt>
              <dd>{formatDate(contract.signed_at)}</dd>
            </div>
          )}
        </dl>

        {contract.content_hash && (
          <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--bg-2)] p-3">
            <p className="text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
              Hash de integridade (SHA-256)
            </p>
            <p className="mt-1 break-all font-mono text-xs">{contract.content_hash}</p>
            <p className="mt-1 text-xs text-[color:var(--ink-3)]">
              Use este hash para verificar que o documento exibido aos signatários não foi alterado.
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-6">
        <h2 className="text-sm font-medium">Signatários</h2>
        <ul className="divide-y divide-[color:var(--line)]">
          {signatories.map((s, i) => (
            <li key={i} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-[color:var(--ink-3)]">{s.email}</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-medium uppercase">{s.status}</p>
                {s.signed_at && (
                  <p className="text-[color:var(--ink-3)]">{formatDate(s.signed_at)}</p>
                )}
              </div>
            </li>
          ))}
          {signatories.length === 0 && (
            <li className="py-4 text-center text-xs text-[color:var(--ink-3)]">
              Sem signatários cadastrados.
            </li>
          )}
        </ul>
      </section>

      <section className="mt-6 space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-6">
        <h2 className="text-sm font-medium">Linha do tempo</h2>
        <ol className="space-y-3">
          {evts.map((e, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[color:var(--accent)]" />
              <div className="flex-1">
                <p className="font-medium">{EVENT_LABELS[e.event_type] ?? e.event_type}</p>
                <p className="text-xs text-[color:var(--ink-3)]">
                  {formatDate(e.created_at)}
                  {e.ip_address && ` · IP ${e.ip_address}`}
                  {e.geolocation &&
                    typeof e.geolocation === "object" &&
                    ` · ${(e.geolocation as { country?: string; city?: string }).city ?? ""} ${(e.geolocation as { country?: string }).country ?? ""}`}
                </p>
              </div>
            </li>
          ))}
          {evts.length === 0 && (
            <li className="text-xs text-[color:var(--ink-3)]">Sem eventos registrados.</li>
          )}
        </ol>
      </section>

      <p className="mt-6 text-center text-xs text-[color:var(--ink-4)]">
        Esta página é pública e não expõe o conteúdo do contrato — apenas metadados
        para verificação.
      </p>
    </main>
  );
}
