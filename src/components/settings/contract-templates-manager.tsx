"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  createContractTemplate,
  createProposalTemplate,
  deleteContractTemplate,
  deleteProposalTemplate,
} from "@/lib/actions/contract-templates";

interface ProposalTemplate {
  id: string;
  name: string;
  description: string | null;
  default_validity_days: number;
  is_active: boolean;
}

interface ContractTemplate {
  id: string;
  name: string;
  description: string | null;
  content: string;
  is_active: boolean;
}

export function ContractTemplatesManager({
  proposals,
  contracts,
}: {
  proposals: ProposalTemplate[];
  contracts: ContractTemplate[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);
  const [openContractId, setOpenContractId] = useState<string | null>(null);

  async function handleProposalCreate(form: FormData) {
    const body = {
      name: String(form.get("name") ?? ""),
      description: (form.get("description") as string) || null,
      default_validity_days: Number(form.get("default_validity_days") ?? 7),
    };
    start(async () => {
      const result = await createProposalTemplate(body);
      if (result.ok) {
        toast.success("Template de proposta criado");
        setShowProposalForm(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  async function handleContractCreate(form: FormData) {
    const body = {
      name: String(form.get("name") ?? ""),
      description: (form.get("description") as string) || null,
      content: String(form.get("content") ?? ""),
    };
    start(async () => {
      const result = await createContractTemplate(body);
      if (result.ok) {
        toast.success("Template de contrato criado");
        setShowContractForm(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDelete(kind: "proposal" | "contract", id: string, name: string) {
    if (!confirm(`Excluir o template "${name}"?`)) return;
    start(async () => {
      const result =
        kind === "proposal"
          ? await deleteProposalTemplate(id)
          : await deleteContractTemplate(id);
      if (result.ok) {
        toast.success("Excluido");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-kicker text-[color:var(--ink-3)]">
            Propostas
          </h2>
          {!showProposalForm && (
            <Button size="sm" onClick={() => setShowProposalForm(true)}>
              <Plus className="mr-1 h-4 w-4" /> Novo template
            </Button>
          )}
        </div>

        {showProposalForm && (
          <form
            action={handleProposalCreate}
            className="mb-4 space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
          >
            <div>
              <Label htmlFor="pt-name">Nome</Label>
              <Input
                id="pt-name"
                name="name"
                required
                autoFocus
                placeholder="Proposta padrao SaaS B2B"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="pt-validity">Validade padrao (dias)</Label>
                <Input
                  id="pt-validity"
                  name="default_validity_days"
                  type="number"
                  min={1}
                  max={180}
                  defaultValue={7}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pt-desc">Descricao</Label>
                <Input id="pt-desc" name="description" placeholder="Quando usar" />
              </div>
            </div>
            <p className="text-[10px] text-[color:var(--ink-4)]">
              Os blocos da proposta (capa, problema, solucao, precos) sao editados no builder em
              <code className="font-mono"> /contratos</code>.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowProposalForm(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={pending}>
                Criar
              </Button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
          {proposals.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
              Nenhum template de proposta.
            </p>
          ) : (
            <ul className="divide-y divide-[color:var(--line)]">
              {proposals.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/configuracoes/contratos/${p.id}`}
                        className="font-medium hover:text-[color:var(--accent)]"
                      >
                        {p.name}
                      </Link>
                      <StatusBadge
                        label={p.is_active ? "Ativo" : "Inativo"}
                        tone={p.is_active ? "good" : "neutral"}
                      />
                      <span className="rounded-pill border border-[color:var(--line-2)] px-2 py-0.5 text-[10px] text-[color:var(--ink-3)]">
                        {p.default_validity_days}d valid.
                      </span>
                    </div>
                    {p.description && (
                      <p className="mt-0.5 text-xs text-[color:var(--ink-3)]">{p.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/configuracoes/contratos/${p.id}`}>
                        Editar blocos <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete("proposal", p.id, p.name)}
                      disabled={pending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-kicker text-[color:var(--ink-3)]">
            Contratos
          </h2>
          {!showContractForm && (
            <Button size="sm" onClick={() => setShowContractForm(true)}>
              <Plus className="mr-1 h-4 w-4" /> Novo template
            </Button>
          )}
        </div>

        {showContractForm && (
          <form
            action={handleContractCreate}
            className="mb-4 space-y-3 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-4"
          >
            <div>
              <Label htmlFor="ct-name">Nome</Label>
              <Input
                id="ct-name"
                name="name"
                required
                autoFocus
                placeholder="Contrato anual SaaS"
              />
            </div>
            <div>
              <Label htmlFor="ct-desc">Descricao</Label>
              <Input id="ct-desc" name="description" placeholder="Quando usar" />
            </div>
            <div>
              <Label htmlFor="ct-content">Conteudo (HTML/markdown)</Label>
              <textarea
                id="ct-content"
                name="content"
                required
                rows={8}
                className="mt-1 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-2 font-mono text-xs"
                placeholder={"<h1>Contrato de prestacao</h1>\n<p>Entre {{contractor_name}} e {{client_name}}...</p>"}
              />
              <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
                Variaveis: {`{{client_name}}, {{client_cnpj}}, {{deal_total}}, {{validity_date}}, {{signature_date}}`}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowContractForm(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={pending}>
                Criar
              </Button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-card border border-[color:var(--line)] bg-[color:var(--panel)]">
          {contracts.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[color:var(--ink-3)]">
              Nenhum template de contrato.
            </p>
          ) : (
            <ul className="divide-y divide-[color:var(--line)]">
              {contracts.map((c) => (
                <li key={c.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => setOpenContractId(openContractId === c.id ? null : c.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium hover:text-[color:var(--accent)]">
                          {c.name}
                        </span>
                        <StatusBadge
                          label={c.is_active ? "Ativo" : "Inativo"}
                          tone={c.is_active ? "good" : "neutral"}
                        />
                      </div>
                      {c.description && (
                        <p className="mt-0.5 text-xs text-[color:var(--ink-3)]">{c.description}</p>
                      )}
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete("contract", c.id, c.name)}
                      disabled={pending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {openContractId === c.id && (
                    <pre className="mt-3 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-md border border-[color:var(--line)] bg-[color:var(--bg)] p-3 text-xs text-[color:var(--ink-2)]">
                      {c.content}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
