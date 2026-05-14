"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertSdrConfig } from "@/lib/actions/sdr";

interface SdrConfig {
  is_active: boolean;
  phone_number: string | null;
  tone: "formal" | "casual" | "technical";
  language: "pt-BR" | "en" | "es";
  max_attempts: number;
  qualification_questions: string[];
  working_hours_start: string;
  working_hours_end: string;
}

const DEFAULT_QUESTIONS = [
  "Qual o tamanho da sua empresa?",
  "Voce já usa alguma ferramenta de CRM hoje?",
  "Qual o orcamento mensal disponível?",
  "Quem decide a contratacao?",
  "Tem urgencia em comecar?",
];

export function SdrConfigForm({ config }: { config: SdrConfig }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [active, setActive] = useState(config.is_active);
  const [questions, setQuestions] = useState<string[]>(
    config.qualification_questions.length > 0 ? config.qualification_questions : DEFAULT_QUESTIONS,
  );
  const [newQuestion, setNewQuestion] = useState("");

  function addQuestion() {
    const trimmed = newQuestion.trim();
    if (!trimmed) return;
    setQuestions((qs) => [...qs, trimmed]);
    setNewQuestion("");
  }

  function removeQuestion(idx: number) {
    setQuestions((qs) => qs.filter((_, i) => i !== idx));
  }

  function handleSubmit(form: FormData) {
    const body = {
      is_active: active,
      phone_number: (form.get("phone_number") as string) || null,
      tone: form.get("tone") as SdrConfig["tone"],
      language: form.get("language") as SdrConfig["language"],
      max_attempts: Number(form.get("max_attempts") ?? 3),
      qualification_questions: questions,
      working_hours_start: String(form.get("working_hours_start") ?? "09:00"),
      working_hours_end: String(form.get("working_hours_end") ?? "18:00"),
    };
    start(async () => {
      const result = await upsertSdrConfig(body);
      if (result.ok) {
        toast.success("Config salva");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        <button
          type="button"
          role="switch"
          aria-checked={active}
          onClick={() => setActive((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            active ? "bg-[color:var(--good)]" : "bg-[color:var(--bg-2)]"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <div>
          <div className="text-sm font-medium">{active ? "Agente ativo" : "Agente pausado"}</div>
          <div className="text-xs text-[color:var(--ink-3)]">
            {active
              ? "Liga automaticamente para leads na fila no horario configurado."
              : "Nao faz ligacoes. Ative quando os scripts estiverem prontos."}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="phone">Numero de origem (DID BR)</Label>
          <Input
            id="phone"
            name="phone_number"
            defaultValue={config.phone_number ?? ""}
            placeholder="+5511999999999"
          />
        </div>
        <div>
          <Label htmlFor="max_attempts">Max tentativas por lead</Label>
          <Input
            id="max_attempts"
            name="max_attempts"
            type="number"
            min={1}
            max={10}
            defaultValue={config.max_attempts}
          />
        </div>
        <div>
          <Label htmlFor="tone">Tom de voz</Label>
          <select
            id="tone"
            name="tone"
            defaultValue={config.tone}
            className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
          >
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
            <option value="technical">Tecnico</option>
          </select>
        </div>
        <div>
          <Label htmlFor="language">Idioma</Label>
          <select
            id="language"
            name="language"
            defaultValue={config.language}
            className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
          >
            <option value="pt-BR">Portugues (BR)</option>
            <option value="en">English</option>
            <option value="es">Espanol</option>
          </select>
        </div>
        <div>
          <Label htmlFor="working_hours_start">Inicio das ligacoes</Label>
          <Input
            id="working_hours_start"
            name="working_hours_start"
            type="time"
            defaultValue={config.working_hours_start}
          />
        </div>
        <div>
          <Label htmlFor="working_hours_end">Fim das ligacoes</Label>
          <Input
            id="working_hours_end"
            name="working_hours_end"
            type="time"
            defaultValue={config.working_hours_end}
          />
        </div>
      </div>

      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        <div className="kicker">Script de qualificacao</div>
        <p className="mt-1 text-xs text-[color:var(--ink-3)]">
          Perguntas que a IA fara em ate 90 segundos para avaliar fit.
        </p>
        <ul className="mt-3 space-y-2">
          {questions.map((q, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="font-mono text-xs text-[color:var(--ink-4)]">{i + 1}.</span>
              <span className="flex-1 rounded-md border border-[color:var(--line)] bg-[color:var(--bg)] px-3 py-1.5 text-xs">
                {q}
              </span>
              <button
                type="button"
                onClick={() => removeQuestion(i)}
                className="text-[color:var(--ink-4)] hover:text-[color:var(--bad)]"
                aria-label="Remover"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <Input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Nova pergunta"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addQuestion();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="mr-1 h-4 w-4" /> Adicionar
          </Button>
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar configuração"}
      </Button>
    </form>
  );
}
