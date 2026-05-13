"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createActivity } from "@/lib/actions/activities";
import type { ContactRow, DealRow } from "@/lib/queries/crm";

export function NewActivityButton({
  deals,
  contacts,
  prefillDealId,
}: {
  deals: DealRow[];
  contacts: ContactRow[];
  prefillDealId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const body = {
      type: String(formData.get("type") ?? "task") as
        | "call"
        | "email"
        | "whatsapp"
        | "meeting"
        | "task"
        | "note"
        | "sms"
        | "video_meeting"
        | "demo"
        | "follow_up"
        | "linkedin",
      title: String(formData.get("title") ?? ""),
      description: (formData.get("description") as string) || undefined,
      due_date: (formData.get("due_date") as string) || undefined,
      deal_id: (formData.get("deal_id") as string) || undefined,
      contact_id: (formData.get("contact_id") as string) || undefined,
    };
    start(async () => {
      const result = await createActivity(body);
      if (result.ok) {
        toast.success("Atividade criada");
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
          <Plus className="mr-1 h-4 w-4" /> Nova atividade
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova atividade</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="type">Tipo</Label>
            <select
              name="type"
              id="type"
              defaultValue="task"
              className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
            >
              <option value="task">Tarefa</option>
              <option value="call">Ligacao</option>
              <option value="meeting">Reuniao</option>
              <option value="video_meeting">Video reuniao</option>
              <option value="demo">Demo</option>
              <option value="follow_up">Follow-up</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="linkedin">LinkedIn</option>
              <option value="sms">SMS</option>
              <option value="note">Nota</option>
            </select>
          </div>
          <div>
            <Label htmlFor="title">Titulo</Label>
            <Input name="title" id="title" required autoFocus />
          </div>
          <div>
            <Label htmlFor="description">Descricao</Label>
            <Textarea name="description" id="description" rows={3} />
          </div>
          <div>
            <Label htmlFor="due_date">Quando</Label>
            <Input name="due_date" id="due_date" type="datetime-local" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="deal_id">Negocio</Label>
              <select
                name="deal_id"
                id="deal_id"
                defaultValue={prefillDealId ?? ""}
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                <option value="">(Nenhum)</option>
                {deals.slice(0, 30).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
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
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
