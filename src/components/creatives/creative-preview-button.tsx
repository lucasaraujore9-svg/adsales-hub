"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreativePreview } from "@/components/creatives/creative-preview";

interface Props {
  imageUrl: string;
  name: string;
  headline?: string | null;
  bodyText?: string | null;
  cta?: string | null;
}

/**
 * Botão "Ver em mockups" que abre Dialog com previews em IG Feed, Stories e FB Feed.
 */
export function CreativePreviewButton({
  imageUrl,
  name,
  headline,
  bodyText,
  cta,
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full border border-[color:var(--line-2)] px-2.5 py-1 text-xs text-[color:var(--ink-3)] hover:bg-[color:var(--bg-2)]"
      >
        <Eye className="h-3 w-3" /> Ver em mockups
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{name}</DialogTitle>
            <DialogDescription>
              Como este criativo aparece em cada formato. Validar antes de publicar.
            </DialogDescription>
          </DialogHeader>
          <CreativePreview
            imageUrl={imageUrl}
            headline={headline ?? null}
            bodyText={bodyText ?? null}
            cta={cta ?? null}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
