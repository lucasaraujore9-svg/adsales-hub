"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setOptimizationStatus } from "@/lib/actions/optimizations";

export function OptimizationRowActions({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  function run(status: "approved" | "rejected", msg: string) {
    start(async () => {
      const r = await setOptimizationStatus(id, status);
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
      <Button variant="outline" size="sm" disabled={pending} onClick={() => run("rejected", "Rejeitado")}>
        <X className="mr-1 h-3 w-3" /> Rejeitar
      </Button>
      <Button size="sm" disabled={pending} onClick={() => run("approved", "Aprovado")}>
        <Check className="mr-1 h-3 w-3" /> Aprovar
      </Button>
    </>
  );
}
