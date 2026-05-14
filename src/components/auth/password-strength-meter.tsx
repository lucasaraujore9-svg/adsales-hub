"use client";

import { Check, X } from "lucide-react";

type Rule = {
  label: string;
  test: (s: string) => boolean;
};

const RULES: Rule[] = [
  { label: "Mínimo 8 caracteres", test: (s) => s.length >= 8 },
  { label: "Pelo menos 1 letra maiúscula", test: (s) => /[A-Z]/.test(s) },
  { label: "Pelo menos 1 número", test: (s) => /[0-9]/.test(s) },
  { label: "Pelo menos 1 caractere especial (!@#$ etc)", test: (s) => /[^a-zA-Z0-9]/.test(s) },
];

const TONES = ["bad", "warn", "warn", "good", "good"] as const;
const LABELS = ["Muito fraca", "Fraca", "Média", "Boa", "Forte"] as const;

/**
 * Checklist visual de requisitos de senha + barra de força.
 */
export function PasswordStrengthMeter({ password }: { password: string }) {
  const passed = RULES.map((r) => r.test(password));
  const score = passed.filter(Boolean).length;
  const tone = TONES[score];
  const label = LABELS[score];

  return (
    <div className="space-y-2">
      <div className="flex h-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full ${
              i < score
                ? tone === "good"
                  ? "bg-[color:var(--good)]"
                  : tone === "warn"
                    ? "bg-[color:var(--warn)]"
                    : "bg-[color:var(--bad)]"
                : "bg-[color:var(--line)]"
            }`}
          />
        ))}
      </div>
      <p className="flex items-center justify-between text-xs">
        <span className="text-[color:var(--ink-3)]">Força:</span>
        <span
          className={
            tone === "good"
              ? "font-medium text-[color:var(--good)]"
              : tone === "warn"
                ? "font-medium text-[color:var(--warn)]"
                : "font-medium text-[color:var(--bad)]"
          }
        >
          {password.length === 0 ? "—" : label}
        </span>
      </p>
      <ul className="space-y-1 text-xs">
        {RULES.map((r, i) => (
          <li
            key={r.label}
            className={`flex items-center gap-1.5 ${
              passed[i] ? "text-[color:var(--good)]" : "text-[color:var(--ink-4)]"
            }`}
          >
            {passed[i] ? (
              <Check className="h-3 w-3" aria-hidden />
            ) : (
              <X className="h-3 w-3" aria-hidden />
            )}
            <span>{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
