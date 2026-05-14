"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PLANS,
  FEATURES,
  CATEGORY_LABELS,
  type FeatureCategory,
  type PlanId,
} from "@/lib/billing/plans";
import { ChangePlanModal } from "@/components/billing/change-plan-modal";

function brl(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function PricingMatrix({ currentPlanName }: { currentPlanName?: string | null } = {}) {
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);

  const grouped: Record<FeatureCategory, typeof FEATURES> = {
    crm: [],
    marketing: [],
    ads: [],
    voice: [],
    contracts: [],
    limits: [],
  };
  for (const f of FEATURES) {
    grouped[f.category].push(f);
  }
  const categories = Object.keys(grouped) as FeatureCategory[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-3 text-sm">
        <span className={annual ? "text-[color:var(--ink-3)]" : "font-medium text-[color:var(--ink)]"}>
          Mensal
        </span>
        <button
          type="button"
          onClick={() => setAnnual((v) => !v)}
          aria-label="Alternar entre mensal e anual"
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-[color:var(--bg-2)] transition-colors"
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-[color:var(--accent)] transition-transform ${
              annual ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className={annual ? "font-medium text-[color:var(--ink)]" : "text-[color:var(--ink-3)]"}>
          Anual <span className="text-[color:var(--good)]">-20%</span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr>
              <th className="w-1/3 p-4 text-left text-xs uppercase tracking-kicker text-[color:var(--ink-4)]"></th>
              {PLANS.map((p) => (
                <th
                  key={p.id}
                  className={`w-1/5 rounded-t-card p-4 text-left ${
                    p.recommended
                      ? "border-2 border-b-0 border-[color:var(--accent)] bg-[color:var(--accent)]/5"
                      : "border border-b-0 border-[color:var(--line)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium">{p.name}</span>
                    {p.recommended && (
                      <span className="rounded-full bg-[color:var(--accent)] px-2 py-0.5 text-[10px] font-medium text-white">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--ink-3)]">{p.description}</p>
                  <p className="mt-2 text-2xl font-medium">
                    {brl(annual ? p.yearly : p.monthly)}
                    <span className="text-xs font-normal text-[color:var(--ink-3)]">/mês</span>
                  </p>
                  {annual && (
                    <p className="text-xs text-[color:var(--ink-4)]">
                      cobrado anualmente {brl(p.yearly * 12)}
                    </p>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <Section
                key={cat}
                title={CATEGORY_LABELS[cat]}
                features={grouped[cat]}
              />
            ))}

            <tr>
              <td className="p-4"></td>
              {PLANS.map((p) => (
                <td
                  key={p.id}
                  className={`p-4 ${
                    p.recommended
                      ? "border-2 border-t-0 border-[color:var(--accent)] bg-[color:var(--accent)]/5 rounded-b-card"
                      : "border border-t-0 border-[color:var(--line)] rounded-b-card"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(p.id)}
                    className={`block w-full rounded-full px-4 py-2 text-center text-sm font-medium ${
                      p.recommended
                        ? "bg-[color:var(--accent)] text-white"
                        : "bg-[color:var(--ink)] text-[color:var(--bg)]"
                    }`}
                  >
                    Escolher {p.name}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {selectedPlan && (
        <ChangePlanModal
          open={!!selectedPlan}
          onOpenChange={(o) => !o && setSelectedPlan(null)}
          currentPlanName={currentPlanName ?? null}
          newPlanId={selectedPlan}
          newPlanName={PLANS.find((p) => p.id === selectedPlan)?.name ?? ""}
          interval={annual ? "year" : "month"}
          onConfirm={async () => {
            toast.success("Levando ao checkout...");
            router.push(
              `/configuracoes/billing?plan=${selectedPlan}${annual ? "&interval=year" : ""}`,
            );
          }}
        />
      )}
    </div>
  );
}

function Section({
  title,
  features,
}: {
  title: string;
  features: typeof FEATURES;
}) {
  if (features.length === 0) return null;
  return (
    <>
      <tr>
        <td
          colSpan={4}
          className="bg-[color:var(--bg-2)] px-4 py-2 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-3)]"
        >
          {title}
        </td>
      </tr>
      {features.map((f) => (
        <tr key={f.id} className="border-b border-[color:var(--line)]">
          <td className="p-3 text-sm">{f.label}</td>
          {PLANS.map((p) => {
            const v = f.values[p.id];
            return (
              <td
                key={p.id}
                className={`p-3 text-center text-sm ${
                  p.recommended ? "bg-[color:var(--accent)]/5" : ""
                }`}
              >
                {v === true ? (
                  <Check className="mx-auto h-4 w-4 text-[color:var(--good)]" />
                ) : v === false ? (
                  <X className="mx-auto h-4 w-4 text-[color:var(--ink-4)]" />
                ) : (
                  <span className="text-[color:var(--ink-2)]">{String(v)}</span>
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
