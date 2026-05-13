"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InviteUserButton() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const body = {
      email: String(formData.get("email") ?? ""),
      role: String(formData.get("role") ?? "vendedor"),
      name: (formData.get("name") as string) || undefined,
    };
    start(async () => {
      const res = await fetch("/api/auth/invite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(`Convite enviado para ${data.invited ?? body.email}`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(data.error ?? "Erro ao enviar convite");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="mr-1 h-4 w-4" /> Convidar usuario
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar para o workspace</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input name="email" id="email" type="email" required autoFocus />
          </div>
          <div>
            <Label htmlFor="name">Nome (opcional)</Label>
            <Input name="name" id="name" />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <select
              name="role"
              id="role"
              defaultValue="vendedor"
              className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
            >
              <option value="admin">Admin</option>
              <option value="gestor">Gestor</option>
              <option value="vendedor">Vendedor</option>
              <option value="media_buyer">Media Buyer</option>
              <option value="visualizador">Visualizador</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Enviando..." : "Enviar convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
