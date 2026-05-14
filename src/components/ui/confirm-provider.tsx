"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
};

type Internal = ConfirmOptions & {
  open: boolean;
  resolve: ((ok: boolean) => void) | null;
};

const initial: Internal = {
  open: false,
  title: "",
  resolve: null,
};

const ConfirmCtx = createContext<((opts: ConfirmOptions) => Promise<boolean>) | null>(
  null,
);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Internal>(initial);
  const [pending, setPending] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: opts.title,
        description: opts.description,
        confirmLabel: opts.confirmLabel ?? "Confirmar",
        cancelLabel: opts.cancelLabel ?? "Cancelar",
        variant: opts.variant ?? "default",
        resolve,
      });
    });
  }, []);

  function close(ok: boolean) {
    if (pending) return; // não fechar enquanto resolve
    state.resolve?.(ok);
    setState(initial);
    setPending(false);
  }

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <Dialog
        open={state.open}
        onOpenChange={(o) => {
          if (!o && !pending) close(false);
        }}
      >
        <DialogContent
          onOpenAutoFocus={(e) => {
            // foca no Cancelar por padrão (segurança)
            e.preventDefault();
            cancelRef.current?.focus();
          }}
          className="max-w-md"
        >
          <DialogHeader>
            <DialogTitle>{state.title}</DialogTitle>
            {state.description && (
              <DialogDescription>{state.description}</DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button
              ref={cancelRef}
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => close(false)}
            >
              {state.cancelLabel}
            </Button>
            <Button
              type="button"
              variant={state.variant === "destructive" ? "destructive" : "default"}
              disabled={pending}
              onClick={() => {
                setPending(true);
                close(true);
              }}
            >
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {state.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmCtx.Provider>
  );
}

/**
 * Hook que retorna função `confirm(opts)` para abrir modal de confirmação.
 * Substitui `window.confirm()`.
 */
export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) {
    throw new Error(
      "useConfirm precisa estar dentro de <ConfirmProvider> (montado em layout.tsx).",
    );
  }
  return ctx;
}
