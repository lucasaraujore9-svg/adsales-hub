"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createDeal } from "@/lib/actions/deals";
import type { ContactRow, StageRow } from "@/lib/queries/crm";
import { useRouter } from "next/navigation";

interface Props {
  pipelineId: string;
  stages: StageRow[];
  contacts: ContactRow[];
}

export function NewDealButton({ pipelineId, stages, contacts }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const firstStage = stages.find((s) => !s.is_lost && s.position === 0) ?? stages[0];

  async function handleSubmit(formData: FormData) {
    const body = {
      title: String(formData.get("title") ?? ""),
      value: Number(formData.get("value") ?? 0),
      pipeline_id: pipelineId,
      stage_id: String(formData.get("stage_id") ?? firstStage?.id ?? ""),
      contact_id: formData.get("contact_id") ? String(formData.get("contact_id")) : undefined,
      source: String(formData.get("source") ?? "manual"),
      expected_close_date: formData.get("expected_close_date")
        ? String(formData.get("expected_close_date"))
        : undefined,
    };
    start(async () => {
      const result = await createDeal(body);
      if (result.ok) {
        toast.success("Negocio criado");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro ao criar");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" /> Novo negocio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo negocio</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titulo</Label>
            <Input name="title" id="title" required autoFocus placeholder="Ex: Acme Corp - Plano Anual" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="value">Valor (R$)</Label>
              <Input name="value" id="value" type="number" min="0" step="100" required defaultValue="1000" />
            </div>
            <div>
              <Label htmlFor="expected_close_date">Fechamento previsto</Label>
              <Input name="expected_close_date" id="expected_close_date" type="date" />
            </div>
          </div>
          <div>
            <Label htmlFor="stage_id">Estagio</Label>
            <select
              name="stage_id"
              id="stage_id"
              defaultValue={firstStage?.id}
              className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
            >
              {stages
                .filter((s) => !s.is_lost)
                .sort((a, b) => a.position - b.position)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.probability}%)
                  </option>
                ))}
            </select>
          </div>
          <div>
            <Label htmlFor="contact_id">Contato</Label>
            <select
              name="contact_id"
              id="contact_id"
              className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
            >
              <option value="">(Nenhum)</option>
              {contacts.slice(0, 30).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.email ? `· ${c.email}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="source">Origem</Label>
            <select
              name="source"
              id="source"
              defaultValue="manual"
              className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
            >
              <option value="manual">Manual</option>
              <option value="meta_ads">Meta Ads</option>
              <option value="google_ads">Google Ads</option>
              <option value="organic">Organico</option>
              <option value="referral">Indicacao</option>
              <option value="prospecting">Prospeccao</option>
              <option value="website">Site</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Criando..." : "Criar negocio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
