import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
  Phone,
  Target,
  TrendingUp,
  Calendar,
  FileSignature,
  FileText,
  History,
  Building2,
} from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import {
  getDeal,
  getContact,
  listActivities,
  listPipelinesAndStages,
  listCompanies,
  leadSourcesForDeal,
  listWorkspaceUsers,
  listDealNotes,
  listDealCalls,
  dealTimeline,
} from "@/lib/queries/crm";
import { DealDetailHeader } from "@/components/deals/deal-detail-header";
import { DealTitleHeader } from "@/components/deals/deal-title-header";
import { DealNotesTab } from "@/components/deals/deal-notes-tab";
import { DealChannelTab } from "@/components/deals/deal-channel-tab";
import { GenerateProposalButton } from "@/components/deals/generate-proposal-button";
import { GenerateContractButton } from "@/components/deals/generate-contract-button";
import {
  EmailProposalButton,
  EmailSignatoryButton,
} from "@/components/deals/email-link-buttons";

type Tab =
  | "visao"
  | "atividades"
  | "notas"
  | "ligacoes"
  | "whatsapp"
  | "email"
  | "jornada"
  | "propostas"
  | "arquivos"
  | "historico";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatRelative(iso: string | null): string {
  if (!iso) return "";
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 864e5);
  if (days < 1) return "hoje";
  if (days < 7) return `${days}d atras`;
  if (days < 30) return `${Math.round(days / 7)}sem atras`;
  return `${Math.round(days / 30)}mes atras`;
}

