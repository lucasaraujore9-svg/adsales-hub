"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertIntegration, deleteIntegration } from "@/lib/actions/integrations";

export function WhatsappConfigForm({
  initialPhoneNumberId,
  initialBusinessAccountId,
  initialAccessToken,
  initialVerifyToken,
  initialDisplayName,
  hasIntegration,
}: {
  initialPhoneNumberId: string;
  initialBusinessAccountId: string;
  initialAccessToken: string;
  initialVerifyToken: string;
  initialDisplayName: string;
  hasIntegration: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const body = {
      provider: "whatsapp_cloud",
      display_name: String(form.get("display_name") ?? "").trim() || null,
      credentials: {
        phone_number_id: String(form.get("phone_number_id") ?? "").trim(),
        business_account_id: String(form.get("business_account_id") ?? "").trim(),
        access_token: String(form.get("access_token") ?? "").trim(),
        verify_token: String(form.get("verify_token") ?? "").trim(),
      },
      settings: {},
    };
    start(async () => {
      const result = await upsertIntegration(body);
      if (result.ok) {
        toast.success("Configuracao WhatsApp salva");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDisconnect() {
    if (!confirm("Desconectar WhatsApp? Mensagens deixarao de chegar e sair.")) return;
    start(async () => {
      const result = await deleteIntegration("whatsapp_cloud");
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
        <Label htmlFor="display_name">Nome amigavel</Label>
        <Input
          id="display_name"
          name="display_name"
          defaultValue={initialDisplayName}
          placeholder="WhatsApp Vendas"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="phone_number_id">Phone Number ID</Label>
          <Input
            id="phone_number_id"
            name="phone_number_id"
            defaultValue={initialPhoneNumberId}
            placeholder="1234567890"
            required
          />
        </div>
        <div>
          <Label htmlFor="business_account_id">Business Account ID (WABA)</Label>
          <Input
            id="business_account_id"
            name="business_account_id"
            defaultValue={initialBusinessAccountId}
            placeholder="0987654321"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="access_token">Access Token</Label>
        <Input
          id="access_token"
          name="access_token"
          type="password"
          defaultValue={initialAccessToken}
          placeholder="EAAJZ..."
          required
        />
        <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
          Encontre em Meta Business Manager → System Users → Generate token. Token e armazenado
          criptografado (workspace credentials JSONB com service role).
        </p>
      </div>

      <div>
        <Label htmlFor="verify_token">Webhook Verify Token</Label>
        <Input
          id="verify_token"
          name="verify_token"
          defaultValue={initialVerifyToken}
          placeholder="string-aleatoria-pra-verificação"
        />
        <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
          Configure no Meta Webhook → coloque exatamente este valor.
        </p>
      </div>

      <div className="rounded-md border border-[color:var(--line)] bg-[color:var(--bg-2)] p-3 text-xs">
        <div className="font-medium">URL do webhook (cole no Meta)</div>
        <code className="mt-1 block break-all font-mono text-[color:var(--ink-2)]">
          https://adsaleshub.7iegroup.com.br/api/webhooks/whatsapp
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
