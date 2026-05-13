"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateDeal } from "@/lib/actions/deals";

export function DealTitleHeader({
  dealId,
  kicker,
  title,
  description,
}: {
  dealId: string;
  kicker?: string;
  title: string;
  description?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [pending, start] = useTransition();

  function save() {
    const trimmed = value.trim();
    if (trimmed.length < 2 || trimmed === title) {
      setEditing(false);
      setValue(title);
      return;
    }
    start(async () => {
      const result = await updateDeal({ id: dealId, title: trimmed });
      if (result.ok) {
        toast.success("Titulo atualizado");
        setEditing(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro ao atualizar");
        setValue(title);
      }
    });
  }

  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 flex-1">
        {kicker && <span className="kicker">{kicker}</span>}
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            className="mt-2 flex flex-wrap items-center gap-2"
          >
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              disabled={pending}
              className="h-12 max-w-2xl text-2xl font-medium md:text-3xl"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditing(false);
                  setValue(title);
                }
              }}
            />
            <Button type="submit" size="sm" disabled={pending}>
              Salvar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => {
                setEditing(false);
                setValue(title);
              }}
            >
              Cancelar
            </Button>
          </form>
        ) : (
          <div className="mt-2 flex items-baseline gap-2">
            <h1 className="text-3xl font-medium tracking-tighter2 md:text-4xl">{title}</h1>
            <button
              onClick={() => setEditing(true)}
              className="text-[color:var(--ink-4)] hover:text-[color:var(--ink-2)]"
              aria-label="Editar titulo"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        )}
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-[color:var(--ink-3)]">{description}</p>
        )}
      </div>
    </header>
  );
}
