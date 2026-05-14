"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertIntegration, deleteIntegration } from "@/lib/actions/integrations";

const PROVIDERS = [
  { key: "z-api", label: "Z-API", baseUrl: "https://api.z-api.io" },
  { key: "uazapi", label: "UAZAPI", baseUrl: "" },
  { key: "evolution", label: "Evolution API", baseUrl: "" },
  { key: "wppconnect", label: "WPPConnect (self-hosted)", baseUrl: "" },
  { key: "custom", label: "Custom", baseUrl: "" },
];

export function WhatsappUnofficialForm({
  initialProviderName,
  initialBaseUrl,
  initialInstanceId,
  initialToken,
  initialDisplayPhone,
  hasIntegration,
}: {
  initialProviderName: string;
  initialBaseUrl: string;
  initialInstanceId: string;
  initialToken: string;
  initialDisplayPhone: string;
  hasIntegration: boolean;
}) {
  const router = useRouter();
  const [providerName, setProviderName] = useState(initialProviderName || "z-api");
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const body = {
      provider: "whatsapp_unofficial",
      display_name:
        PROVIDERS.find((p) => p.key === providerName)?.label ?? "WhatsApp não oficial",
      credentials: {
        provider_name: providerName,
        base_url: String(form.get("base_url") ?? "").trim(),
        instance_id: String(form.get("instance_id") ?? "").trim(),
        token: String(form.get("token") ?? "").trim(),
        display_phone: String(form.get("display_phone") ?? "").trim(),
      },
      settings: {},
    };
    start(async () => {
      const result = await upsertIntegration(body);
      if (result.ok) {
        toast.success("WhatsApp salvo");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDisconnect() {
    if (!confirm("Desconectar WhatsApp não oficial?")) return;
    start(async () => {
      const result = await deleteIntegration("whatsapp_unofficial");
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
      <div className="rounded-card border border-[color:var(--warn)]/30 bg-[color:var(--warn)]/5 p-3 text-xs text-[color:var(--warn)]">
        Atencao: WhatsApp nao-oficial via QR Code tem risco de ban da Meta. Use apenas se entender
        as implicacoes. Recomendado usar a API oficial (WhatsApp Cloud API) sempre que possivel.
      </div>

      <div>
        <Label htmlFor="provider_name">Provider</Label>
        <select
          id="provider_name"
          value={providerName}
          onChange={(e) => setProviderName(e.target.value)}
          className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
        >
          {PROVIDERS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="base_url">Base URL da API</Label>
        <Input
          id="base_url"
          name="base_url"
          type="url"
          defaultValue={initialBaseUrl || PROVIDERS.find((p) => p.key === providerName)?.baseUrl}
          placeholder="https://api.z-api.io"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="instance_id">Instance ID / Session</Label>
          <Input
            id="instance_id"
            name="instance_id"
            defaultValue={initialInstanceId}
            placeholder="3D000000000000000"
            required
          />
        </div>
        <div>
          <Label htmlFor="token">Token</Label>
          <Input
            id="token"
            name="token"
            type="password"
            defaultValue={initialToken}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="display_phone">Telefone (caller ID)</Label>
        <Input
          id="display_phone"
          name="display_phone"
          defaultValue={initialDisplayPhone}
          placeholder="+5511999999999"
        />
      </div>

      <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--bg-2)] p-3 text-xs">
        <div className="font-medium">Webhook do app (cole no provider)</div>
        <code className="mt-1 block break-all font-mono text-[color:var(--ink-2)]">
          https://adsaleshub.7iegroup.com.br/api/webhooks/generic/whatsapp-unofficial
        </code>
      </div>

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
