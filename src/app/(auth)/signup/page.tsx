"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SocialButtons } from "@/components/auth/social-buttons";
import { signupWithPassword, type ActionResult } from "@/lib/auth/actions";

const initialState: ActionResult | null = null;

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupWithPassword, initialState);

  if (state?.ok) {
    return (
      <div className="space-y-4">
        <span className="kicker">Quase la</span>
        <h2 className="text-3xl font-medium tracking-tighter2">
          Confirme seu email
        </h2>
        <p className="text-sm text-[color:var(--ink-3)]">
          Enviamos um link de confirmacao para o email informado. Apos confirmar,
          seu workspace sera criado automaticamente com um trial de 14 dias no
          plano Escala.
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
        <span className="kicker">Criar conta</span>
        <h2 className="mt-3 text-3xl font-medium tracking-tighter2">
          14 dias gratis
        </h2>
        <p className="mt-2 text-sm text-[color:var(--ink-3)]">
          Plano Escala liberado no trial. Sem cartao.
        </p>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Seu nome</Label>
          <Input id="name" name="name" type="text" required autoComplete="name" />
          {state?.fieldErrors?.name && (
            <p className="text-xs text-[color:var(--bad)]">{state.fieldErrors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="workspace_name">Empresa</Label>
          <Input
            id="workspace_name"
            name="workspace_name"
            type="text"
            required
            placeholder="Nome da sua empresa"
          />
          {state?.fieldErrors?.workspace_name && (
            <p className="text-xs text-[color:var(--bad)]">
              {state.fieldErrors.workspace_name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          {state?.fieldErrors?.email && (
            <p className="text-xs text-[color:var(--bad)]">{state.fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
          />
          {state?.fieldErrors?.password && (
            <p className="text-xs text-[color:var(--bad)]">
              {state.fieldErrors.password}
            </p>
          )}
        </div>

        {state?.error && (
          <p className="rounded-md border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/10 px-3 py-2 text-xs text-[color:var(--bad)]">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Criando..." : "Criar conta"}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">
          ou
        </span>
        <Separator className="flex-1" />
      </div>

      <SocialButtons />

      <p className="text-center text-sm text-[color:var(--ink-3)]">
        Ja tem conta?{" "}
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
