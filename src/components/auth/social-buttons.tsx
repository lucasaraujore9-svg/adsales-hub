"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { signInWithOAuth } from "@/lib/auth/actions";

export function SocialButtons() {
  const [pending, start] = useTransition();

  return (
    <div className="grid gap-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={() => start(() => signInWithOAuth("google"))}
      >
        Continuar com Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={() => start(() => signInWithOAuth("facebook"))}
      >
        Continuar com Facebook
      </Button>
    </div>
  );
}
