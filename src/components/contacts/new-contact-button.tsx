"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
import { createContact } from "@/lib/actions/contacts";
import type { CompanyRow } from "@/lib/queries/crm";

export function NewContactButton({ companies }: { companies: CompanyRow[] }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const body = {
      name: String(formData.get("name") ?? ""),
      email: (formData.get("email") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      whatsapp: (formData.get("whatsapp") as string) || undefined,
      company_id: (formData.get("company_id") as string) || undefined,
      position: (formData.get("position") as string) || undefined,
      lifecycle_stage: (formData.get("lifecycle_stage") as string) || "lead",
      source: (formData.get("source") as string) || undefined,
    };
    start(async () => {
      const result = await createContact(body);
      if (result.ok) {
        toast.success("Contato criado");
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
          <Plus className="mr-1 h-4 w-4" /> Novo contato
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo contato</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input name="name" id="name" required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input name="email" id="email" type="email" />
            </div>
            <div>
              <Label htmlFor="position">Cargo</Label>
              <Input name="position" id="position" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input name="phone" id="phone" />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input name="whatsapp" id="whatsapp" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="company_id">Empresa</Label>
              <select
                name="company_id"
                id="company_id"
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                <option value="">(Sem empresa)</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="lifecycle_stage">Fase</Label>
              <select
                name="lifecycle_stage"
                id="lifecycle_stage"
                defaultValue="lead"
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                {["lead", "mql", "sql", "opportunity", "customer", "lost"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="source">Origem</Label>
            <select
              name="source"
              id="source"
              className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
            >
              <option value="">(Nao informado)</option>
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
              {pending ? "Criando..." : "Criar contato"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
