import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { WidgetCard } from "@/components/shared/widget-card";
import { getSession } from "@/lib/auth/guards";
import { MergeGroupButton } from "@/components/contacts/merge-group-button";

export const metadata = { title: "Duplicatas · AdSales Hub" };

interface ContactRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  created_at: string;
}

interface DuplicateGroup {
  key: string;
  type: "email" | "phone" | "whatsapp";
  value: string;
  contacts: ContactRow[];
}

function groupBy(
  contacts: ContactRow[],
  field: "email" | "phone" | "whatsapp",
): DuplicateGroup[] {
  const map = new Map<string, ContactRow[]>();
  for (const c of contacts) {
    const v = (c[field] ?? "").toLowerCase().trim();
    if (!v) continue;
    const bucket = map.get(v) ?? [];
    bucket.push(c);
    map.set(v, bucket);
  }
  return [...map.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([value, list]) => ({
      key: `${field}::${value}`,
      type: field,
      value,
      contacts: list.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    }))
    .sort((a, b) => b.contacts.length - a.contacts.length);
}

export default async function DuplicatesPage() {
  const session = await getSession();
  const { data } = await session.supabase
    .from("contacts")
    .select("id, name, email, phone, whatsapp, created_at")
    .eq("workspace_id", session.workspaceId)
    .is("merged_into_contact_id", null)
    .order("created_at", { ascending: true });
  const contacts = (data ?? []) as unknown as ContactRow[];

  const byEmail = groupBy(contacts, "email");
  const byPhone = groupBy(contacts, "phone");
  const byWhatsapp = groupBy(contacts, "whatsapp");

  const allGroups: DuplicateGroup[] = [...byEmail, ...byPhone, ...byWhatsapp];
  const dedupSeen = new Set<string>();
  const uniqueGroups = allGroups.filter((g) => {
    if (dedupSeen.has(g.key)) return false;
    dedupSeen.add(g.key);
    return true;
  });

  const totalDups = uniqueGroups.reduce((a, g) => a + g.contacts.length - 1, 0);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="CRM"
        title="Detectar duplicatas"
        description="Contatos com mesmo email, telefone ou WhatsApp. Use o link para abrir o detalhe e decidir qual manter."
      />

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Grupos com duplicata" value={String(uniqueGroups.length)} />
        <MetricCard
          label="Contatos duplicados"
          value={String(totalDups)}
          hint="além do mais antigo"
        />
        <MetricCard label="Por email" value={String(byEmail.length)} />
        <MetricCard label="Por telefone/WA" value={String(byPhone.length + byWhatsapp.length)} />
      </section>

      <WidgetCard kicker="Encontrados" title="Grupos de duplicatas" padding="none">
        {uniqueGroups.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhuma duplicata detectada — base limpa! 🎉
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {uniqueGroups.map((g) => (
              <li key={g.key} className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 text-[10px] uppercase text-[color:var(--ink-3)]">
                    {g.type}
                  </span>
                  <span className="font-mono text-xs text-[color:var(--ink-2)]">{g.value}</span>
                  <span className="text-xs text-[color:var(--ink-4)]">
                    {g.contacts.length} contatos
                  </span>
                  <div className="ml-auto">
                    <MergeGroupButton group={g.contacts} />
                  </div>
                </div>
                <ul className="mt-3 space-y-1">
                  {g.contacts.map((c, i) => (
                    <li key={c.id} className="flex items-center gap-2 text-sm">
                      <span
                        className={`text-[10px] uppercase tracking-kicker ${
                          i === 0 ? "text-[color:var(--good)]" : "text-[color:var(--ink-4)]"
                        }`}
                      >
                        {i === 0 ? "Manter" : "Duplicata"}
                      </span>
                      <Link
                        href={`/contatos/${c.id}`}
                        className="flex-1 truncate hover:text-[color:var(--accent)]"
                      >
                        {c.name}
                      </Link>
                      <span className="text-xs text-[color:var(--ink-4)]">
                        {new Date(c.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </WidgetCard>

      <p className="mt-4 text-xs text-[color:var(--ink-4)]">
        O merge consolida deals, atividades, notas, ligações e conversas no contato principal.
        Os secundários são arquivados (não deletados) e ficam acessíveis no log de auditoria.
      </p>
    </div>
  );
}
