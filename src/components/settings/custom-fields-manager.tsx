"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import { createCustomField, deleteCustomField } from "@/lib/actions/custom-fields";

interface CustomField {
  id: string;
  entity: string;
  name: string;
  field_key: string;
  type: string;
  options: string[] | null;
  required: boolean;
  position: number;
}

const ENTITIES = [
  { key: "deal", label: "Negocio" },
  { key: "contact", label: "Contato" },
  { key: "company", label: "Empresa" },
  { key: "activity", label: "Atividade" },
] as const;

const TYPES = [
  { key: "text", label: "Texto curto" },
  { key: "number", label: "Numero" },
  { key: "date", label: "Data" },
  { key: "select", label: "Selecao unica" },
  { key: "multiselect", label: "Selecao multipla" },
  { key: "boolean", label: "Sim/Nao" },
  { key: "url", label: "URL" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Telefone" },
];

export function CustomFieldsManager({ fields }: { fields: CustomField[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<string>("text");
  const [filterEntity, setFilterEntity] = useState<string>("");

  async function handleCreate(form: FormData) {
    const optionsRaw = String(form.get("options") ?? "").trim();
    const options = optionsRaw
      ? optionsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;
    const body = {
      entity: String(form.get("entity") ?? "deal"),
      name: String(form.get("name") ?? ""),
      field_key: String(form.get("field_key") ?? ""),
      type,
      required: form.get("required") === "on",
      options,
    };
    start(async () => {
      const result = await createCustomField(body);
      if (result.ok) {
        toast.success("Campo criado");
        setShowForm(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir o campo "${name}"? Valores existentes serao perdidos.`)) return;
    start(async () => {
      const result = await deleteCustomField(id);
      if (result.ok) {
        toast.success("Campo excluido");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  const visible = filterEntity ? fields.filter((f) => f.entity === filterEntity) : fields;
  const needsOptions = type === "select" || type === "multiselect";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setFilterEntity("")}
            className={`rounded-pill border px-3 py-1 text-xs font-medium ${
              !filterEntity
                ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                : "border-[color:var(--line-2)] text-[color:var(--ink-3)]"
            }`}
          >
            Todos ({fields.length})
          </button>
          {ENTITIES.map((e) => {
            const count = fields.filter((f) => f.entity === e.key).length;
            return (
              <button
                key={e.key}
                type="button"
                onClick={() => setFilterEntity(e.key)}
                className={`rounded-pill border px-3 py-1 text-xs font-medium ${
                  filterEntity === e.key
                    ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                    : "border-[color:var(--line-2)] text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
                }`}
              >
                {e.label} ({count})
              </button>
            );
          })}
        </div>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" /> Novo campo
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
              <Label htmlFor="cf-entity">Entidade</Label>
              <select
                id="cf-entity"
                name="entity"
                defaultValue={filterEntity || "deal"}
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                {ENTITIES.map((e) => (
                  <option key={e.key} value={e.key}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="cf-type">Tipo</Label>
              <select
                id="cf-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                {TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="cf-name">Nome (mostrado pro usuario)</Label>
              <Input id="cf-name" name="name" required autoFocus placeholder="Budget anual" />
            </div>
            <div>
              <Label htmlFor="cf-key">Chave (snake_case)</Label>
              <Input
                id="cf-key"
                name="field_key"
                required
                pattern="[a-z][a-z0-9_]*"
                placeholder="budget_anual"
              />
            </div>
            {needsOptions && (
              <div className="md:col-span-2">
                <Label htmlFor="cf-options">Opcoes (separadas por virgula)</Label>
                <Input
                  id="cf-options"
                  name="options"
                  required
                  placeholder="Pequena, Media, Grande, Enterprise"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="cf-required" name="required" />
              <Label htmlFor="cf-required" className="!mt-0">
                Obrigatorio
              </Label>
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
              Criar campo
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        {visible.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhum campo customizado{filterEntity ? ` em ${filterEntity}` : ""}.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Nome</th>
                <th className="px-5 py-3 text-left font-medium">Chave</th>
                <th className="px-5 py-3 text-left font-medium">Entidade</th>
                <th className="px-5 py-3 text-left font-medium">Tipo</th>
                <th className="px-5 py-3 text-left font-medium">Obrigatorio</th>
                <th className="px-5 py-3 text-right font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line)]">
              {visible.map((f) => (
                <tr key={f.id} className="hover:bg-[color:var(--bg-2)]/40">
                  <td className="px-5 py-3 font-medium">{f.name}</td>
                  <td className="px-5 py-3 font-mono text-xs">{f.field_key}</td>
                  <td className="px-5 py-3 text-xs capitalize">{f.entity}</td>
                  <td className="px-5 py-3 text-xs">
                    {f.type}
                    {(f.type === "select" || f.type === "multiselect") && f.options && (
                      <span className="ml-1 text-[10px] text-[color:var(--ink-4)]">
                        ({f.options.length} opcoes)
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {f.required && <StatusBadge label="Obrigatorio" tone="warn" />}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(f.id, f.name)}
                      disabled={pending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
