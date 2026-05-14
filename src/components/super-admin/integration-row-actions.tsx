"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { disconnectIntegration } from "@/lib/actions/super-admin";
import { useConfirm } from "@/components/ui/confirm-provider";

interface Props {
  scope: "ad_account" | "social_account";
  id: string;
}

export function IntegrationRowActions({ scope, id }: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const [pending, start] = useTransition();

  async function handleDisconnect() {
    const ok = await confirm({
      title: "Desconectar integração?",
      description: "Os tokens armazenados serão apagados. O cliente precisará reconectar para usar novamente.",
      confirmLabel: "Desconectar",
      variant: "destructive",
    });
    if (!ok) return;
    start(async () => {
      const r = await disconnectIntegration({ scope, id });
      if (r.ok) {
        toast.success("Desconectado.");
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha");
      }
    });
  }

  return (
    <Button size="sm" variant="outline" onClick={handleDisconnect} disabled={pending}>
      {pending ? "..." : "Desconectar"}
    </Button>
  );
}
