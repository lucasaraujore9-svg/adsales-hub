"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBranding } from "@/lib/actions/branding";
import { BrandingPreview } from "@/components/branding/branding-preview";

interface Props {
  accentColor: string;
  accentColorLight: string | null;
  logoUrl: string | null;
  logoIconUrl: string | null;
  workspaceName?: string | null;
}

/** Calcula contraste WCAG aproximado entre cor e branco. */
function contrastWithWhite(hex: string): number {
  const c = hex.replace("#", "");
  if (c.length !== 6) return 0;
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const lum = (x: number) =>
    x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  const L = 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
  return (1.0 + 0.05) / (L + 0.05);
}

export function BrandingForm({
  accentColor,
  accentColorLight,
  logoUrl,
  logoIconUrl,
  workspaceName,
}: Props) {
  const [pending, start] = useTransition();
  const router = useRouter();

  // Estado local controlado: dispara preview ao vivo
  const [accent, setAccent] = useState(accentColor);
  const [accentLight, setAccentLight] = useState(accentColorLight ?? "");
  const [logoFull, setLogoFull] = useState(logoUrl ?? "");
  const [logoIcon, setLogoIcon] = useState(logoIconUrl ?? "");

  const contrast = contrastWithWhite(accent);
  const contrastWarn = contrast < 4.5;

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

  function reset() {
    setAccent("#FF5E1A");
    setAccentLight("");
    setLogoFull("");
    setLogoIcon("");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="accent_color">Cor de destaque (accent)</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                type="color"
                name="accent_color"
                id="accent_color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="h-10 w-16 p-1"
              />
              <Input
                type="text"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                name="accent_color_text"
                className="flex-1 font-mono"
                placeholder="#FF5E1A"
              />
            </div>
            {contrastWarn && (
              <p className="mt-1 text-xs text-[color:var(--warn)]">
                ⚠ Contraste baixo com texto branco ({contrast.toFixed(1)}:1). WCAG AA exige ≥ 4.5:1.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="accent_color_light">
              Cor para light mode <span className="text-[color:var(--ink-4)]">(opcional)</span>
            </Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                type="color"
                name="accent_color_light"
                id="accent_color_light"
                value={accentLight || accent}
                onChange={(e) => setAccentLight(e.target.value)}
                className="h-10 w-16 p-1"
              />
              <Input
                type="text"
                value={accentLight}
                onChange={(e) => setAccentLight(e.target.value)}
                name="accent_color_light_text"
                className="flex-1 font-mono"
                placeholder="(deixe vazio para usar o mesmo accent)"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="logo_url">Logo completo (URL)</Label>
          <Input
            name="logo_url"
            id="logo_url"
            type="url"
            value={logoFull}
            onChange={(e) => setLogoFull(e.target.value)}
            placeholder="https://..."
          />
          <p className="mt-1 text-xs text-[color:var(--ink-4)]">
            Usado em emails, PDFs e header de relatórios. Dimensão ideal: 240×80 px.
          </p>
        </div>

        <div>
          <Label htmlFor="logo_icon_url">Ícone do logo (URL)</Label>
          <Input
            name="logo_icon_url"
            id="logo_icon_url"
            type="url"
            value={logoIcon}
            onChange={(e) => setLogoIcon(e.target.value)}
            placeholder="https://..."
          />
          <p className="mt-1 text-xs text-[color:var(--ink-4)]">
            Usado no sidebar e favicon. Quadrado, ≥ 64×64 px.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar marca"}
          </Button>
          <Button type="button" variant="outline" onClick={reset} disabled={pending}>
            Resetar para padrão
          </Button>
        </div>
        <p className="text-xs text-[color:var(--ink-4)]">
          Upload direto para Supabase Storage será adicionado no próximo ciclo. Por ora, hospede
          em um CDN público (ex: ImgBB, Cloudinary) e cole a URL.
        </p>
      </form>

      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-kicker text-[color:var(--ink-4)]">
          Preview ao vivo
        </p>
        <BrandingPreview
          accentColor={accent}
          logoUrl={logoIcon || logoFull || null}
          brandName={workspaceName ?? null}
        />
      </div>
    </div>
  );
}
