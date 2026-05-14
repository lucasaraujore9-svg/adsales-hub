"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateWorkspaceSettings } from "@/lib/actions/workspace";

type Level = "manual" | "semi" | "full";

const LEVELS: {
  key: Level;
  label: string;
  description: string;
  badge: string;
  badgeTone: string;
}[] = [
  {
    key: "manual",
    label: "Manual",
    description: "IA so sugere. Voce decide tudo. Padrao seguro pra workspaces novos.",
    badge: "Recomendado pra comecar",
    badgeTone: "var(--ink-3)",
  },
  {
    key: "semi",
    label: "Semi-Auto",
    description:
      "IA aplica otimizações pequenas automaticamente (ajuste de lance, pausar anuncio ruim) e pede aprovação para decisões maiores (orcamento, público).",
    badge: "Equilibrio",
    badgeTone: "var(--accent)",
  },
  {
    key: "full",
    label: "Full Auto",
    description:
      "IA gerencia tudo dentro dos limites configurados. Voce so revisa relatório semanal.",
    badge: "Maxima alavancagem",
    badgeTone: "var(--good)",
  },
];

export function OptimizationLevelForm({
  initialLevel,
  initialMaxDailyBudget,
  initialMaxCpl,
  initialMinRoas,
}: {
  initialLevel: Level;
  initialMaxDailyBudget: number;
  initialMaxCpl: number;
  initialMinRoas: number;
}) {
  const router = useRouter();
  const [level, setLevel] = useState<Level>(initialLevel);
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const patch = {
      optimization_level: level,
      optimization_max_daily_budget: Number(form.get("max_daily_budget") ?? 0) || null,
      optimization_max_cpl: Number(form.get("max_cpl") ?? 0) || null,
      optimization_min_roas: Number(form.get("min_roas") ?? 0) || null,
    };
    start(async () => {
      const result = await updateWorkspaceSettings(patch);
      if (result.ok) {
        toast.success("Configuracao salva");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {LEVELS.map((opt) => {
          const active = level === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setLevel(opt.key)}
              className={`rounded-card border p-4 text-left transition-colors ${
                active
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)]/5"
                  : "border-[color:var(--line)] bg-[color:var(--panel)] hover:border-[color:var(--line-3)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{opt.label}</span>
                {active && (
                  <span className="rounded-full bg-[color:var(--accent)] p-1 text-white">
                    <Sparkles className="h-3 w-3" />
                  </span>
                )}
              </div>
              <span
                className="mt-2 inline-block rounded-pill border px-2 py-0.5 text-[10px]"
                style={{ color: opt.badgeTone, borderColor: opt.badgeTone }}
              >
                {opt.badge}
              </span>
              <p className="mt-2 text-xs text-[color:var(--ink-3)]">{opt.description}</p>
            </button>
          );
        })}
      </div>

      {(level === "semi" || level === "full") && (
        <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
          <div className="kicker">Limites de seguranca</div>
          <p className="mt-2 text-xs text-[color:var(--ink-3)]">
            A IA nunca passa desses limites mesmo no Full Auto.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="text-xs" htmlFor="max_daily_budget">
                Orcamento diario maximo (R$)
              </label>
              <input
                id="max_daily_budget"
                name="max_daily_budget"
                type="number"
                min={0}
                step={10}
                defaultValue={initialMaxDailyBudget || ""}
                placeholder="500"
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs" htmlFor="max_cpl">
                CPL maximo (R$)
              </label>
              <input
                id="max_cpl"
                name="max_cpl"
                type="number"
                min={0}
                step={1}
                defaultValue={initialMaxCpl || ""}
                placeholder="50"
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs" htmlFor="min_roas">
                ROAS minimo (x)
              </label>
              <input
                id="min_roas"
                name="min_roas"
                type="number"
                min={0}
                step={0.1}
                defaultValue={initialMinRoas || ""}
                placeholder="2.0"
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar configuração"}
        </Button>
      </div>
    </form>
  );
}
