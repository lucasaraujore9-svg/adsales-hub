"use client";

import { useState, useTransition } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createApiKey, deleteApiKey, revokeApiKey } from "@/lib/actions/api-keys";

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

const SCOPES = [
  { key: "contacts:read", label: "Contatos · ler" },
  { key: "contacts:write", label: "Contatos · escrever" },
  { key: "deals:read", label: "Deals · ler" },
  { key: "deals:write", label: "Deals · escrever" },
  { key: "campaigns:read", label: "Campanhas · ler" },
  { key: "campaigns:write", label: "Campanhas · escrever" },
  { key: "forms:read", label: "Formularios · ler" },
  { key: "forms:write", label: "Formularios · escrever" },
  { key: "*", label: "Tudo (admin)" },
];

export function ApiKeysManager({ keys }: { keys: ApiKeyRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "contacts:read",
    "deals:read",
  ]);
  const [revealed, setRevealed] = useState<{ key: string; prefix: string } | null>(null);

  function toggleScope(s: string) {
    setSelectedScopes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  async function handleCreate(form: FormData) {
    if (selectedScopes.length === 0) {
      toast.error("Selecione ao menos 1 escopo");
      return;
    }
    const body = {
      name: String(form.get("name") ?? ""),
      scopes: selectedScopes,
      expires_in_days: Number(form.get("expires_in_days") ?? 0),
    };
    start(async () => {
      const result = await createApiKey(body);
      if (result.ok && result.data) {
        setRevealed({
          key: result.data.plain_key,
          prefix: result.data.prefix,
        });
        setShowForm(false);
        setSelectedScopes(["contacts:read", "deals:read"]);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleRevoke(id: string) {
    if (!confirm("Revogar esta API key? Quem usa vai perder acesso.")) return;
    start(async () => {
      const result = await revokeApiKey(id);
      if (result.ok) {
        toast.success("Revogada");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Excluir permanentemente?")) return;
    start(async () => {
      const result = await deleteApiKey(id);
      if (result.ok) {
        toast.success("Excluida");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function copyKey() {
    if (!revealed) return;
    navigator.clipboard.writeText(revealed.key).then(() => toast.success("Copiada"));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--ink-3)]">
          {keys.length} chave(s) ·{" "}
          {keys.filter((k) => !k.revoked_at).length} ativa(s)
        </p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" /> Nova API key
          </Button>
        )}
      </div>

      {showForm && (
        <form
          action={handleCreate}
          className="space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="ak-name">Nome</Label>
              <Input
                id="ak-name"
                name="name"
                required
                autoFocus
                placeholder="Zapier integration"
              />
            </div>
            <div>
              <Label htmlFor="ak-expires">Expira em (dias, 0 = nunca)</Label>
              <Input
                id="ak-expires"
                name="expires_in_days"
                type="number"
                min={0}
                max={3650}
                defaultValue={0}
              />
            </div>
          </div>
          <div>
            <Label>Escopos</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SCOPES.map((s) => {
                const active = selectedScopes.includes(s.key);
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => toggleScope(s.key)}
                    className={`rounded-pill border px-3 py-1 text-xs font-medium ${
                      active
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                        : "border-[color:var(--line-2)] text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Gerando..." : "Gerar key"}
            </Button>
          </div>
        </form>
      )}

      {revealed && (
        <Dialog open={!!revealed} onOpenChange={(o) => !o && setRevealed(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sua API key</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <p className="text-[color:var(--ink-3)]">
                Copie agora — esta e a unica vez que mostraremos a chave completa. Apos fechar, o
                sistema so guarda o hash.
              </p>
              <div className="flex items-stretch gap-2">
                <code className="flex-1 break-all rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] p-3 font-mono text-xs">
                  {revealed.key}
                </code>
                <Button size="sm" variant="outline" onClick={copyKey}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-[10px] text-[color:var(--ink-4)]">
                Use no header: <code className="font-mono">Authorization: Bearer {revealed.prefix}...</code>
              </p>
            </div>
            <DialogFooter>
              <Button size="sm" onClick={() => setRevealed(null)}>
                Ja copiei
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        {keys.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhuma API key.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {keys.map((k) => {
              const isRevoked = !!k.revoked_at;
              const isExpired =
                k.expires_at && new Date(k.expires_at) < new Date();
              return (
                <li key={k.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{k.name}</span>
                        <code className="rounded bg-[color:var(--bg-2)] px-2 py-0.5 font-mono text-[10px] text-[color:var(--ink-3)]">
                          {k.key_prefix}...
                        </code>
                        {isRevoked ? (
                          <StatusBadge label="Revogada" tone="bad" />
                        ) : isExpired ? (
                          <StatusBadge label="Expirada" tone="warn" />
                        ) : (
                          <StatusBadge label="Ativa" tone="good" />
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(k.scopes ?? []).map((s) => (
                          <span
                            key={s}
                            className="rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 font-mono text-[10px] text-[color:var(--ink-3)]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="mt-1 text-[10px] text-[color:var(--ink-4)]">
                        Criada {new Date(k.created_at).toLocaleDateString("pt-BR")}
                        {k.last_used_at
                          ? ` · usada ${new Date(k.last_used_at).toLocaleDateString("pt-BR")}`
                          : " · nunca usada"}
                        {k.expires_at
                          ? ` · expira ${new Date(k.expires_at).toLocaleDateString("pt-BR")}`
                          : ""}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {!isRevoked && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevoke(k.id)}
                          disabled={pending}
                        >
                          Revogar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(k.id)}
                        disabled={pending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
