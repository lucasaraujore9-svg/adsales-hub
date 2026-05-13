"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { disconnectIntegration } from "@/lib/actions/super-admin";

interface Props {
  scope: "ad_account" | "social_account";
  id: string;
}

export function IntegrationRowActions({ scope, id }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleDisconnect() {
    if (!confirm("Desconectar esta integracao? Tokens serao apagados.")) return;
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
