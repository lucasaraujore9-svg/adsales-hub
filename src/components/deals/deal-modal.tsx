"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Target,
  Calendar,
  MessageCircle,
  History,
  ExternalLink,
  Mail,
  Phone,
  Building2,
  TrendingUp,
  User,
} from "lucide-react";
import type {
  DealRow,
  ContactRow,
  ActivityRow,
  StageRow,
  CompanyRow,
  UserRow,
} from "@/lib/queries/crm";
import type { ConversationRow, MessageRow } from "@/lib/queries/inbox";
import { StatusBadge } from "@/components/shared/status-badge";
import { DealConversationTab } from "@/components/deals/deal-conversation-tab";
import { cn } from "@/lib/utils";

interface DealDetail {
  deal: DealRow;
  contact: ContactRow | null;
  stage: StageRow | null;
  company: CompanyRow | null;
  owner: UserRow | null;
  activities: ActivityRow[];
  conversations: ConversationRow[];
  messages: MessageRow[];
  currentUserId: string;
}

type TabId = "visao" | "atividades" | "conversa" | "historico";

interface Props {
  dealId: string | null;
  onClose: () => void;
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 864e5);
  if (days < 1) return "hoje";
  if (days < 7) return `${days}d atras`;
  if (days < 30) return `${Math.round(days / 7)}sem atras`;
  return `${Math.round(days / 30)}mes atras`;
}

export function DealModal({ dealId, onClose }: Props) {
  const [data, setData] = useState<DealDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("visao");

  useEffect(() => {
    if (!dealId) return;
    setData(null);
    setError(null);
    setTab("visao");
    let cancelled = false;
    fetch(`/api/deals/${dealId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((d: DealDetail) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "erro");
      });
    return () => {
      cancelled = true;
    };
  }, [dealId]);

  // ESC to close
  useEffect(() => {
    if (!dealId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dealId, onClose]);

  if (!dealId) return null;

  const tabs: { id: TabId; label: string; icon: typeof Target; badge?: number }[] = [
    { id: "visao", label: "Visao geral", icon: Target },
    { id: "atividades", label: "Atividades", icon: Calendar, badge: data?.activities.filter((a) => !a.completed).length },
    {
      id: "conversa",
      label: "Conversa",
      icon: MessageCircle,
      badge: data?.conversations.reduce((a, c) => a + (c.unread_count ?? 0), 0),
    },
    { id: "historico", label: "Historico", icon: History },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-card-lg border border-[color:var(--line-2)] bg-[color:var(--panel)] shadow-2xl">
        {/* Loading state */}
        {!data && !error && (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[color:var(--line-2)] border-t-[color:var(--accent)]" />
          </div>
        )}
        {error && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
            <p className="text-sm text-[color:var(--bad)]">Erro ao carregar: {error}</p>
            <button
              onClick={onClose}
              className="text-xs text-[color:var(--ink-3)] underline hover:text-[color:var(--ink)]"
            >
              Fechar
            </button>
          </div>
        )}

        {data && (
          <>
            <DealModalHeader data={data} onClose={onClose} />

            <nav className="flex shrink-0 items-center gap-1 border-b border-[color:var(--line)] px-5">
              {tabs.map((t) => {
                const active = tab === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "border-[color:var(--accent)] text-[color:var(--ink)]"
                        : "border-transparent text-[color:var(--ink-3)] hover:text-[color:var(--ink)]",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                    {t.badge != null && t.badge > 0 && (
                      <span
                        className={cn(
                          "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                          active
                            ? "bg-[color:var(--accent)] text-white"
                            : "bg-[color:var(--bg-2)] text-[color:var(--ink-2)]",
                        )}
                      >
                        {t.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              <Link
                href={`/negocios/${data.deal.id}`}
                className="ml-auto inline-flex items-center gap-1 py-2.5 text-xs text-[color:var(--ink-4)] hover:text-[color:var(--accent)]"
              >
                Abrir completo <ExternalLink className="h-3 w-3" />
              </Link>
            </nav>

            <div className="min-h-0 flex-1 overflow-hidden">
              {tab === "visao" && <OverviewTab data={data} />}
              {tab === "atividades" && <ActivitiesTab activities={data.activities} />}
              {tab === "conversa" && (
                <div className="h-full p-4">
                  <DealConversationTab
                    dealId={data.deal.id}
                    conversations={data.conversations}
                    initialMessages={data.messages}
                    currentUserId={data.currentUserId}
                  />
                </div>
              )}
              {tab === "historico" && <HistoryTab data={data} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DealModalHeader({ data, onClose }: { data: DealDetail; onClose: () => void }) {
  const { deal, stage, contact, company, owner } = data;
  return (
    <header className="shrink-0 border-b border-[color:var(--line)] px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-kicker text-[color:var(--ink-4)]">
              {company?.name ?? contact?.name ?? "Negocio"}
            </span>
            {stage && (
              <span
                className="inline-flex items-center gap-1 rounded-pill bg-[color:var(--bg-2)] px-2 py-0.5 text-[10px] font-medium"
                style={{ color: stage.color ?? "var(--ink-2)" }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: stage.color ?? "var(--accent)" }}
                />
                {stage.name} · {stage.probability}%
              </span>
            )}
          </div>
          <h2 className="mt-1 truncate text-xl font-medium tracking-tight">
            {deal.title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[color:var(--ink-3)]">
            <span className="font-mono text-base font-medium text-[color:var(--ink)]">
              {formatBRL(Number(deal.value || 0))}
            </span>
            {contact && (
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" /> {contact.name}
              </span>
            )}
            {owner && (
              <span className="inline-flex items-center gap-1">
                <span className="text-[color:var(--ink-4)]">Responsavel:</span>
                {owner.name ?? owner.email}
              </span>
            )}
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
        <button
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-[color:var(--ink-3)] hover:bg-[color:var(--bg-2)] hover:text-[color:var(--ink)]"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

function OverviewTab({ data }: { data: DealDetail }) {
  const { deal, contact, stage, company, activities } = data;
  const pending = activities.filter((a) => !a.completed).slice(0, 5);
  return (
    <div className="grid h-full grid-cols-1 gap-4 overflow-y-auto p-5 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Card title="Resumo">
          <p className="text-sm text-[color:var(--ink-2)]">
            {contact?.name ?? "Contato"}
            {company && <> da <strong>{company.name}</strong></>} chegou via{" "}
            <strong>{deal.source ?? "manual"}</strong>.
            {stage && <> Estagio atual: {stage.name} ({stage.probability}%).</>}
          </p>
        </Card>

        <Card title="Proximas atividades">
          {pending.length === 0 ? (
            <p className="text-xs text-[color:var(--ink-4)]">Nada pendente.</p>
          ) : (
            <ul className="space-y-2">
              {pending.map((a) => (
                <li key={a.id} className="flex items-center gap-3 text-sm">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                  <span className="flex-1 truncate">{a.title}</span>
                  <span className="text-xs text-[color:var(--ink-3)]">
                    {a.due_date ? new Date(a.due_date).toLocaleDateString("pt-BR") : "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <aside className="space-y-4">
        <Card title="Contato">
          {contact ? (
            <>
              <div className="text-sm font-medium">{contact.name}</div>
              {contact.position && (
                <div className="text-xs text-[color:var(--ink-3)]">{contact.position}</div>
              )}
              <dl className="mt-3 space-y-1.5 text-xs">
                {contact.email && (
                  <Field icon={Mail}>{contact.email}</Field>
                )}
                {contact.phone && <Field icon={Phone}>{contact.phone}</Field>}
                {company?.name && <Field icon={Building2}>{company.name}</Field>}
              </dl>
            </>
          ) : (
            <p className="text-xs text-[color:var(--ink-4)]">Sem contato associado.</p>
          )}
        </Card>
        {stage && (
          <Card title="Probabilidade">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium">{stage.probability}%</span>
              <span className="text-xs text-[color:var(--ink-3)]">{stage.name}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[color:var(--bg-2)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${stage.probability}%`,
                  backgroundColor: stage.color ?? "#FF5E1A",
                }}
              />
            </div>
            <p className="mt-2 text-xs text-[color:var(--ink-4)]">
              Ponderado:{" "}
              <strong className="text-[color:var(--ink-2)]">
                {formatBRL((Number(deal.value || 0) * stage.probability) / 100)}
              </strong>
            </p>
          </Card>
        )}
      </aside>
    </div>
  );
}

