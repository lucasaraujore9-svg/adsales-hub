"use client";

import { useTransition } from "react";
import { ExternalLink, Globe } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteLandingPage,
  publishLandingPage,
  updateLandingPageSettings,
} from "@/lib/actions/content";

export function LpSettingsForm({
  pageId,
  initialName,
  initialPixelId,
  slug,
  domain,
  published,
}: {
  pageId: string;
  initialName: string;
  initialPixelId: string;
  slug: string;
  domain: string | null;
  published: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const body = {
      id: pageId,
      name: String(form.get("name") ?? ""),
      meta_pixel_id: (form.get("meta_pixel_id") as string) || null,
    };
    start(async () => {
      const result = await updateLandingPageSettings(body);
      if (result.ok) {
        toast.success("Salvo");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handlePublish() {
    start(async () => {
      const result = await publishLandingPage(pageId, !published);
      if (result.ok) {
        toast.success(published ? "Despublicada" : "Publicada");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  function handleDelete() {
    if (!confirm("Excluir a landing page?")) return;
    start(async () => {
      const result = await deleteLandingPage(pageId);
      if (result.ok) {
        toast.success("Excluida");
        router.push("/marketing/landing-pages");
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  const previewUrl = published && domain ? `https://${domain}/${slug}` : null;

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="lps-name">Nome</Label>
        <Input id="lps-name" name="name" defaultValue={initialName} required />
      </div>

      <div>
        <Label htmlFor="lps-pixel">Meta Pixel ID (opcional)</Label>
        <Input
          id="lps-pixel"
          name="meta_pixel_id"
          defaultValue={initialPixelId}
          placeholder="Sobrescreve o pixel global do workspace"
        />
      </div>

      <div className="rounded-card border border-[color:var(--line)] bg-[color:var(--bg-2)] p-3 text-xs">
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-[color:var(--ink-3)]" />
          <span className="font-mono text-[color:var(--ink-2)]">
            {domain ? `${domain}/${slug}` : `(domain pendente)/${slug}`}
          </span>
        </div>
        {!domain && (
          <p className="mt-1 text-[color:var(--ink-4)]">
            Configure dominio em <code className="font-mono">/configuracoes/dominio</code> antes de
            publicar.
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-between gap-2 border-t border-[color:var(--line)] pt-4">
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleDelete} disabled={pending}>
            Excluir
          </Button>
          {previewUrl && (
            <Button asChild variant="outline">
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3.5 w-3.5" /> Abrir publica
              </a>
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={published ? "outline" : "default"}
            onClick={handlePublish}
            disabled={pending}
          >
            {published ? "Despublicar" : "Publicar"}
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
