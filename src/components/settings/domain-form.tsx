"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkspaceDomain } from "@/lib/actions/workspace";

export function DomainForm({
  initialSubdomain,
  initialDomain,
  publicAppDomain,
}: {
  initialSubdomain: string;
  initialDomain: string;
  publicAppDomain: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const patch = {
      subdomain: String(form.get("subdomain") ?? "").trim(),
      domain: String(form.get("domain") ?? "").trim(),
    };
    start(async () => {
      const result = await updateWorkspaceDomain(patch);
      if (result.ok) {
        toast.success("Configuracao salva");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="subdomain">Subdomain</Label>
        <div className="mt-1 flex items-stretch overflow-hidden rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)]">
          <Input
            id="subdomain"
            name="subdomain"
            defaultValue={initialSubdomain}
            placeholder="minhaempresa"
            className="flex-1 rounded-none border-0 bg-transparent"
            pattern="[a-z0-9-]*"
          />
          <span className="border-l border-[color:var(--line-2)] bg-[color:var(--bg-2)] px-3 text-xs leading-[36px] text-[color:var(--ink-3)]">
            .{publicAppDomain}
          </span>
        </div>
        <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
          Tudo do app fica acessivel via subdomain proprio (ex: <code className="font-mono">minhaempresa.{publicAppDomain}</code>). SSL automatico.
        </p>
      </div>

      <div>
        <Label htmlFor="domain">Dominio customizado</Label>
        <Input
          id="domain"
          name="domain"
          defaultValue={initialDomain}
          placeholder="lp.minhaempresa.com.br"
        />
        <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
          Para landing pages publicas e portal white-label. Aponte um CNAME do seu dominio para{" "}
          <code className="font-mono">cname.{publicAppDomain}</code> apos salvar. Wildcard SSL via
          Let&apos;s Encrypt e aplicado automaticamente.
        </p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
