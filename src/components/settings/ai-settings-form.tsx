"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkspaceSettings } from "@/lib/actions/workspace";

const MODELS = [
  { key: "claude-sonnet-4-6", label: "Claude Sonnet 4.6 (recomendado)" },
  { key: "claude-haiku-4-5", label: "Claude Haiku 4.5 (rápido + barato)" },
  { key: "claude-opus-4-7", label: "Claude Opus 4.7 (mais profundo)" },
  { key: "gpt-4o", label: "OpenAI GPT-4o" },
  { key: "gpt-4o-mini", label: "OpenAI GPT-4o-mini" },
];

export function AiSettingsForm({
  initialModel,
  initialTemperature,
  initialMaxTokens,
  initialMonthlyBudget,
}: {
  initialModel: string;
  initialTemperature: number;
  initialMaxTokens: number;
  initialMonthlyBudget: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const patch = {
      ai_default_model: String(form.get("model") ?? "claude-sonnet-4-6"),
      ai_temperature: Number(form.get("temperature") ?? 0.5),
      ai_max_tokens: Number(form.get("max_tokens") ?? 4000),
      ai_monthly_budget_usd: Number(form.get("monthly_budget") ?? 0),
    };
    start(async () => {
      const result = await updateWorkspaceSettings(patch);
      if (result.ok) {
        toast.success("Configuracao IA salva");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="model">Modelo padrao</Label>
        <select
          id="model"
          name="model"
          defaultValue={initialModel}
          className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
        >
          {MODELS.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
          Usado em geracao de campanhas, otimizador, analise de calls e Pergunte a IA.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor="temperature">Temperatura</Label>
          <Input
            id="temperature"
            name="temperature"
            type="number"
            step={0.1}
            min={0}
            max={2}
            defaultValue={initialTemperature}
          />
          <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
            0 = determinístico · 2 = criativo
          </p>
        </div>
        <div>
          <Label htmlFor="max_tokens">Max tokens por chamada</Label>
          <Input
            id="max_tokens"
            name="max_tokens"
            type="number"
            min={500}
            max={64000}
            step={500}
            defaultValue={initialMaxTokens}
          />
        </div>
        <div>
          <Label htmlFor="monthly_budget">Orcamento mensal (US$)</Label>
          <Input
            id="monthly_budget"
            name="monthly_budget"
            type="number"
            min={0}
            step={10}
            defaultValue={initialMonthlyBudget}
            placeholder="500"
          />
          <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
            0 = sem limite. Quando atingir, pausa chamadas IA ate o proximo ciclo.
          </p>
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar configuração"}
      </Button>
    </form>
  );
}
