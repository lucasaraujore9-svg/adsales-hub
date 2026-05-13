"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  createWebhook,
  deleteWebhook,
  toggleWebhookActive,
} from "@/lib/actions/webhooks";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
}

const EVENTS = [
  "deal.created",
  "deal.updated",
  "deal.won",
  "deal.lost",
  "deal.stage_changed",
  "contact.created",
  "contact.updated",
  "lead.captured",
  "campaign.published",
  "campaign.paused",
  "form.submitted",
  "activity.completed",
] as const;

export function WebhooksManager({ webhooks }: { webhooks: Webhook[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  function toggleEvent(e: string) {
    setSelectedEvents((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    );
  }

  async function handleCreate(form: FormData) {
    if (selectedEvents.length === 0) {
      toast.error("Selecione ao menos 1 evento.");
      return;
    }
    const body = {
      name: String(form.get("name") ?? ""),
      url: String(form.get("url") ?? ""),
      secret: (form.get("secret") as string) || null,
      events: selectedEvents,
    };
    start(async () => {
      const result = await createWebhook(body);
      if (result.ok) {
        toast.success("Webhook criado");
        setShowForm(false);
        setSelectedEvents([]);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir o webhook "${name}"?`)) return;
    start(async () => {
      const result = await deleteWebhook(id);
      if (result.ok) {
        toast.success("Excluido");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleToggle(id: string, active: boolean) {
    start(async () => {
      const result = await toggleWebhookActive(id, !active);
      if (result.ok) {
        toast.success(active ? "Pausado" : "Reativado");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--ink-3)]">
          {webhooks.length} webhook(s) · {webhooks.filter((w) => w.is_active).length} ativos
        </p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" /> Novo webhook
          </Button>
        )}
      </div>

      {showForm && (
        <form
          action={handleCreate}
          className="space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
        >
          <div>
            <Label htmlFor="wh-name">Nome</Label>
            <Input id="wh-name" name="name" required autoFocus placeholder="Slack #vendas" />
          </div>
          <div>
            <Label htmlFor="wh-url">URL</Label>
            <Input
              id="wh-url"
              name="url"
              type="url"
              required
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>
          <div>
            <Label htmlFor="wh-secret">Secret (opcional)</Label>
            <Input
              id="wh-secret"
              name="secret"
              placeholder="usado pra HMAC verification no destino"
            />
          </div>
          <div>
            <Label>Eventos</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EVENTS.map((e) => {
                const active = selectedEvents.includes(e);
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => toggleEvent(e)}
                    className={`rounded-pill border px-2.5 py-0.5 font-mono text-[10px] ${
                      active
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                        : "border-[color:var(--line-2)] text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
                    }`}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
              {selectedEvents.length} selecionado(s)
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setSelectedEvents([]);
              }}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              Criar webhook
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        {webhooks.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhum webhook ainda.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--line)]">
            {webhooks.map((w) => (
              <li key={w.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{w.name}</span>
                      <StatusBadge
                        label={w.is_active ? "Ativo" : "Pausado"}
                        tone={w.is_active ? "good" : "neutral"}
                      />
                    </div>
                    <div className="mt-0.5 truncate font-mono text-xs text-[color:var(--ink-3)]">
                      {w.url}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {w.events.map((e) => (
                        <span
                          key={e}
                          className="rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 font-mono text-[10px] text-[color:var(--ink-3)]"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(w.id, w.is_active)}
                      disabled={pending}
                    >
                      {w.is_active ? "Pausar" : "Ativar"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(w.id, w.name)}
                      disabled={pending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
