"use client";

import { useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Award,
  CircleDollarSign,
  FileText,
  HelpCircle,
  Lightbulb,
  Plus,
  ScrollText,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProposalTemplateBlocks } from "@/lib/actions/contract-templates";

type BlockType =
  | "cover"
  | "problem"
  | "solution"
  | "products"
  | "pricing"
  | "terms"
  | "testimonials"
  | "cta"
  | "custom";

interface Block {
  type: BlockType;
  title: string;
  content?: string | null;
  config?: Record<string, unknown>;
}

const BLOCK_META: Record<
  BlockType,
  { label: string; icon: typeof FileText; defaultTitle: string; helper: string }
> = {
  cover: {
    label: "Capa",
    icon: FileText,
    defaultTitle: "Proposta para {{client_name}}",
    helper: "Capa com nome do cliente, data, validade.",
  },
  problem: {
    label: "Problema",
    icon: HelpCircle,
    defaultTitle: "O desafio",
    helper: "Descreva o problema que o cliente enfrenta.",
  },
  solution: {
    label: "Solucao",
    icon: Lightbulb,
    defaultTitle: "Nossa solucao",
    helper: "Como você resolve esse problema.",
  },
  products: {
    label: "Produtos",
    icon: Award,
    defaultTitle: "Itens da proposta",
    helper: "Lista de produtos/servicos. Puxa do catalogo automaticamente.",
  },
  pricing: {
    label: "Investimento",
    icon: CircleDollarSign,
    defaultTitle: "Investimento",
    helper: "Subtotal, desconto, total. Calculado dos produtos.",
  },
  testimonials: {
    label: "Depoimentos",
    icon: Star,
    defaultTitle: "O que clientes dizem",
    helper: "Social proof.",
  },
  terms: {
    label: "Termos",
    icon: ScrollText,
    defaultTitle: "Termos e condicoes",
    helper: "Pagamento, prazos, cancelamento.",
  },
  cta: {
    label: "Aceitar",
    icon: Sparkles,
    defaultTitle: "Vamos comecar",
    helper: "Botao de aceite + assinatura.",
  },
  custom: {
    label: "Custom",
    icon: FileText,
    defaultTitle: "Bloco custom",
    helper: "Conteudo livre.",
  },
};

const ALL_TYPES: BlockType[] = [
  "cover",
  "problem",
  "solution",
  "products",
  "pricing",
  "testimonials",
  "terms",
  "cta",
  "custom",
];

export function ProposalBlocksEditor({
  templateId,
  initialBlocks,
  initialValidityDays,
}: {
  templateId: string;
  initialBlocks: Block[];
  initialValidityDays: number;
}) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [validityDays, setValidityDays] = useState(initialValidityDays);
  const [pending, start] = useTransition();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  function addBlock(type: BlockType) {
    setBlocks((prev) => [
      ...prev,
      {
        type,
        title: BLOCK_META[type].defaultTitle,
        content: "",
      },
    ]);
    setOpenIdx(blocks.length);
  }

  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  function remove(idx: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== idx));
    if (openIdx === idx) setOpenIdx(null);
  }

  function update(idx: number, patch: Partial<Block>) {
    setBlocks((prev) => prev.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  }

  function handleSave() {
    start(async () => {
      const result = await updateProposalTemplateBlocks({
        id: templateId,
        blocks,
        default_validity_days: validityDays,
      });
      if (result.ok) {
        toast.success("Blocos salvos");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        <Label htmlFor="validity">Validade padrao da proposta (dias)</Label>
        <Input
          id="validity"
          type="number"
          min={1}
          max={180}
          value={validityDays}
          onChange={(e) => setValidityDays(Number(e.target.value))}
          className="mt-1 w-32"
        />
      </div>

      <div className="space-y-2">
        {blocks.length === 0 ? (
          <div className="rounded-card border border-dashed border-[color:var(--line-2)] bg-[color:var(--panel)] p-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhum bloco. Adicione abaixo.
          </div>
        ) : (
          blocks.map((b, idx) => {
            const meta = BLOCK_META[b.type];
            const Icon = meta.icon;
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]"
              >
                <div className="flex items-start gap-3 px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      className="rounded text-[color:var(--ink-4)] hover:text-[color:var(--ink)] disabled:opacity-30"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(idx, 1)}
                      disabled={idx === blocks.length - 1}
                      className="rounded text-[color:var(--ink-4)] hover:text-[color:var(--ink)] disabled:opacity-30"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[color:var(--bg-2)] text-[color:var(--ink-3)]"
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-3)]">
                        {meta.label}
                      </span>
                      <span className="text-sm font-medium hover:text-[color:var(--accent)]">
                        {b.title}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[color:var(--ink-4)]">{meta.helper}</p>
                  </button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {isOpen && (
                  <div className="space-y-3 border-t border-[color:var(--line)] px-4 py-3">
                    <div>
                      <Label htmlFor={`b-title-${idx}`}>Titulo</Label>
                      <Input
                        id={`b-title-${idx}`}
                        value={b.title}
                        onChange={(e) => update(idx, { title: e.target.value })}
                      />
                    </div>
                    {b.type !== "products" && b.type !== "pricing" && (
                      <div>
                        <Label htmlFor={`b-content-${idx}`}>Conteudo</Label>
                        <textarea
                          id={`b-content-${idx}`}
                          value={b.content ?? ""}
                          onChange={(e) => update(idx, { content: e.target.value })}
                          rows={5}
                          className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
                          placeholder={`Texto do bloco ${meta.label.toLowerCase()}. Use {{client_name}}, {{deal_total}}...`}
                        />
                      </div>
                    )}
                    {b.type === "products" && (
                      <p className="text-xs text-[color:var(--ink-4)]">
                        Os produtos sao puxados automaticamente do{" "}
                        <code className="font-mono">deal.products</code> quando a proposta e gerada.
                        Configure o catalogo em <strong>/configuracoes/produtos</strong>.
                      </p>
                    )}
                    {b.type === "pricing" && (
                      <p className="text-xs text-[color:var(--ink-4)]">
                        Calcula automaticamente subtotal + desconto + impostos a partir dos
                        produtos. Mostre <code className="font-mono">{`{{deal_total}}`}</code>.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4">
        <div className="kicker">Adicionar bloco</div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {ALL_TYPES.map((t) => {
            const meta = BLOCK_META[t];
            const Icon = meta.icon;
            return (
              <button
                key={t}
                type="button"
                onClick={() => addBlock(t)}
                className="group flex flex-col items-center gap-1 rounded-lg border border-[color:var(--line)] bg-[color:var(--bg)] p-3 text-xs transition-colors hover:border-[color:var(--accent)]"
              >
                <Icon className="h-4 w-4 text-[color:var(--ink-3)] group-hover:text-[color:var(--accent)]" />
                <span className="font-medium">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end border-t border-[color:var(--line)] pt-4">
        <Button onClick={handleSave} disabled={pending}>
          <Plus className="mr-1 h-4 w-4" />
          {pending ? "Salvando..." : "Salvar template"}
        </Button>
      </div>
    </div>
  );
}
