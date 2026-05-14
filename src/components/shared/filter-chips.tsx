"use client";

import { X } from "lucide-react";

export type FilterChip = {
  /** Identificador único do filtro (ex: 'lifecycle_stage'). */
  key: string;
  /** Rótulo amigável da categoria (ex: 'Estágio'). */
  label: string;
  /** Valor crú armazenado (ex: 'customer'). */
  value: string;
  /** Rótulo legível para o valor (ex: 'Cliente'). */
  valueLabel: string;
};

interface Props {
  chips: FilterChip[];
  onRemove: (key: string) => void;
  onClearAll?: () => void;
  className?: string;
}

/**
 * Renderiza chips removíveis para cada filtro ativo. Esconde-se se vazio.
 */
export function FilterChips({ chips, onRemove, onClearAll, className = "" }: Props) {
  if (chips.length === 0) return null;
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {chips.map((c) => (
        <span
          key={`${c.key}-${c.value}`}
          className="inline-flex items-center gap-1 rounded-full border border-[color:var(--line)] bg-[color:var(--bg-2)] px-2.5 py-1 text-xs"
        >
          <span className="text-[color:var(--ink-3)]">{c.label}:</span>
          <span className="font-medium text-[color:var(--ink)]">{c.valueLabel}</span>
          <button
            type="button"
            onClick={() => onRemove(c.key)}
            aria-label={`Remover filtro ${c.label}`}
            className="ml-0.5 rounded-full p-0.5 text-[color:var(--ink-4)] hover:bg-[color:var(--panel)] hover:text-[color:var(--ink)]"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {chips.length >= 2 && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-[color:var(--ink-3)] underline hover:text-[color:var(--ink)]"
        >
          Limpar todos
        </button>
      )}
    </div>
  );
}
