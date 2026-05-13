"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPasswordReset, type ActionResult } from "@/lib/auth/actions";

const initialState: ActionResult | null = null;

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(sendPasswordReset, initialState);

  if (state?.ok) {
    return (
      <div className="space-y-4">
        <span className="kicker">Email enviado</span>
        <h2 className="text-3xl font-medium tracking-tighter2">Verifique sua caixa</h2>
        <p className="text-sm text-[color:var(--ink-3)]">
          Se o email estiver registrado, voce recebera um link para redefinir
          sua senha em instantes.
        </p>
        <Link
          href="/login"
          className="inline-flex text-sm font-medium text-[color:var(--accent)]"
        >
          Voltar para login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="kicker">Recuperar acesso</span>
        <h2 className="mt-3 text-3xl font-medium tracking-tighter2">
          Esqueceu a senha?
        </h2>
        <p className="mt-2 text-sm text-[color:var(--ink-3)]">
          Informe o email cadastrado e enviaremos um link de redefinicao.
        </p>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
          {state?.fieldErrors?.email && (
            <p className="text-xs text-[color:var(--bad)]">
              {state.fieldErrors.email}
            </p>
          )}
        </div>

        {state?.error && (
          <p className="rounded-md border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/10 px-3 py-2 text-xs text-[color:var(--bad)]">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Enviando..." : "Enviar link"}
        </Button>
      </form>

      <p className="text-center text-sm text-[color:var(--ink-3)]">
        Lembrou?{" "}
        <Link
          href="/login"
          className="font-medium text-[color:var(--ink)] hover:text-[color:var(--accent)]"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
