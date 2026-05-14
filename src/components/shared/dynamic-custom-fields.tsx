"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomFieldDef } from "@/lib/queries/custom-fields";

interface Props {
  fields: CustomFieldDef[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  disabled?: boolean;
}

/**
 * Renderiza inputs dinâmicos para custom fields baseado nas definições.
 * Os valores são gerenciados pelo componente pai via `values` e `onChange`.
 */
export function DynamicCustomFields({ fields, values, onChange, disabled }: Props) {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-3 border-t border-[color:var(--line)] pt-4">
      <p className="text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
        Campos customizados
      </p>
      {fields.map((f) => {
        const v = values[f.field_key];
        const id = `cf-${f.id}`;
        const common = {
          id,
          disabled,
          required: f.required,
        };

        if (f.type === "boolean") {
          return (
            <label key={f.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!v}
                onChange={(e) => onChange(f.field_key, e.target.checked)}
                disabled={disabled}
                className="mt-0.5"
              />
              <span>
                {f.name}
                {f.required && <span className="ml-1 text-[color:var(--bad)]">*</span>}
              </span>
            </label>
          );
        }

        if (f.type === "select" && f.options) {
          return (
            <div key={f.id} className="space-y-1">
              <Label htmlFor={id}>
                {f.name}
                {f.required && <span className="ml-1 text-[color:var(--bad)]">*</span>}
              </Label>
              <select
                {...common}
                value={typeof v === "string" ? v : ""}
                onChange={(e) => onChange(f.field_key, e.target.value)}
                className="w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        if (f.type === "multiselect" && f.options) {
          const arr = Array.isArray(v) ? (v as string[]) : [];
          return (
            <div key={f.id} className="space-y-1">
              <Label>
                {f.name}
                {f.required && <span className="ml-1 text-[color:var(--bad)]">*</span>}
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {f.options.map((opt) => {
                  const active = arr.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        const next = active
                          ? arr.filter((a) => a !== opt)
                          : [...arr, opt];
                        onChange(f.field_key, next);
                      }}
                      className={`rounded-full border px-2.5 py-1 text-xs ${
                        active
                          ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                          : "border-[color:var(--line-2)] text-[color:var(--ink-3)]"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        const inputType =
          f.type === "number"
            ? "number"
            : f.type === "date"
              ? "date"
              : f.type === "email"
                ? "email"
                : f.type === "url"
                  ? "url"
                  : f.type === "phone"
                    ? "tel"
                    : "text";

        return (
          <div key={f.id} className="space-y-1">
            <Label htmlFor={id}>
              {f.name}
              {f.required && <span className="ml-1 text-[color:var(--bad)]">*</span>}
            </Label>
            <Input
              {...common}
              type={inputType}
              value={v == null ? "" : String(v)}
              onChange={(e) =>
                onChange(
                  f.field_key,
                  f.type === "number" ? Number(e.target.value) : e.target.value,
                )
              }
            />
          </div>
        );
      })}
    </div>
  );
}
