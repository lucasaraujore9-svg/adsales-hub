"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertIntegration, deleteIntegration } from "@/lib/actions/integrations";

type Provider = "google" | "outlook" | "ical";

export function CalendarForm({
  initialProvider,
  initialClientId,
  initialClientSecret,
  initialCalendarId,
  initialIcalUrl,
  hasIntegration,
  currentProvider,
}: {
  initialProvider: Provider;
  initialClientId: string;
  initialClientSecret: string;
  initialCalendarId: string;
  initialIcalUrl: string;
  hasIntegration: boolean;
  currentProvider: string | null;
}) {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider>(initialProvider);
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const dbProvider = `calendar_${provider}`;
    const body = {
      provider: dbProvider,
      display_name:
        provider === "google" ? "Google Calendar" : provider === "outlook" ? "Outlook" : "iCal",
      credentials: {
        client_id: String(form.get("client_id") ?? "").trim(),
        client_secret: String(form.get("client_secret") ?? "").trim(),
        calendar_id: String(form.get("calendar_id") ?? "").trim(),
        ical_url: String(form.get("ical_url") ?? "").trim(),
      },
      settings: {},
    };
    start(async () => {
      if (currentProvider && currentProvider !== dbProvider) {
        await deleteIntegration(currentProvider);
      }
      const result = await upsertIntegration(body);
      if (result.ok) {
        toast.success("Calendario salvo");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDisconnect() {
    if (!currentProvider) return;
    if (!confirm("Desconectar calendario?")) return;
    start(async () => {
      const result = await deleteIntegration(currentProvider);
      if (result.ok) {
        toast.success("Desconectado");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label>Provider</Label>
        <div className="mt-1 flex gap-1 rounded-pill border border-[color:var(--line-2)] p-0.5">
          {(["google", "outlook", "ical"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProvider(p)}
              className={`flex-1 rounded-pill px-3 py-1 text-xs font-medium uppercase transition-colors ${
                provider === p
                  ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                  : "text-[color:var(--ink-3)]"
              }`}
            >
              {p === "google" ? "Google" : p === "outlook" ? "Outlook" : "iCal/URL"}
            </button>
          ))}
        </div>
      </div>

      {provider === "google" && (
        <>
          <div>
            <Label htmlFor="client_id">OAuth Client ID</Label>
            <Input
              id="client_id"
              name="client_id"
              defaultValue={initialClientId}
              placeholder="xxxxx.apps.googleusercontent.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="client_secret">OAuth Client Secret</Label>
            <Input
              id="client_secret"
              name="client_secret"
              type="password"
              defaultValue={initialClientSecret}
              required
            />
          </div>
          <div>
            <Label htmlFor="calendar_id">Calendar ID</Label>
            <Input
              id="calendar_id"
              name="calendar_id"
              defaultValue={initialCalendarId}
              placeholder="primary ou email@dominio.com"
            />
          </div>
          <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--bg-2)] p-3 text-xs text-[color:var(--ink-3)]">
            Crie credenciais em <code className="font-mono">console.cloud.google.com</code> →
            Credentials → OAuth 2.0 Client IDs. Adicione a redirect URI:{" "}
            <code className="font-mono">https://adsaleshub.7iegroup.com.br/api/auth/google/callback</code>
          </div>
        </>
      )}

      {provider === "outlook" && (
        <>
          <div>
            <Label htmlFor="client_id">Application (client) ID</Label>
            <Input
              id="client_id"
              name="client_id"
              defaultValue={initialClientId}
              required
            />
          </div>
          <div>
            <Label htmlFor="client_secret">Client Secret</Label>
            <Input
              id="client_secret"
              name="client_secret"
              type="password"
              defaultValue={initialClientSecret}
              required
            />
          </div>
          <div>
            <Label htmlFor="calendar_id">Calendar ID (opcional)</Label>
            <Input
              id="calendar_id"
              name="calendar_id"
              defaultValue={initialCalendarId}
              placeholder="me ou email@dominio.com"
            />
          </div>
        </>
      )}

      {provider === "ical" && (
        <div>
          <Label htmlFor="ical_url">URL do iCal</Label>
          <Input
            id="ical_url"
            name="ical_url"
            type="url"
            defaultValue={initialIcalUrl}
            placeholder="https://calendar.minhaempresa.com/feed.ics"
            required
          />
          <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
            Apenas leitura — bom pra mostrar disponibilidade no SDR IA.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : hasIntegration ? "Atualizar" : "Conectar"}
        </Button>
        {hasIntegration && (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={handleDisconnect}
          >
            Desconectar
          </Button>
        )}
      </div>
    </form>
  );
}
