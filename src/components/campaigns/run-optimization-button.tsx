"use client";

import { useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { runOptimizationCycle } from "@/lib/actions/optimizations";

export function RunOptimizationButton() {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleClick() {
    start(async () => {
      const result = await runOptimizationCycle();
      if (result.ok && result.data) {
        if (result.data.created > 0) {
          toast.success(`${result.data.created} sugestão(oes) gerada(s)`);
        } else {
          toast.info("Nenhuma nova sugestão — dados estao saudaveis ou já sugeridas.");
        }
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro ao rodar ciclo");
      }
    });
  }

  return (
    <Button size="sm" onClick={handleClick} disabled={pending}>
      <Sparkles className="mr-1 h-4 w-4" />
      {pending ? "Analisando..." : "Rodar ciclo agora"}
    </Button>
  );
}
