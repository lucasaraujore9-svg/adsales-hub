import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import {
  getContact,
  listActivities,
  listCompanies,
  listDeals,
  listPipelinesAndStages,
} from "@/lib/queries/crm";
import { ContactEditPanel } from "@/components/contacts/contact-edit-panel";

const LIFECYCLE_LABELS: Record<string, string> = {
  lead: "Lead",
  mql: "MQL",
  sql: "SQL",
  opportunity: "Oportunidade",
  customer: "Cliente",
  lost: "Perdido",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 864e5);
  if (days < 1) return "hoje";
  if (days < 7) return `${days}d atrás`;
  if (days < 30) return `${Math.round(days / 7)}sem atrás`;
  return `${Math.round(days / 30)}mes atrás`;
}

export const metadata = { title: "Contato · AdSales Hub" };

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const sb = session.supabase;

  const contact = await getContact(sb, id);
  if (!contact) notFound();

  const [allDeals, allActivities, companies, { stages }] = await Promise.all([
    listDeals(sb, session.workspaceId),
    listActivities(sb, session.workspaceId, { contactId: contact.id, limit: 200 }),
    listCompanies(sb, session.workspaceId),
    listPipelinesAndStages(sb, session.workspaceId),
  ]);

  const company = contact.company_id
    ? companies.find((c) => c.id === contact.company_id) ?? null
    : null;
  const deals = allDeals.filter((d) => d.contact_id === contact.id);
  const stageById = new Map(stages.map((s) => [s.id, s]));

  const dealsByStatus = {
    open: deals.filter((d) => d.status === "open"),
    won: deals.filter((d) => d.status === "won"),
    lost: deals.filter((d) => d.status === "lost"),
  };
  const totalRevenue = dealsByStatus.won.reduce(
    (a, d) => a + Number(d.value || 0),
    0,
  );
  const pipelineValue = dealsByStatus.open.reduce(
    (a, d) => a + Number(d.value || 0),
    0,
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <Link
        href="/contatos"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Contatos
      </Link>

      <PageHeader
        kicker={company?.name ?? "Contato"}
        title={contact.name}
        description={contact.position ?? ""}
        actions={
          <StatusBadge
            label={LIFECYCLE_LABELS[contact.lifecycle_stage] ?? contact.lifecycle_stage}
            tone={
              contact.lifecycle_stage === "customer"
                ? "good"
                : contact.lifecycle_stage === "lost"
                  ? "bad"
                  : contact.lifecycle_stage === "opportunity"
                    ? "accent"
                    : "neutral"
            }
          />
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
          <div className="kicker">Negocios abertos</div>
          <div className="mt-1 font-mono text-2xl font-medium">{dealsByStatus.open.length}</div>
          <div className="text-xs text-[color:var(--ink-3)]">{formatBRL(pipelineValue)}</div>
        </div>
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
          <div className="kicker">Receita ganha</div>
          <div className="mt-1 font-mono text-2xl font-medium">{formatBRL(totalRevenue)}</div>
          <div className="text-xs text-[color:var(--ink-3)]">{dealsByStatus.won.length} negocios</div>
        </div>
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
          <div className="kicker">Atividades</div>
          <div className="mt-1 font-mono text-2xl font-medium">{allActivities.length}</div>
          <div className="text-xs text-[color:var(--ink-3)]">
            {allActivities.filter((a) => !a.completed).length} abertas
          </div>
        </div>
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
          <div className="kicker">Ultimo contato</div>
          <div className="mt-1 text-sm">{formatRelative(contact.last_contacted_at)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
            <div className="kicker">Negocios</div>
            <ul className="mt-3 divide-y divide-[color:var(--line)]">
              {deals.map((d) => {
                const stage = stageById.get(d.stage_id);
                return (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                    <Link
                      href={`/negocios/${d.id}`}
                      className="min-w-0 flex-1 text-sm font-medium hover:text-[color:var(--accent)]"
                    >
                      <div className="truncate">{d.title}</div>
                      <div className="text-xs text-[color:var(--ink-3)]">
                        {stage?.name ?? "—"} · {d.status}
                      </div>
                    </Link>
                    <span className="font-mono text-sm">{formatBRL(Number(d.value || 0))}</span>
                  </li>
                );
              })}
              {deals.length === 0 && (
                <li className="py-6 text-center text-sm text-[color:var(--ink-3)]">
                  Nenhum negocio associado.
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
            <div className="kicker">Atividades recentes</div>
            <ul className="mt-3 space-y-2">
              {allActivities.slice(0, 10).map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      a.completed ? "bg-[color:var(--good)]" : "bg-[color:var(--accent)]"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className={a.completed ? "text-[color:var(--ink-4)] line-through" : ""}>
                      {a.title}
                    </div>
                    <div className="text-xs text-[color:var(--ink-4)]">
                      {a.type} ·{" "}
                      {a.due_date ? new Date(a.due_date).toLocaleDateString("pt-BR") : "sem data"}
                    </div>
                  </div>
                </li>
              ))}
              {allActivities.length === 0 && (
                <li className="text-sm text-[color:var(--ink-3)]">Nenhuma atividade ainda.</li>
              )}
            </ul>
          </div>

          {(contact.utm_source || contact.utm_campaign || contact.utm_medium) && (
            <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
              <div className="kicker">Origem do lead</div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-[color:var(--ink-4)]">Source</dt>
                  <dd className="font-mono">{contact.utm_source ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-[color:var(--ink-4)]">Medium</dt>
                  <dd className="font-mono">{contact.utm_medium ?? "—"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[color:var(--ink-4)]">Campaign</dt>
                  <dd className="font-mono">{contact.utm_campaign ?? "—"}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
            <div className="kicker">Contato</div>
            <dl className="mt-3 space-y-2 text-sm">
              {contact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[color:var(--ink-4)]" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="truncate hover:text-[color:var(--accent)]"
                  >
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[color:var(--ink-4)]" />
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.whatsapp && (
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5 text-[color:var(--ink-4)]" />
                  <span>{contact.whatsapp}</span>
                </div>
              )}
              {company && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-[color:var(--ink-4)]" />
                  <span>{company.name}</span>
                </div>
              )}
            </dl>
          </div>

          <ContactEditPanel contact={contact} companies={companies} />
        </aside>
      </div>
    </div>
  );
}
