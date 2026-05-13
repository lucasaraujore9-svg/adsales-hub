"use client";

import { useTransition } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { duplicateLandingPage } from "@/lib/actions/content";

export function LandingCardActions({
  landingId,
  previewUrl,
}: {
  landingId: string;
  previewUrl: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleDuplicate() {
    start(async () => {
      const result = await duplicateLandingPage(landingId);
      if (result.ok) {
        toast.success("Landing duplicada");
        router.refresh();
      } else {
        toast.error(result.error ?? "Erro ao duplicar");
      }
    });
  }

  return (
    <div className="mt-3 flex gap-1.5">
      {previewUrl ? (
        <Button asChild variant="outline" size="sm">
          <a href={previewUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1 h-3 w-3" /> Preview
          </a>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ExternalLink className="mr-1 h-3 w-3" /> Preview
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={pending}>
        <Copy className="mr-1 h-3 w-3" /> {pending ? "..." : "Duplicar"}
      </Button>
    </div>
  );
}
