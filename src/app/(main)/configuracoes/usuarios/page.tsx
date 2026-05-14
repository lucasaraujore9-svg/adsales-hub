import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getSession } from "@/lib/auth/guards";
import { listWorkspaceUsers } from "@/lib/queries/crm";
import { listPendingInvites } from "@/lib/queries/invites";
import { InviteUserButton } from "@/components/settings/invite-user-button";
import { PendingInvitesTable } from "@/components/settings/pending-invites-table";

export const metadata = { title: "Usuários · AdSales Hub" };

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  gestor: "Gestor",
  vendedor: "Vendedor",
  media_buyer: "Media Buyer",
  visualizador: "Visualizador",
};

const ROLE_TONES = {
  admin: "accent",
  gestor: "good",
  vendedor: "neutral",
  media_buyer: "warn",
  visualizador: "neutral",
} as const;

export default async function UsersPage() {
  const session = await getSession();
  const [users, pendingInvites] = await Promise.all([
    listWorkspaceUsers(session.supabase, session.workspaceId),
    listPendingInvites(session.workspaceId).catch(() => []),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configurações
      </Link>
      <PageHeader
        kicker="Workspace"
        title="Usuários e permissões"
        description={
          pendingInvites.length > 0
            ? `${users.length} ativos · ${pendingInvites.length} pendente${pendingInvites.length === 1 ? "" : "s"}`
            : `${users.length} usuários no workspace`
        }
        actions={<InviteUserButton />}
      />

      {pendingInvites.length > 0 && (
        <WidgetCard
          kicker={`Pendentes (${pendingInvites.length})`}
          title="Convites aguardando aceite"
          padding="none"
          className="mb-6"
        >
          <PendingInvitesTable invites={pendingInvites} />
        </WidgetCard>
      )}

      <WidgetCard kicker="Equipe" title="Membros ativos" padding="none">
        <table className="w-full text-sm">
          <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Usuario</th>
              <th className="px-5 py-3 text-left font-medium">Email</th>
              <th className="px-5 py-3 text-left font-medium">Role</th>
              <th className="px-5 py-3 text-right font-medium">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--line)]">
            {users.map((u) => {
              const tone = ROLE_TONES[u.role as keyof typeof ROLE_TONES] ?? "neutral";
              return (
                <tr key={u.id} className="hover:bg-[color:var(--bg-2)]/40">
                  <td className="px-5 py-3 font-medium">{u.name ?? "—"}</td>
                  <td className="px-5 py-3 text-xs text-[color:var(--ink-3)]">{u.email}</td>
                  <td className="px-5 py-3">
                    <StatusBadge label={ROLE_LABELS[u.role] ?? u.role} tone={tone} />
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-[color:var(--ink-4)]">
                    {u.id === session.user.id ? "você" : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </WidgetCard>

      <WidgetCard
        kicker="Permissoes"
        title="O que cada role pode fazer"
        className="mt-6"
      >
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
            <tr>
              <th className="py-2 text-left font-medium">Role</th>
              <th className="py-2 text-left font-medium">Pipeline</th>
              <th className="py-2 text-left font-medium">Campanhas</th>
              <th className="py-2 text-left font-medium">Config</th>
              <th className="py-2 text-left font-medium">Billing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--line)] text-xs">
            {[
              { role: "Admin", pipeline: "CRUD", camp: "CRUD", cfg: "CRUD", billing: "CRUD" },
              { role: "Gestor", pipeline: "CRUD", camp: "CRUD", cfg: "Read", billing: "Read" },
              { role: "Vendedor", pipeline: "CRUD proprios", camp: "Read", cfg: "Read", billing: "—" },
              { role: "Media Buyer", pipeline: "Read", camp: "CRUD", cfg: "Read", billing: "—" },
              { role: "Visualizador", pipeline: "Read", camp: "Read", cfg: "Read", billing: "—" },
            ].map((r) => (
              <tr key={r.role}>
                <td className="py-2 font-medium">{r.role}</td>
                <td className="py-2 text-[color:var(--ink-3)]">{r.pipeline}</td>
                <td className="py-2 text-[color:var(--ink-3)]">{r.camp}</td>
                <td className="py-2 text-[color:var(--ink-3)]">{r.cfg}</td>
                <td className="py-2 text-[color:var(--ink-3)]">{r.billing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </WidgetCard>
    </div>
  );
}
