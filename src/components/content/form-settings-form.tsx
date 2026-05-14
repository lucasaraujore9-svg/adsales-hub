"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteForm, updateFormSettings } from "@/lib/actions/content";

export function FormSettingsForm({
  formId,
  initialName,
  initialThanks,
  initialRedirect,
}: {
  formId: string;
  initialName: string;
  initialThanks: string;
  initialRedirect: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const body = {
      id: formId,
      name: String(form.get("name") ?? ""),
      thank_you_message: (form.get("thank_you_message") as string) || null,
      redirect_url: (form.get("redirect_url") as string) || null,
    };
    start(async () => {
      const result = await updateFormSettings(body);
      if (result.ok) {
        toast.success("Salvo");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Excluir o formulario? Submissoes ficam preservadas.")) return;
    start(async () => {
      const result = await deleteForm(formId);
      if (result.ok) {
        toast.success("Excluido");
        router.push("/marketing/formularios");
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fs-name">Nome do formulario</Label>
        <Input id="fs-name" name="name" defaultValue={initialName} required />
      </div>
      <div>
        <Label htmlFor="fs-thanks">Mensagem apos envio</Label>
        <Input
          id="fs-thanks"
          name="thank_you_message"
          defaultValue={initialThanks}
          placeholder="Obrigado! Entraremos em contato em ate 1 dia útil."
        />
      </div>
      <div>
        <Label htmlFor="fs-redirect">Ou redirecionar para URL (opcional)</Label>
        <Input
          id="fs-redirect"
          name="redirect_url"
          type="url"
          defaultValue={initialRedirect}
          placeholder="https://meusite.com.br/obrigado"
        />
      </div>
      <div className="flex justify-between border-t border-[color:var(--line)] pt-4">
        <Button type="button" variant="outline" onClick={handleDelete} disabled={pending}>
          Excluir formulario
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar configuração"}
        </Button>
      </div>
    </form>
  );
}
