"use client";

import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  result: ReactNode;
}

export function CalcShell({ children, result }: Props) {
  return (
    <div className="my-10 grid grid-cols-1 gap-5 md:grid-cols-[1.1fr_1fr]">
      <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--panel)] p-7">
        {children}
      </div>
      <div className="rounded-[20px] border border-[color:var(--accent)]/40 bg-[color:var(--accent-soft)] p-7">
        {result}
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  type?: "number" | "text";
  step?: string;
}

export function Field({ label, value, onChange, prefix, suffix, hint, type = "number", step = "1" }: FieldProps) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-[12.5px] font-semibold text-[color:var(--ink-2)]">
        {label}
      </label>
      <div className="flex items-center overflow-hidden rounded-[10px] border border-[color:var(--line-2)] bg-[color:var(--bg)]">
        {prefix && (
          <span className="px-3 text-sm text-[color:var(--ink-3)]">{prefix}</span>
        )}
        <input
          type={type}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent px-3 py-2.5 text-base font-medium text-[color:var(--ink)] outline-none"
        />
        {suffix && (
          <span className="px-3 text-sm text-[color:var(--ink-3)]">{suffix}</span>
        )}
      </div>
      {hint && (
        <div className="mt-1.5 text-xs text-[color:var(--ink-4)]">{hint}</div>
      )}
    </div>
  );
}

interface ResultLineProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function ResultLine({ label, value, highlight }: ResultLineProps) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-[color:var(--line)] pb-2.5 last:border-0">
      <span className="text-[12.5px] uppercase tracking-[.06em] text-[color:var(--ink-3)]">
        {label}
      </span>
      <span
        className="font-semibold tracking-[-0.02em] text-[color:var(--ink)]"
        style={{ fontSize: highlight ? 28 : 17 }}
      >
        {value}
      </span>
    </div>
  );
}

export const fmtBRL = (n: number) =>
  isFinite(n)
    ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: n < 100 ? 2 : 0 })
    : "—";

export const fmtPct = (n: number, digits = 1) =>
  isFinite(n) ? `${(n * 100).toFixed(digits)}%` : "—";

export const fmtX = (n: number) => (isFinite(n) ? `${n.toFixed(2)}×` : "—");
