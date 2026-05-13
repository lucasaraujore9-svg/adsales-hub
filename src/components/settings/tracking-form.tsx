"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkspaceSettings } from "@/lib/actions/workspace";

export function TrackingForm({
  initialMetaPixel,
  initialGa4,
  initialGtm,
}: {
  initialMetaPixel: string;
  initialGa4: string;
  initialGtm: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleSubmit(form: FormData) {
    const patch = {
      tracking_meta_pixel_id: String(form.get("meta_pixel") ?? "").trim() || null,
      tracking_ga4_measurement_id: String(form.get("ga4") ?? "").trim() || null,
      tracking_gtm_container_id: String(form.get("gtm") ?? "").trim() || null,
    };
    start(async () => {
      const result = await updateWorkspaceSettings(patch);
      if (result.ok) {
        toast.success("Configuracao salva");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="meta_pixel">Meta Pixel ID</Label>
        <Input
          id="meta_pixel"
          name="meta_pixel"
          defaultValue={initialMetaPixel}
          placeholder="1234567890123456"
        />
        <p className="mt-1 text-[10px] text-[color:var(--ink-4)]">
          Encontre em Business Manager → Eventos → Pixels. Sera carregado automaticamente nas
          landing pages e usado em Conversions API server-side.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="ga4">GA4 Measurement ID</Label>
          <Input
            id="ga4"
            name="ga4"
            defaultValue={initialGa4}
            placeholder="G-XXXXXXXXXX"
          />
        </div>
        <div>
          <Label htmlFor="gtm">GTM Container ID</Label>
          <Input
            id="gtm"
            name="gtm"
            defaultValue={initialGtm}
            placeholder="GTM-XXXXXX"
          />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar configuracao"}
      </Button>
    </form>
  );
}
