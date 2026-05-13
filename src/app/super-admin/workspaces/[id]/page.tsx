import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireStaff, staffCan } from "@/lib/auth/guards";
import {
  getWorkspaceDetail,
  listWorkspaceUsers,
  listWorkspaceAdAccounts,
  listWorkspaceSocialAccounts,
} from "@/lib/queries/super-admin";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { MetricCard } from "@/components/shared/metric-card";
import { WorkspaceEditForm } from "@/components/super-admin/workspace-edit-form";
import { WorkspaceUserRow } from "@/components/super-admin/workspace-user-row";
import { IntegrationRowActions } from "@/components/super-admin/integration-row-actions";
import { WorkspaceRowActions } from "@/components/super-admin/workspace-row-actions";

export const metadata = { title: "Super Admin · Workspace" };

const PLATFORM_DOT: Record<string, string> = {
  instagram: "#E1306C",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  tiktok: "#000",
  youtube: "#FF0000",
  pinterest: "#E60023",
};

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireStaff();
  const { id } = await params;
  const [detail, users, adAccounts, socialAccounts] = await Promise.all([
    getWorkspaceDetail(id),
    listWorkspaceUsers(id),
    listWorkspaceAdAccounts(id),
    listWorkspaceSocialAccounts(id),
  ]);

  if (!detail) notFound();

  const canEdit = staffCan(session, "edit_workspace");
  const canManageInteg = staffCan(session, "manage_integrations");

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Button asChild size="sm" variant="outline">
            <Link href="/super-admin/workspaces">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Workspaces
            </Link>
          </Button>
          <div className="mt-3 flex items-center gap-3">
            <h1 className="text-2xl font-medium tracking-tighter2">{detail.name}</h1>
            {detail.basket_name && (
              <span
                className={`rounded-pill border px-2 py-0.5 text-[11px] uppercase ${
                  detail.basket_name === "master"
                    ? "border-[color:var(--bad)]/40 bg-[color:var(--bad)]/10 text-[color:var(--bad)]"
                    : "border-[color:var(--line-2)] text-[color:var(--ink-3)]"
                }`}
              >
                {detail.basket_name}
              </span>
            )}
            {detail.subscription_status && (
              <StatusBadge
                label={detail.subscription_status}
                tone={detail.subscription_status === "active" ? "good" : "neutral"}
              />
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[color:var(--ink-4)]">
            <span className="font-mono">{detail.slug}</span>
            <span>·</span>
            <span>{detail.timezone}</span>
            {detail.domain && (
              <>
                <span>·</span>
                <a
                  href={`https://${detail.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[color:var(--accent)]"
                >
                  {detail.domain} <ExternalLink className="h-3 w-3" />
                </a>
              </>
            )}
          </div>
        </div>
        <div className="flex items-end">
          <WorkspaceRowActions
            workspaceId={detail.id}
            currentBasket={detail.basket_name}
            unlimited={detail.credits.unlimited}
          />
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Usuarios" value={String(users.length)} />
        <MetricCard
          label="Saldo creditos"
          value={detail.credits.unlimited ? "∞" : detail.credits.balance.toLocaleString("pt-BR")}
          hint={
            detail.credits.unlimited
              ? "ilimitado"
              : `+${detail.credits.monthly_allowance}/mes`
          }
          emphasis="inverse"
        />
        <MetricCard label="Ad accounts" value={String(adAccounts.length)} />
        <MetricCard label="Social accounts" value={String(socialAccounts.length)} />
      </section>

      <section className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          Geral
        </h2>
        <WorkspaceEditForm
          workspaceId={detail.id}
          initial={{
            name: detail.name,
            slug: detail.slug,
            domain: detail.domain,
            timezone: detail.timezone,
            locale: detail.locale,
          }}
          readOnly={!canEdit}
        />
      </section>

      <section className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        <header className="flex items-center justify-between border-b border-[color:var(--line)] px-5 py-3">
          <h2 className="text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
            Usuarios ({users.length})
          </h2>
        </header>
        <ul className="divide-y divide-[color:var(--line)]">
          {users.map((u) => (
            <WorkspaceUserRow key={u.id} user={u} canEdit={canEdit} />
          ))}
          {users.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
              Sem usuarios neste workspace.
            </li>
          )}
        </ul>
      </section>

      <section className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        <header className="flex items-center justify-between border-b border-[color:var(--line)] px-5 py-3">
          <h2 className="text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
            Integracoes externas
          </h2>
          <span className="text-[11px] text-[color:var(--ink-4)]">
            {adAccounts.length + socialAccounts.length} conexoes
          </span>
        </header>
        <div className="px-5 py-4">
          <h3 className="mb-2 text-[11px] uppercase tracking-kicker text-[color:var(--ink-4)]">
            Ad accounts
          </h3>
          {adAccounts.length === 0 ? (
            <p className="text-sm text-[color:var(--ink-3)]">Nenhuma conta de ads conectada.</p>
          ) : (
            <ul className="divide-y divide-[color:var(--line)]">
              {adAccounts.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-medium">{a.account_name}</div>
                    <div className="font-mono text-[10px] uppercase text-[color:var(--ink-4)]">
                      {a.provider} · {a.currency} · {a.timezone}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      label={a.status}
                      tone={a.status === "active" ? "good" : "bad"}
                    />
                    {canManageInteg && a.status !== "disconnected" && (
                      <IntegrationRowActions scope="ad_account" id={a.id} />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-[color:var(--line)] px-5 py-4">
          <h3 className="mb-2 text-[11px] uppercase tracking-kicker text-[color:var(--ink-4)]">
            Social accounts
          </h3>
          {socialAccounts.length === 0 ? (
            <p className="text-sm text-[color:var(--ink-3)]">Nenhuma rede conectada.</p>
          ) : (
            <ul className="divide-y divide-[color:var(--line)]">
              {socialAccounts.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: PLATFORM_DOT[s.platform] ?? "#999" }}
                    />
                    <div>
                      <div className="font-medium">{s.account_name}</div>
                      <div className="text-[10px] uppercase text-[color:var(--ink-4)]">
                        {s.platform}
                        {s.token_expires_at &&
                          ` · expira ${new Date(s.token_expires_at).toLocaleDateString("pt-BR")}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      label={s.status}
                      tone={s.status === "active" ? "good" : s.status === "expired" ? "warn" : "bad"}
                    />
                    {canManageInteg && s.status !== "disconnected" && (
                      <IntegrationRowActions scope="social_account" id={s.id} />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          API Keys & webhooks
        </h2>
        <p className="text-sm text-[color:var(--ink-3)]">
          As chaves do sistema (Anthropic, Together, Asaas, Meta, etc.) sao globais e ficam no
          servidor — nao por workspace. Para inspecionar/rotacionar, edite o
          <span className="font-mono"> /opt/adsaleshub/.env</span> da VPS e rode
          <span className="font-mono"> docker service update --force adsaleshub_web</span>.
        </p>
        <p className="mt-2 text-sm text-[color:var(--ink-3)]">
          Webhooks recebidos por este workspace: Asaas e Mercado Pago em
          <span className="font-mono"> /api/webhooks/&lt;gateway&gt;</span>; Meta lead webhooks em
          <span className="font-mono"> /api/webhooks/meta</span>.
        </p>
      </section>
    </div>
  );
}
