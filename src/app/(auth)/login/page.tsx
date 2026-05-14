"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SocialButtons } from "@/components/auth/social-buttons";
import { loginWithPassword, type ActionResult } from "@/lib/auth/actions";

const initialState: ActionResult | null = null;

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginWithPassword, initialState);

  return (
    <div className="space-y-8">
      <div>
        <span className="kicker">Entrar</span>
        <h2 className="mt-3 text-3xl font-medium tracking-tighter2">
          Bem-vindo de volta
        </h2>
        <p className="mt-2 text-sm text-[color:var(--ink-3)]">
          Acesse o seu workspace do AdSales Hub.
        </p>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="você@empresa.com"
          />
          {state?.fieldErrors?.email && (
            <p className="text-xs text-[color:var(--bad)]">{state.fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
            >
              Esqueci a senha
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          {state?.fieldErrors?.password && (
            <p className="text-xs text-[color:var(--bad)]">{state.fieldErrors.password}</p>
          )}
        </div>

        {state?.error && (
          <p className="rounded-md border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/10 px-3 py-2 text-xs text-[color:var(--bad)]">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
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
        Nao tem conta?{" "}
        <Link
          href="/signup"
          className="font-medium text-[color:var(--ink)] hover:text-[color:var(--accent)]"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
