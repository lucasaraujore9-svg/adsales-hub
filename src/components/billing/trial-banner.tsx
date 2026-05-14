"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock, X } from "lucide-react";

interface Props {
  daysLeft: number;
  basketName: string | null;
}

const DISMISS_KEY = "adsales:trial-banner-dismissed";

export function TrialBanner({ daysLeft, basketName }: Props) {
  const [dismissed, setDismissed] = useState(false);

  // Permite dismiss apenas se ainda há > 3 dias (urgência alta = sempre visível)
  const canDismiss = daysLeft > 3;

  useEffect(() => {
    if (!canDismiss) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    } catch {
      /* noop */
    }
  }, [canDismiss]);

  if (daysLeft <= 0 || dismissed) return null;

  const tone =
    daysLeft <= 1
      ? {
          bg: "bg-[color:var(--bad)]/15 border-[color:var(--bad)]/40",
          text: "text-[color:var(--bad)]",
          message: `Último dia de trial${basketName ? ` (${basketName})` : ""}!`,
          cta: "Garantir meu plano",
        }
      : daysLeft <= 3
        ? {
            bg: "bg-[color:var(--bad)]/10 border-[color:var(--bad)]/30",
            text: "text-[color:var(--bad)]",
            message: `Seu trial encerra em ${daysLeft} dias. Não perca o acesso.`,
            cta: "Escolher plano",
          }
        : daysLeft <= 7
          ? {
              bg: "bg-[color:var(--warn)]/10 border-[color:var(--warn)]/30",
              text: "text-[color:var(--warn)]",
              message: `Seu trial${basketName ? ` no plano ${basketName}` : ""} encerra em ${daysLeft} dias.`,
              cta: "Ver planos",
            }
          : {
              bg: "bg-[color:var(--panel)] border-[color:var(--line)]",
              text: "text-[color:var(--ink-3)]",
              message: `Trial${basketName ? ` (${basketName})` : ""} ativo — restam ${daysLeft} dias.`,
              cta: "Ver planos",
            };

  function handleDismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* noop */
    }
    setDismissed(true);
  }

  return (
    <div className={`border-b px-4 py-2 text-sm ${tone.bg}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <p className={`flex items-center gap-2 ${tone.text}`}>
          <Clock className="h-4 w-4 shrink-0" aria-hidden />
          <span className="font-medium">{tone.message}</span>
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/upgrade"
            className="rounded-pill border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-1 text-xs font-medium hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
          >
            {tone.cta}
          </Link>
          {canDismiss && (
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Fechar aviso de trial"
              className={`rounded-full p-1 ${tone.text} hover:bg-[color:var(--bg-2)]/50`}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
