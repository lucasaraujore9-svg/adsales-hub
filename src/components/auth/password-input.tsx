"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Mostra um botão para alternar visibilidade. Default true. */
  showToggle?: boolean;
}

/**
 * Input de senha com botão de mostrar/ocultar.
 */
export const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  { showToggle = true, className, ...rest },
  ref,
) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        ref={ref}
        type={show ? "text" : "password"}
        className={`pr-10 ${className ?? ""}`}
        {...rest}
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[color:var(--ink-4)] hover:bg-[color:var(--bg-2)] hover:text-[color:var(--ink)]"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
});
