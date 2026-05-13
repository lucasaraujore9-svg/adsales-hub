"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  setUserActive,
  setWorkspaceUserRole,
} from "@/lib/actions/super-admin";

const ROLES = ["admin", "gestor", "vendedor", "media_buyer", "visualizador"] as const;

interface Props {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
    is_active: boolean;
    is_super_admin: boolean;
    staff_role: string | null;
    last_seen_at: string | null;
  };
  canEdit: boolean;
}

export function WorkspaceUserRow({ user, canEdit }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function changeRole(role: string) {
    start(async () => {
      const r = await setWorkspaceUserRole({ user_id: user.id, role });
      if (r.ok) {
        toast.success(`Role alterado para ${role}.`);
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha");
      }
    });
  }

  function toggleActive() {
    start(async () => {
      const r = await setUserActive({ user_id: user.id, is_active: !user.is_active });
      if (r.ok) {
        toast.success(user.is_active ? "Usuario desativado." : "Usuario reativado.");
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha");
      }
    });
  }

  return (
    <li className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{user.name ?? user.email}</span>
          {user.is_super_admin && (
            <span className="rounded-pill border border-[color:var(--bad)]/40 bg-[color:var(--bad)]/10 px-1.5 py-0 text-[9px] uppercase text-[color:var(--bad)]">
              super
            </span>
          )}
          {user.staff_role && (
            <span className="rounded-pill border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/10 px-1.5 py-0 text-[9px] uppercase text-[color:var(--accent)]">
              {user.staff_role}
            </span>
          )}
          {!user.is_active && (
            <span className="rounded-pill border border-[color:var(--ink-4)]/40 px-1.5 py-0 text-[9px] uppercase text-[color:var(--ink-4)]">
              inativo
            </span>
          )}
        </div>
        <div className="font-mono text-[11px] text-[color:var(--ink-4)]">{user.email}</div>
      </div>
      <div className="flex items-center gap-2">
        {canEdit ? (
          <select
            value={user.role}
            onChange={(e) => changeRole(e.target.value)}
            disabled={pending}
            className="h-8 rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-2 text-xs"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        ) : (
          <span className="rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 text-[11px] uppercase">
            {user.role}
          </span>
        )}
        {canEdit && (
          <Button
            size="sm"
            variant="outline"
            onClick={toggleActive}
            disabled={pending}
          >
            {user.is_active ? "Desativar" : "Reativar"}
          </Button>
        )}
      </div>
    </li>
  );
}
