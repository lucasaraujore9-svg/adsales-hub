"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  createSequence,
  deleteSequence,
  toggleSequenceActive,
} from "@/lib/actions/sequences";

interface Sequence {
  id: string;
  name: string;
  description: string | null;
  target_entity: string;
  is_active: boolean;
  steps_count: number;
}

export function SequencesManager({ sequences }: { sequences: Sequence[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);

  async function handleCreate(form: FormData) {
    const body = {
      name: String(form.get("name") ?? ""),
      description: (form.get("description") as string) || null,
      target_entity: String(form.get("target_entity") ?? "contact"),
    };
    start(async () => {
      const result = await createSequence(body);
      if (result.ok) {
        toast.success("Sequencia criada (rascunho — adicione passos antes de ativar)");
        setShowForm(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir a sequencia "${name}"? Passos vinculados serao removidos.`)) return;
    start(async () => {
      const result = await deleteSequence(id);
      if (result.ok) {
        toast.success("Excluida");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleToggle(id: string, active: boolean, stepsCount: number) {
    if (!active && stepsCount === 0) {
      toast.error("Adicione ao menos 1 passo antes de ativar.");
      return;
    }
    start(async () => {
      const result = await toggleSequenceActive(id, !active);
      if (result.ok) {
        toast.success(active ? "Pausada" : "Ativada");
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
          {sequences.length} sequencia(s) · {sequences.filter((s) => s.is_active).length} ativa(s)
        </p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" /> Nova sequencia
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
              <Label htmlFor="seq-name">Nome</Label>
              <Input id="seq-name" name="name" required autoFocus placeholder="Nurture B2B SaaS" />
            </div>
            <div>
              <Label htmlFor="seq-target">Aplica em</Label>
              <select
                id="seq-target"
                name="target_entity"
                defaultValue="contact"
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                <option value="contact">Contato</option>
                <option value="deal">Negocio</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="seq-desc">Descricao (opcional)</Label>
            <Input id="seq-desc" name="description" placeholder="Quando rodar e objetivo" />
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
              Criar sequencia
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        {sequences.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhuma sequencia ainda.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {sequences.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/configuracoes/sequencias/${s.id}`}
                      className="font-medium hover:text-[color:var(--accent)]"
                    >
                      {s.name}
                    </Link>
                    <StatusBadge
                      label={s.is_active ? "Ativa" : "Pausada"}
                      tone={s.is_active ? "good" : "neutral"}
                    />
                    <span className="rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 text-[10px] text-[color:var(--ink-3)]">
                      {s.target_entity === "contact" ? "Contato" : "Negocio"}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-[color:var(--ink-3)]">
                    {s.steps_count} passo(s){s.description ? ` · ${s.description}` : ""}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/configuracoes/sequencias/${s.id}`}>
                      Editar passos <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(s.id, s.is_active, s.steps_count)}
                    disabled={pending}
                  >
                    {s.is_active ? "Pausar" : "Ativar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(s.id, s.name)}
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
