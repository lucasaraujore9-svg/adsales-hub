"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBranding } from "@/lib/actions/branding";

interface Props {
  accentColor: string;
  accentColorLight: string | null;
  logoUrl: string | null;
  logoIconUrl: string | null;
}

export function BrandingForm({ accentColor, accentColorLight, logoUrl, logoIconUrl }: Props) {
  const [pending, start] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    start(async () => {
      const r = await updateBranding(formData);
      if (r.ok) {
        toast.success("Marca atualizada");
        router.refresh();
      } else {
        toast.error(r.error ?? "Erro ao atualizar");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="accent_color">Accent color</Label>
          <div className="mt-1 flex items-center gap-2">
            <Input type="color" name="accent_color" id="accent_color" defaultValue={accentColor} className="h-10 w-16 p-1" />
            <Input type="text" defaultValue={accentColor} name="accent_color_text" className="flex-1 font-mono" placeholder="#FF5E1A" />
          </div>
        </div>
        <div>
          <Label htmlFor="accent_color_light">Accent (light mode) — opcional</Label>
          <div className="mt-1 flex items-center gap-2">
            <Input type="color" name="accent_color_light" id="accent_color_light" defaultValue={accentColorLight ?? accentColor} className="h-10 w-16 p-1" />
            <Input type="text" defaultValue={accentColorLight ?? ""} name="accent_color_light_text" className="flex-1 font-mono" placeholder="#FF5E1A" />
          </div>
        </div>
      </div>
      <div>
        <Label htmlFor="logo_url">Logo (URL) — full</Label>
        <Input name="logo_url" id="logo_url" type="url" defaultValue={logoUrl ?? ""} placeholder="https://..." />
      </div>
      <div>
        <Label htmlFor="logo_icon_url">Logo (URL) — icone</Label>
        <Input name="logo_icon_url" id="logo_icon_url" type="url" defaultValue={logoIconUrl ?? ""} placeholder="https://..." />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar marca"}
      </Button>
      <p className="text-xs text-[color:var(--ink-4)]">
        Upload direto para Supabase Storage sera adicionado no proximo ciclo.
      </p>
    </form>
  );
}
