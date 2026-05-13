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
  createWhatsappTemplate,
  deleteWhatsappTemplate,
  toggleWhatsappTemplateActive,
} from "@/lib/actions/templates";

interface WaTemplate {
  id: string;
  name: string;
  body: string;
  language: string;
  category: string | null;
  status: string;
  is_active: boolean;
}

const STATUS_TONES = {
  draft: "neutral",
  pending: "warn",
  approved: "good",
  rejected: "bad",
} as const;

export function WhatsappTemplatesManager({ templates }: { templates: WaTemplate[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  async function handleCreate(form: FormData) {
    const body = {
      name: String(form.get("name") ?? ""),
      body: String(form.get("body") ?? ""),
      language: String(form.get("language") ?? "pt_BR"),
      category: (form.get("category") as string) || null,
    };
    start(async () => {
      const result = await createWhatsappTemplate(body);
      if (result.ok) {
        toast.success("Template criado (rascunho — submeta a Meta para aprovacao)");
        setShowForm(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir "${name}"?`)) return;
    start(async () => {
      const result = await deleteWhatsappTemplate(id);
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
      const result = await toggleWhatsappTemplateActive(id, !active);
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
          {templates.length} template(s) · {templates.filter((t) => t.status === "approved").length} aprovado(s) pela Meta
        </p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" /> Novo template
          </Button>
        )}
      </div>

      {showForm && (
        <form
          action={handleCreate}
          className="space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <Label htmlFor="wa-name">Nome (snake_case)</Label>
              <Input
                id="wa-name"
                name="name"
                required
                autoFocus
                placeholder="boas_vindas_lead"
                pattern="[a-z0-9_]+"
              />
            </div>
            <div>
              <Label htmlFor="wa-cat">Categoria Meta</Label>
              <select
                id="wa-cat"
                name="category"
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                <option value="">(nao informado)</option>
                <option value="MARKETING">MARKETING</option>
                <option value="UTILITY">UTILITY</option>
                <option value="AUTHENTICATION">AUTHENTICATION</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <Label htmlFor="wa-lang">Idioma</Label>
              <select
                id="wa-lang"
                name="language"
                defaultValue="pt_BR"
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                <option value="pt_BR">pt_BR</option>
                <option value="en">en</option>
                <option value="es">es</option>
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="wa-body">Corpo</Label>
            <textarea
              id="wa-body"
              name="body"
              required
              rows={6}
              className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              placeholder={"Ola {{1}}, recebemos seu contato sobre {{2}}.\nVamos agendar uma conversa?"}
            />
            <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
              Use {`{{1}}`}, {`{{2}}`} para variaveis (padrao Meta WhatsApp).
            </p>
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
              Criar template
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        {templates.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhum template ainda.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {templates.map((t) => (
              <li key={t.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setOpenId(openId === t.id ? null : t.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-medium hover:text-[color:var(--accent)]">
                        {t.name}
                      </span>
                      <StatusBadge
                        label={t.status}
                        tone={STATUS_TONES[t.status as keyof typeof STATUS_TONES] ?? "neutral"}
                      />
                      <span className="rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 text-[10px] text-[color:var(--ink-3)]">
                        {t.language}
                      </span>
                      {t.category && (
                        <span className="rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 text-[10px] text-[color:var(--ink-3)]">
                          {t.category}
                        </span>
                      )}
                      <StatusBadge
                        label={t.is_active ? "Ativo" : "Inativo"}
                        tone={t.is_active ? "good" : "neutral"}
                      />
                    </div>
                  </button>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(t.id, t.is_active)}
                      disabled={pending}
                    >
                      {t.is_active ? "Desativar" : "Ativar"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(t.id, t.name)}
                      disabled={pending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {openId === t.id && (
                  <pre className="mt-3 whitespace-pre-wrap rounded-md border border-[color:var(--line)] bg-[color:var(--bg)] p-3 text-xs text-[color:var(--ink-2)]">
                    {t.body}
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
