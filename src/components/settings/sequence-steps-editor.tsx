"use client";

import { useState, useTransition } from "react";
import { Mail, MessageCircle, Phone, Plus, Trash2, ListTodo, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSequenceStep, deleteSequenceStep } from "@/lib/actions/sequences";

interface Step {
  id: string;
  position: number;
  channel: "email" | "whatsapp" | "call" | "task" | "sms";
  delay_days: number;
  delay_hours: number;
  template_id: string | null;
  subject: string | null;
  body: string | null;
}

interface EmailTemplate {
  id: string;
  name: string;
}

const CHANNEL_META = {
  email: { label: "Email", icon: Mail, color: "var(--accent)" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "var(--good)" },
  call: { label: "Ligacao", icon: Phone, color: "var(--accent)" },
  task: { label: "Tarefa", icon: ListTodo, color: "var(--ink-3)" },
  sms: { label: "SMS", icon: MessageSquare, color: "var(--accent)" },
} as const;

export function SequenceStepsEditor({
  sequenceId,
  steps,
  emailTemplates,
}: {
  sequenceId: string;
  steps: Step[];
  emailTemplates: EmailTemplate[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [channel, setChannel] = useState<Step["channel"]>("email");

  async function handleAdd(form: FormData) {
    const body = {
      sequence_id: sequenceId,
      channel,
      delay_days: Number(form.get("delay_days") ?? 0),
      delay_hours: Number(form.get("delay_hours") ?? 0),
      template_id: (form.get("template_id") as string) || null,
      subject: (form.get("subject") as string) || null,
      body: (form.get("body") as string) || null,
    };
    start(async () => {
      const result = await createSequenceStep(body);
      if (result.ok) {
        toast.success("Passo adicionado");
        setShowForm(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Excluir este passo?")) return;
    start(async () => {
      const result = await deleteSequenceStep(id);
      if (result.ok) {
        toast.success("Excluido");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  const sorted = [...steps].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--ink-3)]">
          {sorted.length} passo(s) configurado(s)
        </p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" /> Adicionar passo
          </Button>
        )}
      </div>

      {showForm && (
        <form
          action={handleAdd}
          className="space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
        >
          <div>
            <Label>Canal</Label>
            <div className="mt-1 grid grid-cols-5 gap-1 rounded-pill border border-[color:var(--line-2)] p-0.5">
              {(["email", "whatsapp", "call", "task", "sms"] as const).map((c) => {
                const Icon = CHANNEL_META[c].icon;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={`flex items-center justify-center gap-1 rounded-pill px-3 py-1 text-xs font-medium transition-colors ${
                      channel === c
                        ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                        : "text-[color:var(--ink-3)]"
                    }`}
                  >
                    <Icon className="h-3 w-3" /> {CHANNEL_META[c].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="step-days">Esperar dias</Label>
              <Input
                id="step-days"
                name="delay_days"
                type="number"
                min={0}
                max={365}
                defaultValue={sorted.length === 0 ? 0 : 1}
              />
            </div>
            <div>
              <Label htmlFor="step-hours">+ horas</Label>
              <Input
                id="step-hours"
                name="delay_hours"
                type="number"
                min={0}
                max={23}
                defaultValue={0}
              />
            </div>
          </div>

          {channel === "email" && emailTemplates.length > 0 && (
            <div>
              <Label htmlFor="step-template">Template (opcional)</Label>
              <select
                id="step-template"
                name="template_id"
                defaultValue=""
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                <option value="">(Sem template — escrever inline)</option>
                {emailTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(channel === "email" || channel === "whatsapp") && (
            <div>
              <Label htmlFor="step-subject">
                {channel === "email" ? "Assunto" : "Titulo"}
              </Label>
              <Input
                id="step-subject"
                name="subject"
                placeholder={channel === "email" ? "Re: nossa conversa" : "Mensagem rápida"}
              />
            </div>
          )}

          {channel !== "task" && (
            <div>
              <Label htmlFor="step-body">Conteudo</Label>
              <textarea
                id="step-body"
                name="body"
                rows={5}
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
                placeholder={
                  channel === "call"
                    ? "Pontos a abordar na ligacao..."
                    : "Use {{contact_name}}, {{deal_title}}..."
                }
              />
            </div>
          )}

          {channel === "task" && (
            <div>
              <Label htmlFor="step-body">Descricao da tarefa</Label>
              <Input
                id="step-body"
                name="body"
                placeholder="Ligar pra confirmar reuniao"
              />
            </div>
          )}

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
              Adicionar passo
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {sorted.map((step, idx) => {
          const meta = CHANNEL_META[step.channel];
          const Icon = meta.icon;
          const totalHours = step.delay_days * 24 + step.delay_hours;
          const delayLabel =
            totalHours === 0
              ? "Imediato"
              : step.delay_days > 0
                ? `+${step.delay_days}d${step.delay_hours > 0 ? ` ${step.delay_hours}h` : ""}`
                : `+${step.delay_hours}h`;
          return (
            <div
              key={step.id}
              className="flex items-start gap-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--bg-2)] text-xs font-medium">
                {idx + 1}
              </div>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: `color-mix(in srgb, ${meta.color} 12%, transparent)`, color: meta.color }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{meta.label}</span>
                  <span className="rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 font-mono text-[10px] text-[color:var(--ink-3)]">
                    {delayLabel}
                  </span>
                </div>
                {step.subject && (
                  <div className="mt-1 truncate text-xs font-medium text-[color:var(--ink-2)]">
                    {step.subject}
                  </div>
                )}
                {step.body && (
                  <p className="mt-1 line-clamp-2 text-xs text-[color:var(--ink-3)]">{step.body}</p>
                )}
                {step.template_id && (
                  <div className="mt-1 text-[10px] font-mono text-[color:var(--ink-4)]">
                    Template ID: {step.template_id.slice(0, 8)}...
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(step.id)}
                disabled={pending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
        {sorted.length === 0 && !showForm && (
          <div className="rounded-card border border-dashed border-[color:var(--line-2)] bg-[color:var(--panel)] p-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhum passo ainda. Adicione o primeiro acima.
          </div>
        )}
      </div>
    </div>
  );
}
