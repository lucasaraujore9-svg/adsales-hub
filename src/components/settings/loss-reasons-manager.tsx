"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  createLossReason,
  deleteLossReason,
  toggleLossReasonActive,
} from "@/lib/actions/catalog";

interface LossReason {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export function LossReasonsManager({ reasons }: { reasons: LossReason[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);

  async function handleCreate(form: FormData) {
    const body = {
      name: String(form.get("name") ?? ""),
      description: (form.get("description") as string) || null,
    };
    start(async () => {
      const result = await createLossReason(body);
      if (result.ok) {
        toast.success("Motivo criado");
        setShowForm(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir o motivo "${name}"? Deals vinculados ficarao sem motivo.`)) return;
    start(async () => {
      const result = await deleteLossReason(id);
      if (result.ok) {
        toast.success("Motivo excluido");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleToggle(id: string, active: boolean) {
    start(async () => {
      const result = await toggleLossReasonActive(id, !active);
      if (result.ok) {
        toast.success(active ? "Desativado" : "Ativado");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--ink-3)]">
          {reasons.length} motivo(s) · {reasons.filter((r) => r.is_active).length} ativos
        </p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" /> Novo motivo
          </Button>
        )}
      </div>

      {showForm && (
        <form
          action={handleCreate}
          className="space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
        >
          <div>
            <Label htmlFor="lr-name">Nome</Label>
            <Input
              id="lr-name"
              name="name"
              required
              autoFocus
              placeholder="Preco alto / Sem fit / Concorrencia"
            />
          </div>
          <div>
            <Label htmlFor="lr-desc">Descricao (opcional)</Label>
            <Input id="lr-desc" name="description" placeholder="Use para guiar o vendedor" />
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
              Criar motivo
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        {reasons.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhum motivo cadastrado.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {reasons.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.name}</span>
                    <StatusBadge
                      label={r.is_active ? "Ativo" : "Inativo"}
                      tone={r.is_active ? "good" : "neutral"}
                    />
                  </div>
                  {r.description && (
                    <p className="mt-0.5 text-xs text-[color:var(--ink-3)]">{r.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(r.id, r.is_active)}
                    disabled={pending}
                  >
                    {r.is_active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(r.id, r.name)}
                    disabled={pending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
