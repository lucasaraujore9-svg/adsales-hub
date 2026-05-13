"use client";

import { useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Award,
  Code,
  HelpCircle,
  ListChecks,
  MessageCircle,
  Plus,
  Quote,
  ScrollText,
  Sparkles,
  Star,
  Target,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateLandingPageBlocks } from "@/lib/actions/content";

type BlockType =
  | "hero"
  | "problem"
  | "benefits"
  | "features"
  | "testimonials"
  | "form"
  | "pricing"
  | "faq"
  | "cta"
  | "footer"
  | "custom_html";

interface Block {
  type: BlockType;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  form_id?: string | null;
  config?: Record<string, unknown>;
}

const META: Record<
  BlockType,
  { label: string; icon: typeof Star; helper: string; hasCta?: boolean; hasForm?: boolean; hasBody?: boolean }
> = {
  hero: { label: "Hero", icon: Sparkles, helper: "Headline + sub + CTA principal", hasCta: true },
  problem: { label: "Problema", icon: HelpCircle, helper: "Dor que voce resolve", hasBody: true },
  benefits: { label: "Beneficios", icon: Star, helper: "3-5 bullets", hasBody: true },
  features: { label: "Features", icon: ListChecks, helper: "Detalhes funcionais", hasBody: true },
  testimonials: { label: "Depoimentos", icon: Quote, helper: "Social proof" },
  form: { label: "Formulario", icon: Award, helper: "Captura de leads", hasForm: true },
  pricing: { label: "Precos", icon: ScrollText, helper: "Planos / oferta" },
  faq: { label: "FAQ", icon: HelpCircle, helper: "Perguntas frequentes", hasBody: true },
  cta: { label: "CTA final", icon: Target, helper: "Chamada de fechamento", hasCta: true },
  footer: { label: "Rodape", icon: MessageCircle, helper: "Contatos / links" },
  custom_html: { label: "HTML custom", icon: Code, helper: "Bloco livre", hasBody: true },
};

const ALL_TYPES: BlockType[] = [
  "hero",
  "problem",
  "benefits",
  "features",
  "testimonials",
  "form",
  "pricing",
  "faq",
  "cta",
  "footer",
  "custom_html",
];

interface FormOption {
  id: string;
  name: string;
}

export function LpBlocksEditor({
  pageId,
  initialBlocks,
  forms,
}: {
  pageId: string;
  initialBlocks: Block[];
  forms: FormOption[];
}) {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [pending, start] = useTransition();
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  function addBlock(type: BlockType) {
    setBlocks((prev) => [
      ...prev,
      {
        type,
        title: META[type].label,
        body: "",
        cta_label: META[type].hasCta ? "Quero saber mais" : null,
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
      const result = await updateLandingPageBlocks({ id: pageId, blocks });
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
      <div className="space-y-2">
        {blocks.length === 0 ? (
          <div className="rounded-card border border-dashed border-[color:var(--line-2)] bg-[color:var(--panel)] p-10 text-center text-sm text-[color:var(--ink-3)]">
            Nenhum bloco. Adicione abaixo.
          </div>
        ) : (
          blocks.map((b, idx) => {
            const meta = META[b.type];
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
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[color:var(--bg-2)] text-[color:var(--ink-3)]">
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
                        {b.title ?? "(Sem titulo)"}
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
                      <Label htmlFor={`lp-title-${idx}`}>Titulo</Label>
                      <Input
                        id={`lp-title-${idx}`}
                        value={b.title ?? ""}
                        onChange={(e) => update(idx, { title: e.target.value })}
                      />
                    </div>
                    {b.type === "hero" && (
                      <div>
                        <Label htmlFor={`lp-sub-${idx}`}>Subtitle</Label>
                        <Input
                          id={`lp-sub-${idx}`}
                          value={b.subtitle ?? ""}
                          onChange={(e) => update(idx, { subtitle: e.target.value })}
                        />
                      </div>
                    )}
                    {meta.hasBody && (
                      <div>
                        <Label htmlFor={`lp-body-${idx}`}>Conteudo</Label>
                        <textarea
                          id={`lp-body-${idx}`}
                          value={b.body ?? ""}
                          onChange={(e) => update(idx, { body: e.target.value })}
                          rows={5}
                          className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
                          placeholder={
                            b.type === "benefits"
                              ? "- Beneficio 1\n- Beneficio 2\n- Beneficio 3"
                              : b.type === "faq"
                                ? "P: Quanto tempo dura?\nR: 14 dias gratis."
                                : "Conteudo livre"
                          }
                        />
                      </div>
                    )}
                    {meta.hasCta && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`lp-cta-${idx}`}>CTA label</Label>
                          <Input
                            id={`lp-cta-${idx}`}
                            value={b.cta_label ?? ""}
                            onChange={(e) => update(idx, { cta_label: e.target.value })}
                            placeholder="Comecar trial gratis"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`lp-url-${idx}`}>CTA URL</Label>
                          <Input
                            id={`lp-url-${idx}`}
                            value={b.cta_url ?? ""}
                            onChange={(e) => update(idx, { cta_url: e.target.value })}
                            placeholder="#form ou /signup"
                          />
                        </div>
                      </div>
                    )}
                    {meta.hasForm && (
                      <div>
                        <Label htmlFor={`lp-form-${idx}`}>Formulario</Label>
                        <select
                          id={`lp-form-${idx}`}
                          value={b.form_id ?? ""}
                          onChange={(e) => update(idx, { form_id: e.target.value || null })}
                          className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 text-sm"
                        >
                          <option value="">(Selecionar formulario)</option>
                          {forms.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                      </div>
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
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {ALL_TYPES.map((t) => {
            const meta = META[t];
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
          {pending ? "Salvando..." : "Salvar pagina"}
        </Button>
      </div>
    </div>
  );
}
