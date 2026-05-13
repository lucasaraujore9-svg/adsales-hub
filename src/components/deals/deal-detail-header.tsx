"use client";

import { useState, useTransition } from "react";
import { Check, Pause, Play, Trash2, TrendingUp, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteDeal, updateDeal } from "@/lib/actions/deals";
import type { DealRow, StageRow } from "@/lib/queries/crm";

interface Props {
  deal: DealRow;
  stages: StageRow[];
}

export function DealDetailHeader({ deal, stages }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editingValue, setEditingValue] = useState(false);
  const [value, setValue] = useState(Number(deal.value || 0));

  const currentStage = stages.find((s) => s.id === deal.stage_id);

  function doAction(fn: () => Promise<{ ok: boolean; error?: string }>, successMsg: string) {
    start(async () => {
      const result = await fn();
      if (result.ok) {
        toast.success(successMsg);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
      {/* Stage picker */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <span
              className="mr-2 inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: currentStage?.color ?? "#6366F1" }}
            />
            Estagio: {currentStage?.name ?? "—"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {stages.map((s) => (
            <DropdownMenuItem
              key={s.id}
              onSelect={() =>
                doAction(
                  () => updateDeal({ id: deal.id, stage_id: s.id }),
                  `Movido para ${s.name}`,
                )
              }
            >
              <span
                className="mr-2 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: s.color ?? "#6366F1" }}
              />
              {s.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Inline value edit */}
      {editingValue ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            doAction(
              () => updateDeal({ id: deal.id, value }),
              "Valor atualizado",
            );
            setEditingValue(false);
          }}
          className="flex items-center gap-1"
        >
          <Input
            type="number"
            min={0}
            step={100}
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-40"
            autoFocus
          />
          <Button type="submit" size="sm" disabled={pending}>
            OK
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setEditingValue(false)}>
            Cancelar
          </Button>
        </form>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setEditingValue(true)}>
          Editar valor
        </Button>
      )}

      <div className="ml-auto flex gap-1">
        {deal.status === "open" ? (
          <>
            <Button
              size="sm"
              onClick={() =>
                doAction(
                  () => updateDeal({ id: deal.id, status: "won" }),
                  "Marcado como ganho",
                )
              }
              disabled={pending}
            >
              <Check className="mr-1 h-4 w-4" /> Ganhou
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                doAction(
                  () => updateDeal({ id: deal.id, status: "lost" }),
                  "Marcado como perdido",
                )
              }
              disabled={pending}
            >
              <XCircle className="mr-1 h-4 w-4" /> Perdeu
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              doAction(
                () => updateDeal({ id: deal.id, status: "open" }),
                "Reaberto",
              )
            }
            disabled={pending}
          >
            <TrendingUp className="mr-1 h-4 w-4" /> Reabrir
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm("Excluir este negocio?")) {
              doAction(() => deleteDeal(deal.id), "Excluido");
              router.push("/pipeline");
            }
          }}
          disabled={pending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
