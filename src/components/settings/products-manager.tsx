"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  createProduct,
  deleteProduct,
  toggleProductActive,
} from "@/lib/actions/catalog";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  currency: string;
  billing_cycle: string;
  is_active: boolean;
}

const CYCLE_LABELS: Record<string, string> = {
  one_time: "Unico",
  monthly: "Mensal",
  yearly: "Anual",
  custom: "Custom",
};

function formatCurrency(value: number, currency: string) {
  if (currency === "BRL") {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });
  }
  return `${currency} ${value.toFixed(2)}`;
}

export function ProductsManager({ products }: { products: Product[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showForm, setShowForm] = useState(false);

  async function handleCreate(form: FormData) {
    const body = {
      name: String(form.get("name") ?? ""),
      sku: (form.get("sku") as string) || null,
      description: (form.get("description") as string) || null,
      price: Number(form.get("price") ?? 0),
      currency: String(form.get("currency") ?? "BRL"),
      billing_cycle: String(form.get("billing_cycle") ?? "one_time"),
    };
    start(async () => {
      const result = await createProduct(body);
      if (result.ok) {
        toast.success("Produto criado");
        setShowForm(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir o produto "${name}"?`)) return;
    start(async () => {
      const result = await deleteProduct(id);
      if (result.ok) {
        toast.success("Produto excluido");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleToggle(id: string, active: boolean) {
    start(async () => {
      const result = await toggleProductActive(id, !active);
      if (result.ok) {
        toast.success(active ? "Desativado" : "Ativado");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--ink-3)]">
          {products.length} produto(s) · {products.filter((p) => p.is_active).length} ativos
        </p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" /> Novo produto
          </Button>
        )}
      </div>

      {showForm && (
        <form
          action={handleCreate}
          className="space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <Label htmlFor="p-name">Nome</Label>
              <Input id="p-name" name="name" required autoFocus placeholder="Plano Operacao" />
            </div>
            <div>
              <Label htmlFor="p-sku">SKU (opcional)</Label>
              <Input id="p-sku" name="sku" placeholder="OP-001" />
            </div>
            <div>
              <Label htmlFor="p-price">Preco</Label>
              <Input
                id="p-price"
                name="price"
                type="number"
                min={0}
                step={0.01}
                required
              />
            </div>
            <div>
              <Label htmlFor="p-currency">Moeda</Label>
              <select
                id="p-currency"
                name="currency"
                defaultValue="BRL"
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div>
              <Label htmlFor="p-billing">Cobranca</Label>
              <select
                id="p-billing"
                name="billing_cycle"
                defaultValue="one_time"
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
              >
                <option value="one_time">Unico</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <Label htmlFor="p-desc">Descricao</Label>
              <Input id="p-desc" name="description" placeholder="Curta" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              Criar produto
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
        {products.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhum produto cadastrado.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[color:var(--line)] text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Produto</th>
                <th className="px-5 py-3 text-left font-medium">SKU</th>
                <th className="px-5 py-3 text-right font-medium">Preco</th>
                <th className="px-5 py-3 text-left font-medium">Cobranca</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--line)]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[color:var(--bg-2)]/40">
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-xs text-[color:var(--ink-3)]">{p.sku ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-mono">
                    {formatCurrency(Number(p.price), p.currency)}
                  </td>
                  <td className="px-5 py-3 text-xs">{CYCLE_LABELS[p.billing_cycle] ?? p.billing_cycle}</td>
                  <td className="px-5 py-3">
                    <StatusBadge label={p.is_active ? "Ativo" : "Inativo"} tone={p.is_active ? "good" : "neutral"} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(p.id, p.is_active)}
                        disabled={pending}
                      >
                        {p.is_active ? "Desativar" : "Ativar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={pending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
