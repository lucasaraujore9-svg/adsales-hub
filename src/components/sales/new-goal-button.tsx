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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createGoal } from "@/lib/actions/sales";
import type { UserRow } from "@/lib/queries/crm";

const METRICS: { key: string; label: string }[] = [
  { key: "revenue", label: "Receita (R$)" },
  { key: "deals_won", label: "Negocios fechados" },
  { key: "deals_created", label: "Negocios criados" },
  { key: "activities", label: "Atividades" },
  { key: "calls", label: "Ligacoes" },
  { key: "meetings", label: "Reunioes" },
  { key: "leads", label: "Leads" },
  { key: "cpl", label: "CPL máximo (R$)" },
  { key: "roas", label: "ROAS mínimo (x)" },
  { key: "spend", label: "Investimento (R$)" },
];

const PERIODS = [
  { key: "weekly", label: "Semanal" },
  { key: "monthly", label: "Mensal" },
  { key: "quarterly", label: "Trimestral" },
  { key: "yearly", label: "Anual" },
];

function periodRange(type: string): { start: string; end: string } {
  const now = new Date();
  if (type === "weekly") {
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }
  if (type === "quarterly") {
    const q = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), q * 3, 1);
    const end = new Date(now.getFullYear(), q * 3 + 3, 0);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }
  if (type === "yearly") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }
  // monthly default
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export function NewGoalButton({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [scope, setScope] = useState<"user" | "team" | "workspace">("workspace");

  async function handleSubmit(form: FormData) {
    const periodType = String(form.get("period_type") ?? "monthly");
    const range = periodRange(periodType);
    const body = {
      scope,
      owner_user_id: scope === "user" ? String(form.get("owner_user_id") ?? "") : null,
      metric: String(form.get("metric") ?? "revenue"),
      target: Number(form.get("target") ?? 0),
      period_type: periodType,
      period_start: range.start,
      period_end: range.end,
    };
    start(async () => {
      const result = await createGoal(body);
      if (result.ok) {
        toast.success("Meta criada");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" /> Nova meta
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova meta</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label>Escopo</Label>
            <div className="mt-1 flex gap-1 rounded-pill border border-[color:var(--line-2)] p-0.5">
              {(["workspace", "team", "user"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  className={`flex-1 rounded-pill px-3 py-1 text-xs font-medium transition-colors ${
                    scope === s
                      ? "bg-[color:var(--ink)] text-[color:var(--bg)]"
                      : "text-[color:var(--ink-3)]"
                  }`}
                >
                  {s === "workspace" ? "Workspace" : s === "team" ? "Time" : "Pessoa"}
                </button>
              ))}
            </div>
          </div>
          {scope === "user" && (
            <div>
              <Label htmlFor="owner_user_id">Responsavel</Label>
              <select
                id="owner_user_id"
                name="owner_user_id"
                required
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name ?? u.email}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <Label htmlFor="metric">Metrica</Label>
            <select
              id="metric"
              name="metric"
              defaultValue="revenue"
              className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
            >
              {METRICS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="target">Meta</Label>
              <Input id="target" name="target" type="number" min={0} step={100} required />
            </div>
            <div>
              <Label htmlFor="period_type">Periodo</Label>
              <select
                id="period_type"
                name="period_type"
                defaultValue="monthly"
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                {PERIODS.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              Criar meta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
