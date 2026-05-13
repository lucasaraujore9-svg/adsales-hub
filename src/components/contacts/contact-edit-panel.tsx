"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteContact, updateContact } from "@/lib/actions/contacts";
import type { CompanyRow, ContactRow } from "@/lib/queries/crm";

const LIFECYCLE: { key: string; label: string }[] = [
  { key: "lead", label: "Lead" },
  { key: "mql", label: "MQL" },
  { key: "sql", label: "SQL" },
  { key: "opportunity", label: "Oportunidade" },
  { key: "customer", label: "Cliente" },
  { key: "lost", label: "Perdido" },
];

export function ContactEditPanel({
  contact,
  companies,
}: {
  contact: ContactRow;
  companies: CompanyRow[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  async function handleSubmit(form: FormData) {
    const patch = {
      name: String(form.get("name") ?? "").trim(),
      email: (form.get("email") as string) || null,
      phone: (form.get("phone") as string) || null,
      whatsapp: (form.get("whatsapp") as string) || null,
      position: (form.get("position") as string) || null,
      company_id: (form.get("company_id") as string) || null,
      lifecycle_stage: (form.get("lifecycle_stage") as string) ?? "lead",
    };
    start(async () => {
      const result = await updateContact(contact.id, patch);
      if (result.ok) {
        toast.success("Contato atualizado");
        setEditing(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro ao atualizar");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Excluir este contato? Negocios vinculados ficarao sem contato.")) return;
    start(async () => {
      const result = await deleteContact(contact.id);
      if (result.ok) {
        toast.success("Contato excluido");
        router.push("/contatos");
      } else {
        toast.error(result.error ?? "Erro ao excluir");
      }
    });
  }

  if (!editing) {
    return (
      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
        <div className="kicker">Acoes</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
          </Button>
          <Button size="sm" variant="outline" onClick={handleDelete} disabled={pending}>
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Excluir
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
      <div className="kicker">Editar contato</div>
      <form action={handleSubmit} className="mt-3 space-y-3 text-sm">
        <div>
          <Label htmlFor="c-name">Nome</Label>
          <Input id="c-name" name="name" defaultValue={contact.name} required />
        </div>
        <div>
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" name="email" type="email" defaultValue={contact.email ?? ""} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="c-phone">Telefone</Label>
            <Input id="c-phone" name="phone" defaultValue={contact.phone ?? ""} />
          </div>
          <div>
            <Label htmlFor="c-whatsapp">WhatsApp</Label>
            <Input id="c-whatsapp" name="whatsapp" defaultValue={contact.whatsapp ?? ""} />
          </div>
        </div>
        <div>
          <Label htmlFor="c-position">Cargo</Label>
          <Input id="c-position" name="position" defaultValue={contact.position ?? ""} />
        </div>
        <div>
          <Label htmlFor="c-company">Empresa</Label>
          <select
            id="c-company"
            name="company_id"
            defaultValue={contact.company_id ?? ""}
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
          <Label htmlFor="c-lifecycle">Fase</Label>
          <select
            id="c-lifecycle"
            name="lifecycle_stage"
            defaultValue={contact.lifecycle_stage}
            className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
          >
            {LIFECYCLE.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEditing(false)}
            disabled={pending}
          >
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
}
