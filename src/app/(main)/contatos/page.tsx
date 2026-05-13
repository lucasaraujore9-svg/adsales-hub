import Link from "next/link";
import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSession } from "@/lib/auth/guards";
import {
  listContacts,
  listCompanies,
  countContacts,
  distinctContactSources,
} from "@/lib/queries/crm";
import { NewContactButton } from "@/components/contacts/new-contact-button";
import { ImportExportButtons } from "@/components/contacts/import-export-buttons";

export const metadata = { title: "Contatos · AdSales Hub" };

const LIFECYCLE_LABELS = {
  lead: "Lead",
  mql: "MQL",
  sql: "SQL",
  opportunity: "Oportunidade",
  customer: "Cliente",
  lost: "Perdido",
} as const;

const PAGE_SIZE = 50;

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 864e5);
  if (days < 1) return "hoje";
  if (days < 7) return `${days}d atras`;
  if (days < 30) return `${Math.round(days / 7)}sem atras`;
  return `${Math.round(days / 30)}mes atras`;
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; life?: string; src?: string; page?: string }>;
}) {
  const { q, life, src, page } = await searchParams;
  const session = await getSession();
  const sb = session.supabase;

  const pageNum = Math.max(1, Number(page ?? "1") || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const lifecycleKeys = Object.keys(LIFECYCLE_LABELS) as (keyof typeof LIFECYCLE_LABELS)[];

  const [contacts, companies, sources, totalCount, allCount, ...lifecycleCountValues] =
    await Promise.all([
      listContacts(sb, session.workspaceId, {
        limit: PAGE_SIZE,
        offset,
        search: q,
        lifecycle: life,
        source: src,
      }),
      listCompanies(sb, session.workspaceId),
      distinctContactSources(sb, session.workspaceId),
      countContacts(sb, session.workspaceId, { search: q, lifecycle: life, source: src }),
      countContacts(sb, session.workspaceId, { search: q, source: src }),
      ...lifecycleKeys.map((k) =>
        countContacts(sb, session.workspaceId, { search: q, lifecycle: k, source: src }),
      ),
    ]);

  const contactIds = contacts.map((c) => c.id);
  const costByContact = new Map<string, number>();
  if (contactIds.length > 0) {
    const { data: costRows } = await sb
      .from("lead_sources")
      .select("contact_id, cost")
      .in("contact_id", contactIds)
      .not("cost", "is", null);
    for (const row of (costRows ?? []) as { contact_id: string | null; cost: number | null }[]) {
      if (!row.contact_id || row.cost == null) continue;
      costByContact.set(
        row.contact_id,
        (costByContact.get(row.contact_id) ?? 0) + Number(row.cost),
      );
    }
  }

  function formatBRL(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  const lifecycleCounts = lifecycleKeys.map((k, i) => ({
    key: k,
    label: LIFECYCLE_LABELS[k],
    count: lifecycleCountValues[i] as number,
  }));

  const companyById = new Map(companies.map((c) => [c.id, c]));
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function buildHref(patch: Record<string, string | null | undefined>) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (life) params.set("life", life);
    if (src) params.set("src", src);
    if (pageNum > 1) params.set("page", String(pageNum));
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === undefined || v === "") params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `/contatos?${qs}` : "/contatos";
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <PageHeader
        kicker="CRM"
        title="Contatos"
        description={`${totalCount.toLocaleString("pt-BR")} contatos${q || life ? " no filtro" : ""}`}
        actions={
          <>
            <ImportExportButtons contacts={contacts} companies={companies} />
            <NewContactButton companies={companies} />
          </>
        }
      />

      <form className="mb-6 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--ink-4)]" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome, email, telefone..."
            name="q"
            defaultValue={q ?? ""}
          />
        </div>
        <select
          name="src"
          defaultValue={src ?? ""}
          className="h-9 rounded-pill border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 text-xs"
        >
          <option value="">Todas as origens</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {life && <input type="hidden" name="life" value={life} />}
        <Button variant="outline" size="sm" type="submit">
          <Filter className="mr-1 h-4 w-4" /> Filtrar
        </Button>
        {(q || src || life) && (
          <Link
            href="/contatos"
            className="text-xs text-[color:var(--ink-3)] underline-offset-2 hover:text-[color:var(--ink)] hover:underline"
          >
            Limpar
          </Link>
        )}
      </form>

      <div className="mb-6 flex flex-wrap gap-1.5">
        <Link
          href={buildHref({ life: null, page: null })}
          className={`rounded-pill border px-3 py-1 text-xs font-medium ${
            !life
              ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
              : "border-[color:var(--line-2)] text-[color:var(--ink-3)]"
          }`}
        >
          Todos ({allCount})
        </Link>
        {lifecycleCounts.map((s) => (
          <Link
            key={s.key}
            href={buildHref({ life: s.key, page: null })}
            className={`rounded-pill border px-3 py-1 text-xs font-medium ${
              life === s.key
                ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                : "border-[color:var(--line-2)] text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
            }`}
          >
            {s.label} ({s.count})
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Contato</th>
                <th className="px-4 py-3 text-left font-medium">Empresa</th>
                <th className="px-4 py-3 text-left font-medium">Fase</th>
                <th className="px-4 py-3 text-left font-medium">Origem</th>
                <th className="px-4 py-3 text-left font-medium">UTM</th>
                <th className="px-4 py-3 text-left font-medium">CAC</th>
                <th className="px-4 py-3 text-left font-medium">Ultimo contato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line)]">
              {contacts.map((c) => {
                const company = c.company_id ? companyById.get(c.company_id) : null;
                return (
                  <tr key={c.id} className="hover:bg-[color:var(--bg-2)]/40">
                    <td className="px-4 py-3">
                      <Link
                        href={`/contatos/${c.id}`}
                        className="font-medium hover:text-[color:var(--accent)]"
                      >
                        {c.name}
                      </Link>
                      <div className="text-xs text-[color:var(--ink-3)]">{c.email ?? c.phone ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{company?.name ?? "—"}</div>
                      <div className="text-xs text-[color:var(--ink-3)]">{c.position ?? ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={LIFECYCLE_LABELS[c.lifecycle_stage as keyof typeof LIFECYCLE_LABELS] ?? c.lifecycle_stage}
                        tone={
                          c.lifecycle_stage === "customer"
                            ? "good"
                            : c.lifecycle_stage === "lost"
                              ? "bad"
                              : c.lifecycle_stage === "opportunity"
                                ? "accent"
                                : "neutral"
                        }
                      />
                    </td>
                    <td className="px-4 py-3 text-xs">{c.source ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">
                      {c.utm_source ? (
                        <div>
                          <div className="font-mono">{c.utm_source} / {c.utm_medium ?? ""}</div>
                          <div className="text-[color:var(--ink-4)]">{c.utm_campaign ?? ""}</div>
                        </div>
                      ) : (
                        <span className="text-[color:var(--ink-4)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {costByContact.has(c.id) ? (
                        formatBRL(costByContact.get(c.id) ?? 0)
                      ) : (
                        <span className="text-[color:var(--ink-4)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[color:var(--ink-3)]">
                      {formatRelative(c.last_contacted_at)}
                    </td>
                  </tr>
                );
              })}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-[color:var(--ink-3)]">
                    Nenhum contato encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[color:var(--line)] px-4 py-3 text-xs text-[color:var(--ink-3)]">
            <span>
              Pagina {pageNum} de {totalPages} · mostrando {contacts.length} de {totalCount}
            </span>
            <div className="flex gap-1">
              <Link
                href={buildHref({ page: pageNum > 2 ? String(pageNum - 1) : null })}
                aria-disabled={pageNum === 1}
                className={`flex items-center gap-1 rounded-pill border border-[color:var(--line-2)] px-3 py-1 ${
                  pageNum === 1
                    ? "pointer-events-none opacity-40"
                    : "hover:bg-[color:var(--bg-2)]"
                }`}
              >
                <ChevronLeft className="h-3 w-3" /> Anterior
              </Link>
              <Link
                href={buildHref({
                  page: pageNum < totalPages ? String(pageNum + 1) : null,
                })}
                aria-disabled={pageNum >= totalPages}
                className={`flex items-center gap-1 rounded-pill border border-[color:var(--line-2)] px-3 py-1 ${
                  pageNum >= totalPages
                    ? "pointer-events-none opacity-40"
                    : "hover:bg-[color:var(--bg-2)]"
                }`}
              >
                Proxima <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
