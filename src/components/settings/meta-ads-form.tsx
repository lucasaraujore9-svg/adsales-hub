"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertIntegration, deleteIntegration } from "@/lib/actions/integrations";

export function MetaAdsForm({
  initialBusinessId,
  initialAdAccountId,
  initialPixelId,
  initialPageId,
  initialSystemUserToken,
  initialAppId,
  initialAppSecret,
  hasIntegration,
}: {
  initialBusinessId: string;
  initialAdAccountId: string;
  initialPixelId: string;
  initialPageId: string;
  initialSystemUserToken: string;
  initialAppId: string;
  initialAppSecret: string;
  hasIntegration: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const body = {
      provider: "meta_ads",
      display_name: "Meta Marketing API",
      credentials: {
        business_id: String(form.get("business_id") ?? "").trim(),
        ad_account_id: String(form.get("ad_account_id") ?? "").trim(),
        pixel_id: String(form.get("pixel_id") ?? "").trim(),
        page_id: String(form.get("page_id") ?? "").trim(),
        system_user_token: String(form.get("system_user_token") ?? "").trim(),
        app_id: String(form.get("app_id") ?? "").trim(),
        app_secret: String(form.get("app_secret") ?? "").trim(),
      },
      settings: {},
    };
    start(async () => {
      const result = await upsertIntegration(body);
      if (result.ok) {
        toast.success("Meta Ads conectado");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDisconnect() {
    if (!confirm("Desconectar Meta Ads? Campanhas pararao de sincronizar.")) return;
    start(async () => {
      const result = await deleteIntegration("meta_ads");
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
      <fieldset className="space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        <legend className="px-2 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          Identificadores
        </legend>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="business_id">Business Manager ID</Label>
            <Input
              id="business_id"
              name="business_id"
              defaultValue={initialBusinessId}
              placeholder="1234567890123456"
              required
            />
          </div>
          <div>
            <Label htmlFor="ad_account_id">Ad Account ID</Label>
            <Input
              id="ad_account_id"
              name="ad_account_id"
              defaultValue={initialAdAccountId}
              placeholder="act_1234567890"
              required
            />
          </div>
          <div>
            <Label htmlFor="pixel_id">Pixel ID (Conversions API)</Label>
            <Input
              id="pixel_id"
              name="pixel_id"
              defaultValue={initialPixelId}
              placeholder="9876543210"
            />
          </div>
          <div>
            <Label htmlFor="page_id">Facebook Page ID</Label>
            <Input
              id="page_id"
              name="page_id"
              defaultValue={initialPageId}
              placeholder="111222333"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        <legend className="px-2 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          Tokens (System User)
        </legend>
        <div>
          <Label htmlFor="system_user_token">System User access token</Label>
          <Input
            id="system_user_token"
            name="system_user_token"
            type="password"
            defaultValue={initialSystemUserToken}
            placeholder="EAAJZ..."
            required
          />
          <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
            Gere em Business Manager → System Users → Generate Token (com permissoes
            <code className="font-mono"> ads_management, business_management, leads_retrieval</code>
            ). Token de longa duracao (60d), refresh automatico.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <Label htmlFor="app_id">App ID</Label>
            <Input
              id="app_id"
              name="app_id"
              defaultValue={initialAppId}
              placeholder="11111111111111"
            />
          </div>
          <div>
            <Label htmlFor="app_secret">App Secret</Label>
            <Input
              id="app_secret"
              name="app_secret"
              type="password"
              defaultValue={initialAppSecret}
            />
          </div>
        </div>
      </fieldset>

      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--bg-2)] p-3 text-xs">
        <div className="font-medium">Webhook de leads (cole no Meta)</div>
        <code className="mt-1 block break-all font-mono text-[color:var(--ink-2)]">
          https://adsaleshub.7iegroup.com.br/api/webhooks/meta-leads
        </code>
        <p className="mt-2 text-[color:var(--ink-3)]">
          Configure em Meta for Developers → Webhooks → leadgen, com mesmo verify_token usado no
          WhatsApp.
        </p>
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
