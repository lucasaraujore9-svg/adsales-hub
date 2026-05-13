"use client";

import { useActionState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWorkspaceForCurrentUser,
  signOut,
  type OnboardingResult,
} from "./actions";

const initialState: OnboardingResult | null = null;

export function OnboardingForm({ defaultName }: { defaultName?: string }) {
  const [state, formAction, pending] = useActionState(
    createWorkspaceForCurrentUser,
    initialState,
  );

  return (
    <>
      <form action={formAction} className="mt-8 space-y-4 max-w-md" noValidate>
        <div className="space-y-2">
          <Label htmlFor="workspace_name">Nome da empresa</Label>
          <Input
            id="workspace_name"
            name="workspace_name"
            defaultValue={defaultName}
            required
            placeholder="Acme Corp"
            autoFocus
          />
          {state?.fieldErrors?.workspace_name && (
            <p className="text-xs text-[color:var(--bad)]">
              {state.fieldErrors.workspace_name}
            </p>
          )}
        </div>

        {state?.error && (
          <p className="rounded-md border border-[color:var(--bad)]/30 bg-[color:var(--bad)]/10 px-3 py-2 text-xs text-[color:var(--bad)]">
            {state.error}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Criando workspace..." : "Criar e comecar trial"}
          </Button>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="mr-1 h-4 w-4" /> Sair
            </Button>
          </form>
        </div>
      </form>
    </>
  );
}
