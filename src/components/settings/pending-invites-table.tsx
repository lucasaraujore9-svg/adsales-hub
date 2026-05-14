"use client";

import { useTransition } from "react";
import { Mail, RotateCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-provider";
import { resendInvite, revokeInvite } from "@/lib/actions/invites";
import { userRoleLabel } from "@/lib/labels";

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  name: string | null;
  invited_at: string;
  invited_by_name: string | null;
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours < 1) return "agora";
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

export function PendingInvitesTable({ invites }: { invites: PendingInvite[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [pending, start] = useTransition();

  if (invites.length === 0) {
    return (
      <p className="px-5 py-6 text-center text-sm text-[color:var(--ink-3)]">
        Nenhum convite pendente.
      </p>
    );
  }

  function handleResend(invite: PendingInvite) {
    start(async () => {
      const r = await resendInvite({ userId: invite.id });
      if (r.ok) {
        toast.success(`Convite reenviado para ${invite.email}`);
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha ao reenviar");
      }
    });
  }

  async function handleRevoke(invite: PendingInvite) {
    const ok = await confirm({
      title: "Revogar convite?",
      description: `O link enviado para ${invite.email} deixará de funcionar.`,
      confirmLabel: "Revogar",
      variant: "destructive",
    });
    if (!ok) return;
    start(async () => {
      const r = await revokeInvite({ userId: invite.id });
      if (r.ok) {
        toast.success("Convite revogado");
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha ao revogar");
      }
    });
  }

  return (
    <table className="w-full text-sm">
      <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
        <tr>
          <th className="px-5 py-3 text-left font-medium">Email</th>
          <th className="px-5 py-3 text-left font-medium">Role</th>
          <th className="px-5 py-3 text-left font-medium">Convidado</th>
          <th className="px-5 py-3 text-right font-medium">Ações</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[color:var(--line)]">
        {invites.map((i) => (
          <tr key={i.id} className="hover:bg-[color:var(--bg-2)]/40">
            <td className="px-5 py-3">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[color:var(--ink-4)]" />
                <span className="text-xs text-[color:var(--ink-2)]">{i.email}</span>
              </div>
              {i.name && (
                <div className="text-xs text-[color:var(--ink-4)] mt-0.5">{i.name}</div>
              )}
            </td>
            <td className="px-5 py-3 text-xs text-[color:var(--ink-3)]">
              {userRoleLabel(i.role)}
            </td>
            <td className="px-5 py-3 text-xs text-[color:var(--ink-3)]">
              {formatRelative(i.invited_at)}
              {i.invited_by_name && (
                <span className="block text-[color:var(--ink-4)]">por {i.invited_by_name}</span>
              )}
            </td>
            <td className="px-5 py-3 text-right">
              <div className="inline-flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => handleResend(i)}
                  title="Reenviar email com o link"
                >
                  <RotateCw className="mr-1 h-3 w-3" /> Reenviar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => handleRevoke(i)}
                  title="Cancelar o convite"
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
