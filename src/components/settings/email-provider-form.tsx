"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertIntegration, deleteIntegration } from "@/lib/actions/integrations";

export function EmailProviderForm({
  initialProvider,
  initialApiKey,
  initialFromEmail,
  initialFromName,
  initialReplyTo,
  hasIntegration,
  currentProvider,
}: {
  initialProvider: "resend" | "smtp" | "gmail";
  initialApiKey: string;
  initialFromEmail: string;
  initialFromName: string;
  initialReplyTo: string;
  hasIntegration: boolean;
  currentProvider: string | null;
}) {
  const router = useRouter();
  const [provider, setProvider] = useState(initialProvider);
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const body = {
      provider,
      display_name: provider === "resend" ? "Resend" : provider === "smtp" ? "SMTP" : "Gmail",
      credentials: {
        api_key: String(form.get("api_key") ?? "").trim(),
        from_email: String(form.get("from_email") ?? "").trim(),
        from_name: String(form.get("from_name") ?? "").trim(),
        reply_to: String(form.get("reply_to") ?? "").trim(),
        smtp_host: String(form.get("smtp_host") ?? "").trim(),
        smtp_port: Number(form.get("smtp_port") ?? 587),
      },
      settings: {},
    };
    start(async () => {
      // Se mudou de provider, deletar o anterior
      if (currentProvider && currentProvider !== provider) {
        await deleteIntegration(currentProvider);
      }
      const result = await upsertIntegration(body);
      if (result.ok) {
        toast.success("Provider de email salvo");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDisconnect() {
    if (!currentProvider) return;
    if (!confirm("Desconectar provider de email? Disparos pararao.")) return;
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
          {(["resend", "smtp", "gmail"] as const).map((p) => (
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
              {p}
            </button>
          ))}
        </div>
      </div>

      {provider === "resend" && (
        <div>
          <Label htmlFor="api_key">Resend API key</Label>
          <Input
            id="api_key"
            name="api_key"
            type="password"
            defaultValue={initialApiKey}
            placeholder="re_..."
            required
          />
          <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
            Crie em <code className="font-mono">resend.com/api-keys</code>. Verifique tambem o
            domínio em Domains.
          </p>
        </div>
      )}

      {provider === "smtp" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="smtp_host">SMTP host</Label>
              <Input id="smtp_host" name="smtp_host" placeholder="smtp.gmail.com" required />
            </div>
            <div>
              <Label htmlFor="smtp_port">Port</Label>
              <Input
                id="smtp_port"
                name="smtp_port"
                type="number"
                defaultValue={587}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="api_key">Senha SMTP</Label>
            <Input id="api_key" name="api_key" type="password" required />
          </div>
        </>
      )}

      {provider === "gmail" && (
        <div>
          <Label htmlFor="api_key">Gmail App Password</Label>
          <Input
            id="api_key"
            name="api_key"
            type="password"
            placeholder="xxxx xxxx xxxx xxxx"
            required
          />
          <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
            Crie em <code className="font-mono">myaccount.google.com/apppasswords</code> (precisa de
            2FA ativo). Login usa <code>from_email</code> abaixo.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="from_email">From email</Label>
          <Input
            id="from_email"
            name="from_email"
            type="email"
            defaultValue={initialFromEmail}
            placeholder="vendas@minhaempresa.com.br"
            required
          />
        </div>
        <div>
          <Label htmlFor="from_name">From name</Label>
          <Input
            id="from_name"
            name="from_name"
            defaultValue={initialFromName}
            placeholder="Vendas Minha Empresa"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="reply_to">Reply-to (opcional)</Label>
          <Input
            id="reply_to"
            name="reply_to"
            type="email"
            defaultValue={initialReplyTo}
            placeholder="atendimento@minhaempresa.com.br"
          />
        </div>
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
