import { listInternalStaff } from "@/lib/queries/super-admin";
import { requireStaff } from "@/lib/auth/guards";
import { StaffRoleSelector } from "@/components/super-admin/staff-role-selector";

export const metadata = { title: "Super Admin · Equipe" };

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  engineering: "Engenharia",
  customer_success: "Customer Success",
  support: "Suporte",
  sales: "Vendas",
};

const ROLE_DESC: Record<string, string> = {
  admin: "Acesso total ao painel interno (exceto promover super admins).",
  engineering: "Visualiza tudo + ajusta integrações e cron.",
  customer_success: "Concede creditos, muda planos, edita workspaces.",
  support: "Apenas leitura: investigacao e triagem.",
  sales: "Edita workspaces de demo e cria contas.",
};

export default async function SuperAdminStaffPage() {
  const session = await requireStaff();
  const staff = await listInternalStaff();

  // Group by staff role / super_admin
  const groups: Record<string, typeof staff> = {
    super_admin: [],
    admin: [],
    engineering: [],
    customer_success: [],
    support: [],
    sales: [],
  };
  for (const u of staff) {
    if (u.is_super_admin) groups.super_admin.push(u);
    else if (u.role && groups[u.role]) groups[u.role].push(u);
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="kicker">Equipe</span>
        <h1 className="mt-2 text-2xl font-medium tracking-tighter2">Equipe interna</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--ink-3)]">
          Funcionarios da AdSales Hub que atuam em suporte, sucesso do cliente, vendas internas e
          engenharia. Atribua um cargo de equipe para liberar o painel — workspace role continua
          governando o acesso dentro do tenant.
        </p>
      </div>

      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        <header className="border-b border-[color:var(--line)] px-5 py-3">
          <h2 className="text-sm font-medium">Capacidades por cargo</h2>
        </header>
        <ul className="divide-y divide-[color:var(--line)] text-sm">
          {Object.entries(ROLE_LABEL).map(([k, label]) => (
            <li key={k} className="grid grid-cols-1 gap-1 px-5 py-3 md:grid-cols-[200px_1fr]">
              <span className="font-medium">{label}</span>
              <span className="text-[color:var(--ink-3)]">{ROLE_DESC[k]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        <header className="flex items-center justify-between border-b border-[color:var(--line)] px-5 py-3">
          <h2 className="text-sm font-medium">{staff.length} membros internos</h2>
          {!session.isSuperAdmin && (
            <span className="text-[11px] text-[color:var(--ink-4)]">
              somente super admin pode editar
            </span>
          )}
        </header>
        <ul className="divide-y divide-[color:var(--line)]">
          {staff.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
              Nenhum membro interno cadastrado.
            </li>
          )}
          {staff.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{u.name ?? u.email}</span>
                  {u.is_super_admin && (
                    <span className="rounded-pill border border-[color:var(--bad)]/40 bg-[color:var(--bad)]/10 px-1.5 py-0 text-[9px] uppercase text-[color:var(--bad)]">
                      super admin
                    </span>
                  )}
                </div>
                <div className="font-mono text-[11px] text-[color:var(--ink-4)]">
                  {u.email} · {u.workspace_name ?? "—"}
                </div>
              </div>
              <StaffRoleSelector
                userId={u.id}
                currentRole={
                  u.is_super_admin
                    ? "admin"
                    : (groups.engineering.includes(u) && "engineering") ||
                      (groups.customer_success.includes(u) && "customer_success") ||
                      (groups.support.includes(u) && "support") ||
                      (groups.sales.includes(u) && "sales") ||
                      (groups.admin.includes(u) && "admin") ||
                      null
                }
                disabled={!session.isSuperAdmin || u.is_super_admin}
                isSelf={u.id === session.user.id}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
