import { PageHeader } from "@/components/shared/page-header";
import { WidgetCard } from "@/components/shared/widget-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/guards";
import { updateProfile, changePassword, signOut } from "@/lib/actions/profile";

export const metadata = { title: "Meu perfil · AdSales Hub" };

export default async function ProfilePage() {
  const session = await getSession();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1 text-xs text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
      >
        <ArrowLeft className="h-3 w-3" /> Configuracoes
      </Link>

      <PageHeader
        kicker="Conta"
        title="Meu perfil"
        description="Nome, email, senha e preferencias pessoais."
      />

      <div className="space-y-4">
        <WidgetCard kicker="Pessoal" title="Dados basicos">
          <form action={updateProfile} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input name="name" id="name" defaultValue={session.profile.name ?? ""} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input name="email" id="email" type="email" defaultValue={session.profile.email} disabled />
              </div>
            </div>
            <div>
              <Label htmlFor="avatar_url">URL do avatar</Label>
              <Input name="avatar_url" id="avatar_url" type="url" defaultValue={session.profile.avatar_url ?? ""} />
            </div>
            <Button type="submit">Salvar alteracoes</Button>
          </form>
        </WidgetCard>

        <WidgetCard kicker="Seguranca" title="Trocar senha">
          <form action={changePassword} className="space-y-3">
            <div>
              <Label htmlFor="new_password">Nova senha</Label>
              <Input name="new_password" id="new_password" type="password" minLength={8} required />
            </div>
            <Button type="submit" variant="outline">Trocar senha</Button>
          </form>
        </WidgetCard>

        <WidgetCard kicker="Sessao" title="Encerrar sessao">
          <p className="mb-3 text-sm text-[color:var(--ink-3)]">Voce sera desconectado deste dispositivo.</p>
          <form action={signOut}>
            <Button type="submit" variant="outline">Sair</Button>
          </form>
        </WidgetCard>
      </div>
    </div>
  );
}