function ActivitiesTab({ activities }: { activities: ActivityRow[] }) {
  if (activities.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-sm text-[color:var(--ink-3)]">
        Nenhuma atividade ainda.
      </div>
    );
  }
  return (
    <ul className="h-full divide-y divide-[color:var(--line)] overflow-y-auto">
      {activities.map((a) => (
        <li key={a.id} className="flex items-start gap-3 px-5 py-3">
          <span
            className={cn(
              "mt-1.5 h-2 w-2 rounded-full",
              a.completed ? "bg-[color:var(--good)]" : "bg-[color:var(--accent)]",
            )}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{a.title}</span>
              <span className="shrink-0 text-xs text-[color:var(--ink-4)]">
                {a.due_date ? new Date(a.due_date).toLocaleString("pt-BR") : "—"}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-[color:var(--ink-3)]">
              {a.type} · {a.outcome ?? (a.completed ? "concluida" : "pendente")}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function HistoryTab({ data }: { data: DealDetail }) {
  const { deal, stage } = data;
  const items = [
    {
      title: `Mudou para ${stage?.name ?? "—"}`,
      sub: formatRelative(deal.stage_entered_at),
    },
    {
      title: `Valor: ${formatBRL(Number(deal.value || 0))}`,
      sub: "atual",
    },
    {
      title: `Origem: ${deal.source ?? "manual"}`,
      sub: `registrado em ${formatRelative(deal.created_at)}`,
    },
    {
      title: "Negocio criado",
      sub: formatRelative(deal.created_at),
    },
  ];
  return (
    <ul className="h-full divide-y divide-[color:var(--line)] overflow-y-auto">
      {items.map((it, i) => (
        <li key={i} className="px-5 py-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-[color:var(--ink-4)]" />
            <span className="text-sm font-medium">{it.title}</span>
          </div>
          <div className="ml-5 text-xs text-[color:var(--ink-4)]">{it.sub}</div>
        </li>
      ))}
    </ul>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--bg-2)] p-4">
      <div className="kicker mb-3">{title}</div>
      {children}
    </div>
  );
}

function Field({
  icon: Icon,
  children,
}: {
  icon: typeof Mail;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3 w-3 shrink-0 text-[color:var(--ink-4)]" />
      <span className="truncate">{children}</span>
    </div>
  );
}
