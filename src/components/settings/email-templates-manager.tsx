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
  createEmailTemplate,
  deleteEmailTemplate,
  toggleEmailTemplateActive,
} from "@/lib/actions/templates";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  category: string | null;
  is_active: boolean;
  updated_at: string;
}

const CATEGORIES = [
  { key: "", label: "(Sem categoria)" },
  { key: "transactional", label: "Transacional" },
  { key: "marketing", label: "Marketing" },
  { key: "nurture", label: "Nurture / Sequencia" },
  { key: "onboarding", label: "Onboarding" },
];

export function EmailTemplatesManager({ templates }: { templates: EmailTemplate[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  async function handleCreate(form: FormData) {
    const body = {
      name: String(form.get("name") ?? ""),
      subject: String(form.get("subject") ?? ""),
      body_html: String(form.get("body_html") ?? ""),
      body_text: (form.get("body_text") as string) || null,
      category: (form.get("category") as string) || null,
    };
    start(async () => {
      const result = await createEmailTemplate(body);
      if (result.ok) {
        toast.success("Template criado");
        setShowForm(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir o template "${name}"?`)) return;
    start(async () => {
      const result = await deleteEmailTemplate(id);
      if (result.ok) {
        toast.success("Template excluido");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleToggle(id: string, active: boolean) {
    start(async () => {
      const result = await toggleEmailTemplateActive(id, !active);
      if (result.ok) {
        toast.success(active ? "Desativado" : "Ativado");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  const previewing = templates.find((t) => t.id === previewId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--ink-3)]">
          {templates.length} template(s) · {templates.filter((t) => t.is_active).length} ativos
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="et-name">Nome interno</Label>
              <Input id="et-name" name="name" required autoFocus placeholder="Boas-vindas pos-trial" />
            </div>
            <div>
              <Label htmlFor="et-cat">Categoria</Label>
              <select
                id="et-cat"
                name="category"
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="et-subject">Assunto</Label>
            <Input
              id="et-subject"
              name="subject"
              required
              placeholder="Bem vindo ao {{workspace_name}}!"
            />
          </div>
          <div>
            <Label htmlFor="et-html">Corpo HTML</Label>
            <textarea
              id="et-html"
              name="body_html"
              required
              rows={8}
              className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 font-mono text-xs"
              placeholder={"<p>Olá {{contact_name}},</p>\n<p>...</p>"}
            />
            <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
              Variaveis disponiveis: {`{{contact_name}}, {{contact_email}}, {{workspace_name}}, {{deal_title}}, {{deal_value}}`}
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
                    onClick={() => setPreviewId(previewId === t.id ? null : t.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium hover:text-[color:var(--accent)]">{t.name}</span>
                      <StatusBadge
                        label={t.is_active ? "Ativo" : "Inativo"}
                        tone={t.is_active ? "good" : "neutral"}
                      />
                      {t.category && (
                        <span className="rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 text-[10px] text-[color:var(--ink-3)]">
                          {t.category}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-[color:var(--ink-3)]">
                      {t.subject}
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
                {previewing?.id === t.id && (
                  <div className="mt-3 rounded-md border border-[color:var(--line)] bg-[color:var(--bg)] p-3">
                    <div
                      className="prose prose-sm max-w-none text-[color:var(--ink-2)]"
                      dangerouslySetInnerHTML={{ __html: t.body_html }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
