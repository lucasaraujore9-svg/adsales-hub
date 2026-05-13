"use client";

import { useTransition } from "react";
import { Play, Pause, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteCampaign, toggleCampaignStatus } from "@/lib/actions/campaigns";
import type { CampaignRow } from "@/lib/queries/marketing";

export function CampaignHeaderActions({ campaign }: { campaign: CampaignRow }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) {
    start(async () => {
      const r = await fn();
      if (r.ok) {
        toast.success(msg);
        router.refresh();
      } else {
        toast.error(r.error ?? "Erro");
      }
    });
  }

  return (
    <>
      {campaign.status === "active" ? (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => run(() => toggleCampaignStatus(campaign.id, "paused"), "Pausada")}
        >
          <Pause className="mr-1 h-4 w-4" /> Pausar
        </Button>
      ) : (
        <Button
          size="sm"
          disabled={pending}
          onClick={() => run(() => toggleCampaignStatus(campaign.id, "active"), "Ativada")}
        >
          <Play className="mr-1 h-4 w-4" /> Ativar
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          if (confirm("Excluir esta campanha?")) {
            run(() => deleteCampaign(campaign.id), "Excluida");
            router.push("/campanhas");
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </>
  );
}
