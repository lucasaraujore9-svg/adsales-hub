"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  text: string;
  label?: string;
}

export function CopyButton({ text, label }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Falha ao copiar");
    }
  }

  if (label) {
    return (
      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? <Check className="mr-1 h-3.5 w-3.5" /> : <Copy className="mr-1 h-3.5 w-3.5" />}
        {label}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 text-[color:var(--ink-3)] transition-colors hover:text-[color:var(--ink)]"
      aria-label="Copiar"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
