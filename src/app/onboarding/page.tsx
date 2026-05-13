import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";

export const metadata = { title: "Onboarding · AdSales Hub" };

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → send to login (proxy may have already done this)
  if (!user) {
    redirect("/login?next=/onboarding");
  }

  // Already has a workspace? The proxy now redirects away from /onboarding
  // for users with workspace — this is a belt-and-suspenders guard in case
  // someone hits this route via a route handler.
  const { data: rawProfile } = await supabase
    .from("users")
    .select("workspace_id")
    .eq("id", user.id)
    .maybeSingle();
  const profile = rawProfile as { workspace_id: string | null } | null;

  if (profile?.workspace_id) {
    redirect("/dashboard");
  }

  const defaultName =
    (user.user_metadata?.workspace_name as string | undefined) ??
    (user.user_metadata?.company as string | undefined) ??
    "";

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--ink)]">
      <header className="border-b border-[color:var(--line)] px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded-md bg-[color:var(--accent)]" />
            <span className="text-sm font-medium">AdSales Hub</span>
          </Link>
          <span className="text-xs text-[color:var(--ink-3)]">{user.email}</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col px-6 py-16">
        <span className="kicker">Onboarding</span>
        <h1 className="mt-4 text-4xl font-medium tracking-tighter2">
          Vamos montar seu workspace
        </h1>
        <p className="mt-4 max-w-xl text-[color:var(--ink-3)]">
          Sua conta esta ativa, mas ainda nao pertence a nenhuma empresa.
          Cria um workspace agora para comecar o trial de 14 dias — voce entra
          como <strong>admin</strong> e pode convidar sua equipe depois.
        </p>

        <OnboardingForm defaultName={defaultName} />

        <div className="mt-12 rounded-card border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
          <h2 className="text-sm font-medium">Foi convidado por alguem?</h2>
          <p className="mt-1 text-xs text-[color:var(--ink-3)]">
            Se voce deveria entrar em um workspace existente, o link correto
            veio no email de convite. Abra o email mais recente do seu admin, ou
            peca para ele reenviar via <strong>Configuracoes {'>'} Usuarios {'>'} Novo convite</strong>.
          </p>
        </div>
      </main>
    </div>
  );
}
