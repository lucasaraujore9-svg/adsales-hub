"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateFormFields } from "@/lib/actions/content";

interface Field {
  name: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "number" | "date" | "url";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

const TYPES = [
  { key: "text", label: "Texto curto" },
  { key: "textarea", label: "Texto longo" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Telefone" },
  { key: "number", label: "Numero" },
  { key: "date", label: "Data" },
  { key: "url", label: "URL" },
  { key: "select", label: "Selecao" },
] as const;

export function FormFieldsEditor({
  formId,
  initialFields,
}: {
  formId: string;
  initialFields: Field[];
}) {
  const router = useRouter();
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [pending, start] = useTransition();
  const [showNew, setShowNew] = useState(false);
  const [newType, setNewType] = useState<Field["type"]>("text");

  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= fields.length) return;
    setFields((prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function remove(idx: number) {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  }

  function toggleRequired(idx: number) {
    setFields((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, required: !f.required } : f)),
    );
  }

  function updateField(idx: number, patch: Partial<Field>) {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  }

  function addField(form: FormData) {
    const name = String(form.get("name") ?? "").trim();
    const label = String(form.get("label") ?? "").trim();
    const optionsRaw = String(form.get("options") ?? "").trim();
    if (!name || !label) return;
    if (fields.some((f) => f.name === name)) {
      toast.error(`Campo "${name}" já existe`);
      return;
    }
    const newField: Field = {
      name,
      label,
      type: newType,
      required: form.get("required") === "on",
      placeholder: (form.get("placeholder") as string) || undefined,
    };
    if (newType === "select" && optionsRaw) {
      newField.options = optionsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    setFields((prev) => [...prev, newField]);
    setShowNew(false);
  }

  function handleSave() {
    start(async () => {
      const result = await updateFormFields({ id: formId, fields });
      if (result.ok) {
        toast.success("Campos salvos");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        {fields.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhum campo. Adicione abaixo.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {fields.map((f, idx) => (
              <li key={idx} className="px-5 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      className="rounded text-[color:var(--ink-4)] hover:text-[color:var(--ink)] disabled:opacity-30"
                      aria-label="Subir"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(idx, 1)}
                      disabled={idx === fields.length - 1}
                      className="rounded text-[color:var(--ink-4)] hover:text-[color:var(--ink)] disabled:opacity-30"
                      aria-label="Descer"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex-1 grid grid-cols-1 gap-2 md:grid-cols-3">
                    <Input
                      value={f.label}
                      onChange={(e) => updateField(idx, { label: e.target.value })}
                      placeholder="Label"
                      className="text-sm"
                    />
                    <Input
                      value={f.name}
                      onChange={(e) => updateField(idx, { name: e.target.value })}
                      placeholder="snake_case"
                      pattern="[a-z][a-z0-9_]*"
                      className="font-mono text-xs"
                    />
                    <select
                      value={f.type}
                      onChange={(e) => updateField(idx, { type: e.target.value as Field["type"] })}
                      className="rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 text-xs"
                    >
                      {TYPES.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleRequired(idx)}
                    className={`rounded-pill border px-3 py-1 text-[10px] font-medium uppercase ${
                      f.required
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                        : "border-[color:var(--line-2)] text-[color:var(--ink-4)]"
                    }`}
                  >
                    {f.required ? "Obrigatorio" : "Opcional"}
                  </button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {f.type === "select" && (
                  <div className="mt-2 ml-6">
                    <Input
                      value={(f.options ?? []).join(", ")}
                      onChange={(e) =>
                        updateField(idx, {
                          options: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Opcao 1, Opcao 2, Opcao 3"
                      className="text-xs"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showNew ? (
        <form
          action={addField}
          className="space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
        >
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div>
              <Label htmlFor="ff-label">Label</Label>
              <Input id="ff-label" name="label" required autoFocus placeholder="Email da empresa" />
            </div>
            <div>
              <Label htmlFor="ff-name">Nome interno (snake_case)</Label>
              <Input id="ff-name" name="name" required pattern="[a-z][a-z0-9_]*" placeholder="company_email" />
            </div>
            <div>
              <Label htmlFor="ff-type">Tipo</Label>
              <select
                id="ff-type"
                value={newType}
                onChange={(e) => setNewType(e.target.value as Field["type"])}
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                {TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {newType === "select" && (
            <div>
              <Label htmlFor="ff-options">Opcoes (separadas por virgula)</Label>
              <Input id="ff-options" name="options" required />
            </div>
          )}
          <div>
            <Label htmlFor="ff-placeholder">Placeholder (opcional)</Label>
            <Input id="ff-placeholder" name="placeholder" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ff-required" name="required" />
            <Label htmlFor="ff-required" className="!mt-0">
              Obrigatorio
            </Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNew(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              Adicionar campo
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowNew(true)}>
          <Plus className="mr-1 h-4 w-4" /> Adicionar campo
        </Button>
      )}

      <div className="flex justify-end border-t border-[color:var(--line)] pt-4">
        <Button onClick={handleSave} disabled={pending}>
          {pending ? "Salvando..." : "Salvar campos"}
        </Button>
      </div>
    </div>
  );
}
