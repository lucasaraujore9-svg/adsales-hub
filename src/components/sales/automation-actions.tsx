"use client";

import { useTransition } from "react";
import { Pause, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  createAutomationFromTemplate,
  toggleAutomationActive,
} from "@/lib/actions/sales";

export function AutomationToggleButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleClick() {
    start(async () => {
      const result = await toggleAutomationActive(id, !isActive);
      if (result.ok) {
        toast.success(isActive ? "Automacao pausada" : "Automacao ativada");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={pending}>
      {isActive ? (
        <>
          <Pause className="mr-1 h-3.5 w-3.5" /> Pausar
        </>
      ) : (
        <>
          <Play className="mr-1 h-3.5 w-3.5" /> Ativar
        </>
      )}
    </Button>
  );
}

export function AutomationTemplateButton({
  name,
  triggerType,
}: {
  name: string;
  triggerType: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleClick() {
    start(async () => {
      const result = await createAutomationFromTemplate({
        name,
        description: `Criado a partir do modelo "${name}"`,
        trigger_type: triggerType,
      });
      if (result.ok) {
        toast.success("Automacao criada (pausada). Configure e ative.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="w-full rounded-lg border border-[color:var(--line)] bg-[color:var(--bg)] px-3 py-2 text-left text-xs text-[color:var(--ink-2)] transition-colors hover:border-[color:var(--accent)] disabled:opacity-50"
    >
      <span className="inline-flex items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-[color:var(--accent)]" />
        {name}
      </span>
    </button>
  );
}
