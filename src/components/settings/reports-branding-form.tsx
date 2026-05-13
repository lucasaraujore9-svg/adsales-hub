"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkspaceSettings } from "@/lib/actions/workspace";

export function ReportsBrandingForm({
  initialLogoUrl,
  initialAccent,
  initialFooter,
  initialContactEmail,
}: {
  initialLogoUrl: string;
  initialAccent: string;
  initialFooter: string;
  initialContactEmail: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const patch = {
      reports_logo_url: String(form.get("logo_url") ?? "").trim() || null,
      reports_accent_color: String(form.get("accent") ?? "").trim() || null,
      reports_footer: String(form.get("footer") ?? "").trim() || null,
      reports_contact_email: String(form.get("contact_email") ?? "").trim() || null,
    };
    start(async () => {
      const result = await updateWorkspaceSettings(patch);
      if (result.ok) {
        toast.success("Branding salvo");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="logo_url">Logo URL (PNG/SVG, fundo transparente)</Label>
          <Input
            id="logo_url"
            name="logo_url"
            type="url"
            defaultValue={initialLogoUrl}
            placeholder="https://cdn.minhaempresa.com/logo.png"
          />
        </div>
        <div>
          <Label htmlFor="accent">Accent color (hex)</Label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="color"
              defaultValue={initialAccent || "#FF5E1A"}
              onChange={(e) => {
                const txt = document.getElementById("accent") as HTMLInputElement | null;
                if (txt) txt.value = e.target.value;
              }}
              className="h-9 w-12 cursor-pointer rounded-md border border-[color:var(--line-2)] bg-[color:var(--bg)]"
            />
            <Input
              id="accent"
              name="accent"
              defaultValue={initialAccent}
              placeholder="#FF5E1A"
              className="font-mono"
            />
          </div>
        </div>
      </div>
      <div>
        <Label htmlFor="contact_email">Email de contato no rodape</Label>
        <Input
          id="contact_email"
          name="contact_email"
          type="email"
          defaultValue={initialContactEmail}
          placeholder="contato@minhaempresa.com.br"
        />
      </div>
      <div>
        <Label htmlFor="footer">Texto do rodape (curto)</Label>
        <Input
          id="footer"
          name="footer"
          defaultValue={initialFooter}
          placeholder="Minha Empresa Marketing · CNPJ 00.000.000/0001-00"
          maxLength={150}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar branding"}
      </Button>
    </form>
  );
}
