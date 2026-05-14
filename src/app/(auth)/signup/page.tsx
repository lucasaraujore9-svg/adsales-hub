"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SocialButtons } from "@/components/auth/social-buttons";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { signupWithPassword, type ActionResult } from "@/lib/auth/actions";

const initialState: ActionResult | null = null;

const STRONG_ENOUGH = (s: string) =>
  s.length >= 8 && /[A-Z]/.test(s) && /[0-9]/.test(s) && /[^a-zA-Z0-9]/.test(s);

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupWithPassword, initialState);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const passwordsMatch = password.length > 0 && password === passwordConfirm;
  const showMismatch = passwordConfirm.length > 0 && !passwordsMatch;
  const canSubmit = STRONG_ENOUGH(password) && passwordsMatch;

  if (state?.ok) {
    return (
      <div className="space-y-4">
        <span className="kicker">Quase lá</span>
        <h2 className="text-3xl font-medium tracking-tighter2">Confirme seu email</h2>
        <p className="text-sm text-[color:var(--ink-3)]">
          Enviamos um link de confirmação para o email informado. Após confirmar, seu workspace
          será criado automaticamente com um trial de 14 dias no plano Escala.
        </p>
        <ul className="space-y-1 text-xs text-[color:var(--ink-3)]">
          <li>• Pode demorar 2-5 min para chegar.</li>
          <li>• Verifique a pasta SPAM/Lixo eletrônico.</li>
        </ul>
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
        <h2 className="mt-3 text-3xl font-medium tracking-tighter2">14 dias grátis</h2>
        <p className="mt-2 text-sm text-[color:var(--ink-3)]">
          Plano Escala liberado no trial. Sem cartão.
        </p>
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Seu nome</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Ex: João Silva"
          />
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
          <Input id="email" name="email" type="email" required autoComplete="email" />
          {state?.fieldErrors?.email && (
            <p className="text-xs text-[color:var(--bad)]">{state.fieldErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <PasswordInput
            id="password"
            name="password"
            required
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password.length > 0 && <PasswordStrengthMeter password={password} />}
          {state?.fieldErrors?.password && (
            <p className="text-xs text-[color:var(--bad)]">{state.fieldErrors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password_confirm">Confirmar senha</Label>
          <PasswordInput
            id="password_confirm"
            name="password_confirm"
            required
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
          {showMismatch && (
            <p className="text-xs text-[color:var(--bad)]">As senhas não coincidem.</p>
          )}
          {state?.fieldErrors?.password_confirm && !showMismatch && (
            <p className="text-xs text-[color:var(--bad)]">
              {state.fieldErrors.password_confirm}
            </p>
          )}
        </div>

        {state?.error && (
          <p className="rounded-md border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/10 px-3 py-2 text-xs text-[color:var(--bad)]">
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending || !canSubmit}>
          {pending ? "Criando..." : "Criar conta"}
        </Button>

        <p className="text-center text-xs text-[color:var(--ink-4)]">
          Ao criar conta, você concorda com nossos{" "}
          <Link href="/terms" className="underline hover:text-[color:var(--ink)]">
            Termos
          </Link>{" "}
          e{" "}
          <Link href="/privacy" className="underline hover:text-[color:var(--ink)]">
            Privacidade
          </Link>
          .
        </p>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase tracking-kicker text-[color:var(--ink-4)]">ou</span>
        <Separator className="flex-1" />
      </div>

      <SocialButtons />

      <p className="text-center text-sm text-[color:var(--ink-3)]">
        Já tem conta?{" "}
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
