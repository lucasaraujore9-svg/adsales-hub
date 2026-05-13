"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertIntegration, deleteIntegration } from "@/lib/actions/integrations";

export function TelephonyForm({
  initialEngineKey,
  initialEngineUrl,
  initialAssistantId,
  initialDidNumber,
  initialDidProviderToken,
  hasIntegration,
}: {
  initialEngineKey: string;
  initialEngineUrl: string;
  initialAssistantId: string;
  initialDidNumber: string;
  initialDidProviderToken: string;
  hasIntegration: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const body = {
      provider: "voice-engine",
      display_name: "Motor de voz IA",
      credentials: {
        engine_api_key: String(form.get("engine_key") ?? "").trim(),
        engine_base_url: String(form.get("engine_url") ?? "").trim(),
        voice_assistant_id: String(form.get("assistant_id") ?? "").trim(),
        did_number: String(form.get("did_number") ?? "").trim(),
        did_provider_token: String(form.get("did_provider_token") ?? "").trim(),
      },
      settings: {},
    };
    start(async () => {
      const result = await upsertIntegration(body);
      if (result.ok) {
        toast.success("Telefonia salva");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDisconnect() {
    if (!confirm("Desconectar telefonia? SDR IA parara de ligar.")) return;
    start(async () => {
      const result = await deleteIntegration("voice-engine");
      if (result.ok) {
        toast.success("Desconectado");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--bg-2)] p-4 text-xs">
        <div className="font-medium">Como funciona</div>
        <p className="mt-1 text-[color:var(--ink-3)]">
          O motor de voz IA (ex: Vapi, Retell, Voiceflow) cuida da chamada com IA. O provedor DID
          fornece o numero brasileiro fisico (+55) que aparece no caller ID. SDR IA usa os dois pra
          ligar pros leads na fila.
        </p>
      </div>

      <fieldset className="space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        <legend className="px-2 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          Motor de voz IA
        </legend>
        <div>
          <Label htmlFor="engine_url">Base URL</Label>
          <Input
            id="engine_url"
            name="engine_url"
            type="url"
            defaultValue={initialEngineUrl}
            placeholder="https://api.vapi.ai"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="engine_key">API key</Label>
            <Input
              id="engine_key"
              name="engine_key"
              type="password"
              defaultValue={initialEngineKey}
              placeholder="sk-..."
              required
            />
          </div>
          <div>
            <Label htmlFor="assistant_id">Assistant ID</Label>
            <Input
              id="assistant_id"
              name="assistant_id"
              defaultValue={initialAssistantId}
              placeholder="assist_..."
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        <legend className="px-2 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          Provedor DID BR
        </legend>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="did_number">Numero (E.164)</Label>
            <Input
              id="did_number"
              name="did_number"
              defaultValue={initialDidNumber}
              placeholder="+551130000000"
            />
          </div>
          <div>
            <Label htmlFor="did_provider_token">Token do provedor DID</Label>
            <Input
              id="did_provider_token"
              name="did_provider_token"
              type="password"
              defaultValue={initialDidProviderToken}
              placeholder="prov_..."
            />
          </div>
        </div>
      </fieldset>

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
