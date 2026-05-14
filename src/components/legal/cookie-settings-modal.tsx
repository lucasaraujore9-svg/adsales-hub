"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_CHOICES,
  getConsent,
  type ConsentChoices,
} from "@/lib/cookie-consent";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (choices: ConsentChoices) => void;
}

const CATEGORIES: Array<{
  key: "essential" | "analytics" | "marketing";
  label: string;
  description: string;
  required?: boolean;
}> = [
  {
    key: "essential",
    label: "Essenciais",
    description:
      "Necessários para login, sessão, segurança e funcionalidades básicas. Não podem ser desabilitados.",
    required: true,
  },
  {
    key: "analytics",
    label: "Analytics",
    description:
      "Estatísticas anônimas de uso (páginas mais acessadas, tempo no site). Ajudam a melhorar o produto.",
  },
  {
    key: "marketing",
    label: "Marketing",
    description:
      "Pixels e remarketing para mostrar anúncios relevantes em outras redes. Compartilha dados com parceiros.",
  },
];

export function CookieSettingsModal({ open, onClose, onSave }: Props) {
  const [choices, setChoices] = useState<ConsentChoices>(DEFAULT_CHOICES);

  useEffect(() => {
    if (open) {
      const current = getConsent();
      setChoices(current ?? DEFAULT_CHOICES);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurar cookies</DialogTitle>
          <DialogDescription>
            Escolha quais categorias de cookies você quer permitir. Você pode mudar isso a qualquer momento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className="flex items-start justify-between gap-4 rounded-card border border-[color:var(--line)] bg-[color:var(--bg-2)] p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[color:var(--ink)]">
                    {cat.label}
                  </span>
                  {cat.required && (
                    <span className="rounded-pill bg-[color:var(--ink)] px-2 py-0.5 text-[10px] font-medium text-[color:var(--bg)]">
                      Sempre ativo
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[color:var(--ink-3)]">
                  {cat.description}
                </p>
              </div>
              <Switch
                checked={choices[cat.key]}
                disabled={cat.required}
                onCheckedChange={(v) =>
                  setChoices((prev) => ({ ...prev, [cat.key]: cat.required ? true : !!v }))
                }
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(choices)}>Salvar preferências</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
