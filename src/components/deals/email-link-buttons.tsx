"use client";

import { useTransition } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { emailProposalLink } from "@/lib/actions/proposals";
import { emailContractToSignatory } from "@/lib/actions/contracts";

export function EmailProposalButton({ proposalId }: { proposalId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleClick() {
    start(async () => {
      const result = await emailProposalLink(proposalId);
      if (result.ok && result.data) {
        toast.success(`Enviado para ${result.data.sent_to}`);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={pending}>
      <Mail className="mr-1 h-3.5 w-3.5" /> {pending ? "Enviando..." : "Enviar email"}
    </Button>
  );
}

export function EmailSignatoryButton({ signatoryId }: { signatoryId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleClick() {
    start(async () => {
      const result = await emailContractToSignatory(signatoryId);
      if (result.ok && result.data) {
        toast.success(`Enviado para ${result.data.sent_to}`);
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
      className="rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 font-mono text-[10px] hover:bg-[color:var(--bg-2)] disabled:opacity-60"
    >
      {pending ? "..." : "enviar"}
    </button>
  );
}
