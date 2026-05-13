import { listUsers } from "@/lib/queries/super-admin";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { UserSuperAdminToggle } from "@/components/super-admin/user-super-admin-toggle";

export const metadata = { title: "Super Admin · Usuarios" };

export default async function SuperAdminUsers() {
  const session = await requireSuperAdmin();
  const rows = await listUsers();

  return (
    <div className="space-y-6">
      <div>
        <span className="kicker">Usuarios</span>
        <h1 className="mt-2 text-2xl font-medium tracking-tighter2">
          {rows.length} usuarios
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--ink-3)]">
          Promova/remova super admins. O super admin tem acesso a todos os workspaces e
          contorna planos e limites.
        </p>
      </div>

      <div className="overflow-x-auto rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Nome</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Workspace</th>
              <th className="px-4 py-3 text-right font-medium">Super admin</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-[color:var(--line)] last:border-0">
                <td className="px-4 py-3 font-mono text-[12px]">{u.email}</td>
                <td className="px-4 py-3">{u.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 text-[11px] uppercase">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-[color:var(--ink-3)]">
                  {u.workspace_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <UserSuperAdminToggle
                    userId={u.id}
                    isSuperAdmin={u.is_super_admin}
                    isSelf={u.id === session.user.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