export default async function DealDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: Tab }>;
}) {
  const { id } = await params;
  const { tab = "visao" } = await searchParams;

  const session = await getSession();
  const sb = session.supabase;

  const deal = await getDeal(sb, id);
  if (!deal) notFound();

  const [
    contact,
    activities,
    { stages },
    companies,
    leadSources,
    wsUsers,
    { data: proposalTemplatesRaw },
    { data: productsRaw },
    { data: dealProposalsRaw },
  ] = await Promise.all([
    deal.contact_id ? getContact(sb, deal.contact_id) : Promise.resolve(null),
    listActivities(sb, session.workspaceId, { dealId: deal.id }),
    listPipelinesAndStages(sb, session.workspaceId),
    listCompanies(sb, session.workspaceId),
    leadSourcesForDeal(sb, deal.id),
    listWorkspaceUsers(sb, session.workspaceId),
    sb
      .from("proposal_templates")
      .select("id, name")
      .eq("workspace_id", session.workspaceId)
      .eq("is_active", true)
      .order("name"),
    sb
      .from("products")
      .select("id, name, price, currency, billing_cycle")
      .eq("workspace_id", session.workspaceId)
      .eq("is_active", true)
      .order("name"),
    sb
      .from("proposals")
      .select("id, title, total, status, share_token, validity_date, created_at")
      .eq("deal_id", deal.id)
      .order("created_at", { ascending: false }),
  ]);

  const [{ data: contractTemplatesRaw }, { data: dealContractsRaw }] = await Promise.all([
    sb
      .from("contract_templates")
      .select("id, name")
      .eq("workspace_id", session.workspaceId)
      .eq("is_active", true)
      .order("name"),
    sb
      .from("contracts")
      .select("id, title, status, expires_at, signed_at, created_at")
      .eq("deal_id", deal.id)
      .order("created_at", { ascending: false }),
  ]);
  const contractTemplates = (contractTemplatesRaw ?? []) as unknown as {
    id: string;
    name: string;
  }[];
  const dealContracts = (dealContractsRaw ?? []) as unknown as {
    id: string;
    title: string;
    status: string;
    expires_at: string | null;
    signed_at: string | null;
    created_at: string;
  }[];

  let contractSignatories: Array<{
    id: string;
    contract_id: string;
    name: string;
    email: string;
    sign_order: number;
    status: string;
  }> = [];
  if (dealContracts.length > 0) {
    const { data: sigsRaw } = await sb
      .from("contract_signatories")
      .select("id, contract_id, name, email, sign_order, status")
      .in("contract_id", dealContracts.map((c) => c.id))
      .order("sign_order", { ascending: true });
    contractSignatories =
      (sigsRaw ?? []) as unknown as typeof contractSignatories;
  }
  const proposalTemplates = (proposalTemplatesRaw ?? []) as unknown as {
    id: string;
    name: string;
  }[];
  const productOptions = (productsRaw ?? []) as unknown as {
    id: string;
    name: string;
    price: number;
    currency: string;
    billing_cycle: string;
  }[];
  const dealProposals = (dealProposalsRaw ?? []) as unknown as {
    id: string;
    title: string;
    total: number;
    status: string;
    share_token: string;
    validity_date: string | null;
    created_at: string;
  }[];

  const stageMeta = stages.find((s) => s.id === deal.stage_id);
  const [timeline, dealNotes, dealCalls] = await Promise.all([
    tab === "historico" ? dealTimeline(sb, deal, stageMeta?.name ?? null) : Promise.resolve([]),
    tab === "notas" ? listDealNotes(sb, deal.id) : Promise.resolve([]),
    tab === "ligacoes" ? listDealCalls(sb, deal.id) : Promise.resolve([]),
  ]);
  const company = deal.company_id ? companies.find((c) => c.id === deal.company_id) : null;
  const owner = deal.owner_user_id ? wsUsers.find((u) => u.id === deal.owner_user_id) : null;

  const pipelineStages = stages
    .filter((s) => s.pipeline_id === deal.pipeline_id)
    .sort((a, b) => a.position - b.position);

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "visao", label: "Visao geral", icon: Target },
    { id: "atividades", label: "Atividades", icon: Calendar },
    { id: "notas", label: "Notas", icon: FileText },
    { id: "ligacoes", label: "Ligacoes", icon: Phone },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { id: "email", label: "Email", icon: Mail },
    { id: "jornada", label: "Jornada", icon: TrendingUp },
    { id: "propostas", label: "Propostas", icon: FileSignature },
    { id: "arquivos", label: "Contratos", icon: Building2 },
    { id: "historico", label: "Historico", icon: History },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <Link
        href="/pipeline"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Pipeline
      </Link>

      <DealTitleHeader
        dealId={deal.id}
        kicker={company?.name ?? contact?.name ?? "Negocio"}
        title={deal.title}
        description={`Estagio: ${stageMeta?.name ?? "—"} (${stageMeta?.probability ?? 0}%) desde ${formatRelative(deal.stage_entered_at)}`}
      />

      <DealDetailHeader deal={deal} stages={pipelineStages} />

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
          <div className="kicker">Valor</div>
          <div className="mt-1 font-mono text-2xl font-medium">{formatBRL(Number(deal.value || 0))}</div>
        </div>
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
          <div className="kicker">Fechamento</div>
          <div className="mt-1 text-sm">
            {deal.expected_close_date
              ? new Date(deal.expected_close_date).toLocaleDateString("pt-BR")
              : "—"}
          </div>
        </div>
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
          <div className="kicker">Origem</div>
          <div className="mt-1">
            <StatusBadge
              label={deal.source ?? "manual"}
              tone={
                deal.source === "meta_ads"
                  ? "accent"
                  : deal.source === "referral"
                    ? "good"
                    : "neutral"
              }
            />
          </div>
        </div>
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
          <div className="kicker">Responsavel</div>
          <div className="mt-1 text-sm">{owner?.name ?? owner?.email ?? "—"}</div>
        </div>
      </div>

      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-[color:var(--line)]">
        {tabs.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <Link
              key={t.id}
              href={`/negocios/${deal.id}?tab=${t.id}`}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "border-[color:var(--accent)] text-[color:var(--ink)]"
                  : "border-transparent text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {tab === "visao" && (
            <div className="space-y-4">
              <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
                <div className="kicker">Resumo</div>
                <p className="mt-3 text-sm text-[color:var(--ink-2)]">
                  {contact?.name ?? "Contato"} da {company?.name ?? "empresa"} chegou via{" "}
                  <strong>{deal.source ?? "manual"}</strong>.
                  {leadSources[0]?.campaign?.name
                    ? ` Campanha: ${leadSources[0].campaign.name}.`
                    : leadSources[0]?.utm_campaign
                      ? ` Campanha: ${leadSources[0].utm_campaign}.`
                      : ""}
                </p>
              </div>

              {leadSources[0] && (
                <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
                  <div className="kicker">Origem do lead</div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-[color:var(--ink-4)]">Tipo</dt>
                      <dd className="font-medium capitalize">
                        {leadSources[0].source_type.replace(/_/g, " ")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[color:var(--ink-4)]">Capturado em</dt>
                      <dd>
                        {leadSources[0].captured_at
                          ? new Date(leadSources[0].captured_at).toLocaleString("pt-BR")
                          : "—"}
                      </dd>
                    </div>
                    {leadSources[0].campaign?.name && (
                      <div>
                        <dt className="text-[color:var(--ink-4)]">Campanha</dt>
                        <dd className="font-mono">{leadSources[0].campaign.name}</dd>
                      </div>
                    )}
                    {leadSources[0].ad_set?.name && (
                      <div>
                        <dt className="text-[color:var(--ink-4)]">Conjunto</dt>
                        <dd className="font-mono">{leadSources[0].ad_set.name}</dd>
                      </div>
                    )}
                    {leadSources[0].ad?.name && (
                      <div className="col-span-2">
                        <dt className="text-[color:var(--ink-4)]">Anuncio</dt>
                        <dd className="font-mono">{leadSources[0].ad.name}</dd>
                      </div>
                    )}
                    {leadSources[0].lead_form?.name && (
                      <div className="col-span-2">
                        <dt className="text-[color:var(--ink-4)]">Formulario</dt>
                        <dd className="font-mono">{leadSources[0].lead_form.name}</dd>
                      </div>
                    )}
                    {leadSources[0].cost != null && (
                      <div>
                        <dt className="text-[color:var(--ink-4)]">Custo do lead</dt>
                        <dd className="font-mono">{formatBRL(Number(leadSources[0].cost))}</dd>
                      </div>
                    )}
                    {(leadSources[0].utm_source ||
                      leadSources[0].utm_medium ||
                      leadSources[0].utm_campaign) && (
                      <div className="col-span-2 mt-2 border-t border-[color:var(--line)] pt-2">
                        <dt className="text-[color:var(--ink-4)]">UTMs</dt>
                        <dd className="mt-1 font-mono text-[10px]">
                          source={leadSources[0].utm_source ?? "—"} · medium=
                          {leadSources[0].utm_medium ?? "—"} · campaign=
                          {leadSources[0].utm_campaign ?? "—"}
                          {leadSources[0].utm_content
                            ? ` · content=${leadSources[0].utm_content}`
                            : ""}
                          {leadSources[0].utm_term
                            ? ` · term=${leadSources[0].utm_term}`
                            : ""}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
                <div className="kicker">Proximas atividades</div>
                <ul className="mt-3 space-y-2">
                  {activities
                    .filter((a) => !a.completed)
                    .slice(0, 5)
                    .map((a) => (
                      <li key={a.id} className="flex items-center gap-3 text-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
                        <span className="flex-1">{a.title}</span>
                        <span className="text-xs text-[color:var(--ink-3)]">
                          {a.due_date ? new Date(a.due_date).toLocaleDateString("pt-BR") : "—"}
                        </span>
                      </li>
                    ))}
                  {activities.filter((a) => !a.completed).length === 0 && (
                    <li className="text-sm text-[color:var(--ink-3)]">Nada pendente.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
          {tab === "atividades" && (
            <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
              <ul className="divide-y divide-[color:var(--line)]">
                {activities.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                    <span
                      className={`mt-1.5 h-2 w-2 rounded-full ${
                        a.completed ? "bg-[color:var(--good)]" : "bg-[color:var(--accent)]"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{a.title}</span>
                        <span className="text-xs text-[color:var(--ink-4)]">
                          {a.due_date ? new Date(a.due_date).toLocaleString("pt-BR") : "—"}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-[color:var(--ink-3)]">
                        {a.type} · {a.outcome ?? (a.completed ? "concluida" : "pendente")}
                      </div>
                    </div>
                  </li>
                ))}
                {activities.length === 0 && (
                  <li className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
                    Nenhuma atividade ainda.
                  </li>
                )}
              </ul>
            </div>
          )}
          {tab === "notas" && (
            <DealNotesTab dealId={deal.id} notes={dealNotes} users={wsUsers} />
          )}
          {tab === "ligacoes" && (
            <DealChannelTab
              dealId={deal.id}
              contactId={deal.contact_id}
              type="call"
              activities={activities.filter((a) => a.type === "call")}
              calls={dealCalls}
              channelLabel="Ligacao"
            />
          )}
          {tab === "whatsapp" && (
            <DealChannelTab
              dealId={deal.id}
              contactId={deal.contact_id}
              type="whatsapp"
              activities={activities.filter((a) => a.type === "whatsapp")}
              channelLabel="WhatsApp"
            />
          )}
          {tab === "email" && (
            <DealChannelTab
              dealId={deal.id}
              contactId={deal.contact_id}
              type="email"
              activities={activities.filter((a) => a.type === "email")}
              channelLabel="Email"
            />
          )}
          {tab === "jornada" && (
            <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
              <div className="kicker">Origem → Venda</div>
              {(() => {
                const ls = leadSources[0];
                const meetingDone = activities.find(
                  (a) => a.type === "meeting" && a.completed,
                );
                const stageName = stageMeta?.name?.toLowerCase() ?? "";
                const inProposal =
                  stageName.includes("proposta") || stageName.includes("negociacao");
                const won = deal.status === "won";
                const steps: {
                  title: string;
                  meta: string;
                  ts: string | null;
                  done: boolean;
                }[] = [
                  {
                    title: ls?.campaign?.name
                      ? `Clique no anuncio · ${ls.campaign.name}`
                      : ls?.utm_campaign
                        ? `Origem · ${ls.utm_campaign}`
                        : `Origem · ${deal.source ?? "manual"}`,
                    meta: ls?.ad?.name
                      ? `Anuncio: ${ls.ad.name}`
                      : ls?.utm_source
                        ? `${ls.utm_source}${ls.utm_medium ? ` / ${ls.utm_medium}` : ""}`
                        : "",
                    ts: ls?.captured_at ?? deal.created_at,
                    done: true,
                  },
                  {
                    title: "Lead criado no CRM",
                    meta: ls?.cost != null ? `Custo: ${formatBRL(Number(ls.cost))}` : "",
                    ts: deal.created_at,
                    done: true,
                  },
                  {
                    title: "Qualificacao",
                    meta: `Fase: ${contact?.lifecycle_stage ?? "lead"}`,
                    ts: contact?.last_contacted_at ?? null,
                    done:
                      (contact?.lifecycle_stage ?? "lead") !== "lead" ||
                      activities.some((a) => a.completed && a.type === "call"),
                  },
                  {
                    title: "Reuniao",
                    meta: meetingDone?.title ?? "—",
                    ts: meetingDone?.completed_at ?? null,
                    done: !!meetingDone,
                  },
                  {
                    title: "Proposta / Negociacao",
                    meta: inProposal || won ? stageMeta?.name ?? "" : "Aguardando",
                    ts: inProposal || won ? deal.stage_entered_at : null,
                    done: inProposal || won,
                  },
                  {
                    title: won
                      ? "Negocio fechado"
                      : deal.status === "lost"
                        ? "Negocio perdido"
                        : "Fechamento",
                    meta: deal.status === "open" ? "Em andamento" : deal.status,
                    ts: deal.closed_at,
                    done: deal.status !== "open",
                  },
                ];
                return (
                  <ol className="mt-4 space-y-4">
                    {steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div
                          className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-medium ${
                            step.done
                              ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white"
                              : "border-[color:var(--line-2)] text-[color:var(--ink-4)]"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">{step.title}</span>
                            {step.ts && (
                              <span className="shrink-0 font-mono text-[10px] text-[color:var(--ink-4)]">
                                {new Date(step.ts).toLocaleDateString("pt-BR")}
                              </span>
                            )}
                          </div>
                          {step.meta && (
                            <div className="text-xs text-[color:var(--ink-4)]">{step.meta}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                );
              })()}
            </div>
          )}
          {tab === "propostas" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[color:var(--ink-3)]">
                  {dealProposals.length} proposta(s)
                </p>
                <GenerateProposalButton
                  dealId={deal.id}
                  templates={proposalTemplates}
                  products={productOptions}
                />
              </div>
              <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
                {dealProposals.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
                    Nenhuma proposta gerada ainda. Use o botao acima.
                  </p>
                ) : (
                  <ul className="divide-y divide-[color:var(--line)]">
                    {dealProposals.map((p) => {
                      const tone =
                        p.status === "accepted"
                          ? "good"
                          : p.status === "declined"
                            ? "bad"
                            : p.status === "viewed"
                              ? "warn"
                              : p.status === "sent"
                                ? "accent"
                                : "neutral";
                      return (
                        <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                          <div className="min-w-0">
                            <a
                              href={`/proposta/${p.share_token}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium hover:text-[color:var(--accent)]"
                            >
                              {p.title}
                            </a>
                            <div className="text-xs text-[color:var(--ink-3)]">
                              {formatBRL(Number(p.total))}
                              {p.validity_date
                                ? ` · valida ate ${new Date(p.validity_date).toLocaleDateString("pt-BR")}`
                                : ""}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {p.status !== "accepted" && p.status !== "declined" && (
                              <EmailProposalButton proposalId={p.id} />
                            )}
                            <StatusBadge label={p.status} tone={tone} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
          {tab === "arquivos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[color:var(--ink-3)]">
                  Contratos vinculados a este negocio · {dealContracts.length}
                </p>
                <GenerateContractButton
                  dealId={deal.id}
                  templates={contractTemplates}
                  defaultContact={
                    contact?.email
                      ? { name: contact.name ?? contact.email, email: contact.email }
                      : null
                  }
                />
              </div>
              <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
                {dealContracts.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
                    Nenhum contrato gerado. Crie templates em /configuracoes/contratos.
                  </p>
                ) : (
                  <ul className="divide-y divide-[color:var(--line)]">
                    {dealContracts.map((c) => {
                      const sigs = contractSignatories.filter((s) => s.contract_id === c.id);
                      const tone =
                        c.status === "signed"
                          ? "good"
                          : c.status === "canceled" || c.status === "expired"
                            ? "neutral"
                            : c.status === "partially_signed"
                              ? "warn"
                              : "accent";
                      return (
                        <li key={c.id} className="px-5 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span className="font-medium">{c.title}</span>
                              <div className="mt-0.5 text-xs text-[color:var(--ink-3)]">
                                {c.expires_at
                                  ? `expira ${new Date(c.expires_at).toLocaleDateString("pt-BR")}`
                                  : "sem validade"}
                                {c.signed_at
                                  ? ` · assinado ${new Date(c.signed_at).toLocaleDateString("pt-BR")}`
                                  : ""}
                              </div>
                            </div>
                            <StatusBadge label={c.status.replace(/_/g, " ")} tone={tone} />
                          </div>
                          {sigs.length > 0 && (
                            <ul className="mt-3 space-y-1">
                              {sigs.map((s) => (
                                <li
                                  key={s.id}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span className="text-[color:var(--ink-3)]">
                                    {s.sign_order}. {s.name} ({s.email})
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={
                                        s.status === "signed"
                                          ? "text-[color:var(--good)]"
                                          : s.status === "declined"
                                            ? "text-[color:var(--bad)]"
                                            : "text-[color:var(--ink-4)]"
                                      }
                                    >
                                      {s.status === "signed"
                                        ? "✓ assinado"
                                        : s.status === "declined"
                                          ? "✗ recusou"
                                          : "aguardando"}
                                    </span>
                                    {s.status === "pending" && (
                                      <>
                                        <a
                                          href={`/contrato/${s.id}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 font-mono text-[10px] hover:bg-[color:var(--bg-2)]"
                                        >
                                          link
                                        </a>
                                        <EmailSignatoryButton signatoryId={s.id} />
                                      </>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
          {tab === "historico" && (
            <ul className="divide-y divide-[color:var(--line)] rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
              {timeline.map((e, i) => {
                const dot =
                  e.kind === "closed"
                    ? e.tone === "good"
                      ? "bg-[color:var(--good)]"
                      : "bg-[color:var(--bad)]"
                    : e.kind === "created"
                      ? "bg-[color:var(--ink-3)]"
                      : "bg-[color:var(--accent)]";
                return (
                  <li key={`${e.kind}-${i}-${e.at}`} className="flex items-start gap-3 px-5 py-3 text-sm">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{e.title}</span>
                        <span className="shrink-0 text-xs text-[color:var(--ink-4)]">
                          {formatRelative(e.at)}
                        </span>
                      </div>
                      {e.meta && (
                        <div className="mt-0.5 text-xs text-[color:var(--ink-3)] line-clamp-2">
                          {e.meta}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
              {timeline.length === 0 && (
                <li className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
                  Sem eventos registrados ainda.
                </li>
              )}
            </ul>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
            <div className="kicker">Contato principal</div>
            {contact ? (
              <div className="mt-3">
                <div className="text-base font-medium">{contact.name}</div>
                <div className="text-xs text-[color:var(--ink-3)]">{contact.position ?? ""}</div>
                <dl className="mt-4 space-y-2 text-xs">
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-[color:var(--ink-4)]" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-[color:var(--ink-4)]" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-3 w-3 text-[color:var(--ink-4)]" />
                      <span>{contact.whatsapp}</span>
                    </div>
                  )}
                </dl>
              </div>
            ) : (
              <p className="mt-3 text-xs text-[color:var(--ink-4)]">Sem contato associado.</p>
            )}
          </div>

          {stageMeta && (
            <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
              <div className="kicker">Probabilidade</div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-medium">{stageMeta.probability}%</span>
                <span className="text-xs text-[color:var(--ink-3)]">{stageMeta.name}</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[color:var(--bg-2)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${stageMeta.probability}%`,
                    backgroundColor: stageMeta.color ?? "#FF5E1A",
                  }}
                />
              </div>
              <p className="mt-3 text-xs text-[color:var(--ink-4)]">
                Ponderado:{" "}
                <strong className="text-[color:var(--ink-2)]">
                  {formatBRL((Number(deal.value || 0) * stageMeta.probability) / 100)}
                </strong>
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
