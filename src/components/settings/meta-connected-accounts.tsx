"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { disconnectMetaAdAccount } from "@/lib/actions/meta-accounts";

interface AccountCard {
  id: string;
  providerAccountId: string;
  name: string;
  currency: string;
  timezone: string;
  status: string;
  tokenExpiresAt: string | null;
  createdAt: string;
}

interface Props {
  accounts: AccountCard[];
}

function tokenStatus(expiresAt: string | null): {
  tone: "good" | "warn" | "bad";
  label: string;
} {
  if (!expiresAt) return { tone: "warn", label: "Sem token" };
  const ms = new Date(expiresAt).getTime() - Date.now();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days < 0) return { tone: "bad", label: "Expirado" };
  if (days < 7) return { tone: "warn", label: `Expira em ${days}d` };
  return { tone: "good", label: `${days}d restantes` };
}

export function MetaConnectedAccounts({ accounts }: Props) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function handleDisconnect(id: string, name: string) {
    if (!confirm(`Desconectar "${name}"? O token será removido.`)) return;
    start(async () => {
      const res = await disconnectMetaAdAccount(id);
      if (res.ok) {
        toast.success("Conta desconectada");
        router.refresh();
      } else {
        toast.error(res.error ?? "Falha ao desconectar");
      }
    });
  }

  return (
    <div className="space-y-2">
      {accounts.map((a) => {
        const tk = tokenStatus(a.tokenExpiresAt);
        return (
          <div
            key={a.id}
            className="flex items-center gap-3 rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[color:var(--bg-2)] text-[color:var(--ink-3)]">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{a.name}</span>
                <StatusBadge
                  label={a.status === "active" ? "Ativa" : a.status}
                  tone={a.status === "active" ? "good" : "warn"}
                />
                <StatusBadge label={tk.label} tone={tk.tone} />
              </div>
              <div className="mt-0.5 truncate text-xs text-[color:var(--ink-4)]">
                <code className="font-mono">{a.providerAccountId}</code> · {a.currency} ·{" "}
                {a.timezone}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              asChild
              title="Renovar token via OAuth"
            >
              <a href="/api/auth/meta/connect">
                <RefreshCw className="h-3.5 w-3.5" />
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => handleDisconnect(a.id, a.name)}
              className="text-[color:var(--bad)] hover:bg-[color:var(--bad)]/10"
              title="Desconectar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}
      {accounts.some((a) => tokenStatus(a.tokenExpiresAt).tone === "bad") && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/10 p-3 text-xs text-[color:var(--bad)]">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Uma ou mais contas tem token expirado. Clique em <RefreshCw className="inline h-3 w-3" />{" "}
            pra reconectar via Facebook.
          </span>
        </div>
      )}
    </div>
  );
}
