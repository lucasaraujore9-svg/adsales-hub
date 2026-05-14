"use client";

import { useState, useTransition } from "react";
import { Play, Pause, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteCampaign, toggleCampaignStatus } from "@/lib/actions/campaigns";
import { useConfirm } from "@/components/ui/confirm-provider";
import { ActivateCampaignModal } from "@/components/campaigns/activate-campaign-modal";
import type { CampaignRow } from "@/lib/queries/marketing";

export function CampaignHeaderActions({ campaign }: { campaign: CampaignRow }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const confirm = useConfirm();
  const [activateOpen, setActivateOpen] = useState(false);

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
          onClick={async () => {
            const ok = await confirm({
              title: "Pausar campanha?",
              description: "Anúncios deixarão de rodar. Você pode reativar a qualquer momento.",
              confirmLabel: "Pausar",
            });
            if (ok) run(() => toggleCampaignStatus(campaign.id, "paused"), "Campanha pausada");
          }}
        >
          <Pause className="mr-1 h-4 w-4" /> Pausar
        </Button>
      ) : (
        <>
          <Button size="sm" disabled={pending} onClick={() => setActivateOpen(true)}>
            <Play className="mr-1 h-4 w-4" /> Ativar
          </Button>
          <ActivateCampaignModal
            campaignId={campaign.id}
            open={activateOpen}
            onOpenChange={setActivateOpen}
          />
        </>
      )}
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={async () => {
          const ok = await confirm({
            title: "Excluir campanha?",
            description: "Esta ação não pode ser desfeita. Métricas históricas serão preservadas.",
            confirmLabel: "Excluir",
            variant: "destructive",
          });
          if (ok) {
            run(() => deleteCampaign(campaign.id), "Campanha excluída");
            router.push("/campanhas");
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </>
  );
}
