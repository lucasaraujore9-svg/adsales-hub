"use client";

import { useState, useTransition } from "react";
import { Merge, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mergeContacts } from "@/lib/actions/contact-merge";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  created_at: string;
}

interface Props {
  group: Contact[];
}

const FIELDS: Array<{ key: keyof Contact; label: string }> = [
  { key: "name", label: "Nome" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Telefone" },
  { key: "whatsapp", label: "WhatsApp" },
];

/**
 * Botão "Mesclar" + Dialog lado-a-lado para escolher valores por campo.
 */
export function MergeGroupButton({ group }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [primaryId, setPrimaryId] = useState(group[0]?.id ?? "");
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const [confirmText, setConfirmText] = useState("");

  // Resolve valores iniciais (mais antigo prevalece)
  function getInitialChoice(key: keyof Contact): string {
    for (const c of group) {
      const v = c[key];
      if (v) return String(c.id);
    }
    return primaryId;
  }

  function valueAt(contactId: string, key: keyof Contact): string | null {
    const c = group.find((g) => g.id === contactId);
    if (!c) return null;
    const v = c[key];
    return v ? String(v) : null;
  }

  function fieldChoices(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const f of FIELDS) {
      const id = choices[f.key] ?? getInitialChoice(f.key);
      const v = valueAt(id, f.key);
      if (v != null) out[f.key] = v;
    }
    return out;
  }

  async function handleMerge() {
    if (confirmText.trim().toUpperCase() !== "MESCLAR") {
      toast.error("Digite MESCLAR para confirmar.");
      return;
    }
    const secondaryIds = group.filter((c) => c.id !== primaryId).map((c) => c.id);
    start(async () => {
      const r = await mergeContacts({
        primaryId,
        secondaryIds,
        fieldChoices: fieldChoices(),
      });
      if (r.ok) {
        toast.success(`${secondaryIds.length} contato(s) mesclado(s)`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(r.error ?? "Falha ao mesclar");
      }
    });
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Merge className="mr-1 h-3 w-3" /> Mesclar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Mesclar {group.length} contatos</DialogTitle>
            <DialogDescription>
              Escolha qual contato fica como principal e qual valor manter para cada campo. Esta ação
              é irreversível — outros contatos serão arquivados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
                Contato principal (ficará ativo)
              </p>
              <div className="space-y-1.5">
                {group.map((c) => (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm ${
                      primaryId === c.id
                        ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10"
                        : "border-[color:var(--line)]"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={primaryId === c.id}
                      onChange={() => setPrimaryId(c.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-[color:var(--ink-4)]">
                        {c.email ?? "—"} · criado {new Date(c.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
                Valor a manter por campo
              </p>
              <div className="space-y-2">
                {FIELDS.map((f) => {
                  const distinct = Array.from(
                    new Set(group.map((c) => c[f.key]).filter(Boolean) as string[]),
                  );
                  if (distinct.length <= 1) {
                    return (
                      <div key={f.key} className="rounded-md border border-[color:var(--line)] p-2 text-sm">
                        <span className="text-[color:var(--ink-3)]">{f.label}:</span>{" "}
                        <span className="font-medium">{distinct[0] ?? "—"}</span>
                      </div>
                    );
                  }
                  const currentChoice = choices[f.key] ?? getInitialChoice(f.key);
                  return (
                    <div key={f.key} className="rounded-md border border-[color:var(--line)] p-2">
                      <p className="text-xs font-medium text-[color:var(--ink-3)]">{f.label}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {group.map((c) => {
                          const v = c[f.key];
                          if (!v) return null;
                          return (
                            <label
                              key={c.id + f.key}
                              className={`flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
                                currentChoice === c.id
                                  ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
                                  : "border-[color:var(--line-2)] text-[color:var(--ink-3)]"
                              }`}
                            >
                              <input
                                type="radio"
                                checked={currentChoice === c.id}
                                onChange={() =>
                                  setChoices((prev) => ({ ...prev, [f.key]: c.id }))
                                }
                                className="sr-only"
                              />
                              {String(v)}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-md border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/5 p-3">
              <p className="text-xs text-[color:var(--bad)]">
                Digite <strong>MESCLAR</strong> abaixo para confirmar. Outros {group.length - 1} contato(s) serão arquivados.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="MESCLAR"
                className="mt-2 w-full rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)] px-3 py-1.5 text-sm font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button
              onClick={handleMerge}
              disabled={pending || confirmText.trim().toUpperCase() !== "MESCLAR"}
              variant="destructive"
            >
              {pending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Mesclar agora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
