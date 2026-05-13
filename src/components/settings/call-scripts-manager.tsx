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
  createCallScript,
  deleteCallScript,
  toggleCallScriptActive,
} from "@/lib/actions/templates";

interface CallScript {
  id: string;
  name: string;
  content: string;
  is_active: boolean;
  updated_at: string;
}

export function CallScriptsManager({ scripts }: { scripts: CallScript[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  async function handleCreate(form: FormData) {
    const body = {
      name: String(form.get("name") ?? ""),
      content: String(form.get("content") ?? ""),
    };
    start(async () => {
      const result = await createCallScript(body);
      if (result.ok) {
        toast.success("Script criado");
        setShowForm(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir o script "${name}"?`)) return;
    start(async () => {
      const result = await deleteCallScript(id);
      if (result.ok) {
        toast.success("Excluido");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleToggle(id: string, active: boolean) {
    start(async () => {
      const result = await toggleCallScriptActive(id, !active);
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
          {scripts.length} script(s) · {scripts.filter((s) => s.is_active).length} ativos
        </p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" /> Novo script
          </Button>
        )}
      </div>

      {showForm && (
        <form
          action={handleCreate}
          className="space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
        >
          <div>
            <Label htmlFor="cs-name">Nome</Label>
            <Input id="cs-name" name="name" required autoFocus placeholder="Cold call B2B SaaS" />
          </div>
          <div>
            <Label htmlFor="cs-content">Roteiro</Label>
            <textarea
              id="cs-content"
              name="content"
              required
              rows={10}
              className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              placeholder={"1. Apresentacao: 'Oi {{contact_name}}, aqui é {{user_name}} da {{workspace_name}}...'\n2. Pergunta de qualificacao\n3. ..."}
            />
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
              Criar script
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        {scripts.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhum script ainda.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {scripts.map((s) => (
              <li key={s.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setOpenId(openId === s.id ? null : s.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium hover:text-[color:var(--accent)]">{s.name}</span>
                      <StatusBadge
                        label={s.is_active ? "Ativo" : "Inativo"}
                        tone={s.is_active ? "good" : "neutral"}
                      />
                    </div>
                  </button>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(s.id, s.is_active)}
                      disabled={pending}
                    >
                      {s.is_active ? "Desativar" : "Ativar"}
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
                </div>
                {openId === s.id && (
                  <pre className="mt-3 whitespace-pre-wrap rounded-md border border-[color:var(--line)] bg-[color:var(--bg)] p-3 text-xs text-[color:var(--ink-2)]">
                    {s.content}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
