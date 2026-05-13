"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import {
  buildSocialAdPrompt,
  FORMAT_TO_ASPECT,
} from "@/lib/ai-creative/prompt-builder";

const schema = z.object({
  name: z.string().min(2),
  type: z.enum(["image", "video"]),
  format: z.enum(["1x1", "9x16", "16x9", "4x5"]),
  quality: z.enum(["fast", "premium"]).default("fast"),
  theme: z.string().min(5),
  highlight: z.string().min(5),
  background: z.string().optional().default(""),
  style: z.string().min(1),
  mood: z.string().min(1),
  lighting: z.string().min(1),
  palette: z.string().optional().default(""),
  paletteCustom: z.string().optional().default(""),
  composition: z.string().optional().default(""),
  headline: z.string().optional().default(""),
  subheadline: z.string().optional().default(""),
  textPosition: z.string().optional().default("none"),
  textRenderer: z.enum(["overlay", "model"]).default("overlay"),
  avoid: z.string().optional().default(""),
});

function f(formData: FormData, key: string, fallback = ""): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : fallback;
}

export async function generateCreative(formData: FormData): Promise<void> {
  const input = {
    name: f(formData, "name"),
    type: f(formData, "type", "image") as "image" | "video",
    format: f(formData, "format", "1x1") as "1x1" | "9x16" | "16x9" | "4x5",
    quality: f(formData, "quality", "fast") as "fast" | "premium",
    theme: f(formData, "theme"),
    highlight: f(formData, "highlight"),
    background: f(formData, "background"),
    style: f(formData, "style", "editorial-photo"),
    mood: f(formData, "mood", "premium"),
    lighting: f(formData, "lighting", "soft-diffused"),
    palette: f(formData, "palette", "brand-orange"),
    paletteCustom: f(formData, "paletteCustom"),
    composition: f(formData, "composition"),
    headline: f(formData, "headline"),
    subheadline: f(formData, "subheadline"),
    textPosition: f(formData, "textPosition", "none"),
    textRenderer: f(formData, "textRenderer", "overlay") as "overlay" | "model",
    avoid: f(formData, "avoid"),
  };
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    redirect("/campanhas/criativos/gerar?status=error");
  }

  const aspectRatio = FORMAT_TO_ASPECT[parsed.data.format] ?? "1:1";
  // Model-rendered text only makes sense on premium (FLUX 2). Schnell can't
  // render readable text — silently downgrade so the user gets a usable result.
  const effectiveRenderer: "overlay" | "model" =
    parsed.data.textRenderer === "model" && parsed.data.quality === "premium"
      ? "model"
      : "overlay";
  const renderedPrompt = buildSocialAdPrompt({
    theme: parsed.data.theme,
    highlight: parsed.data.highlight,
    background: parsed.data.background,
    style: parsed.data.style,
    mood: parsed.data.mood,
    lighting: parsed.data.lighting,
    palette: parsed.data.palette,
    paletteCustom: parsed.data.paletteCustom,
    composition: parsed.data.composition,
    headline: parsed.data.headline,
    subheadline: parsed.data.subheadline,
    textPosition: parsed.data.textPosition,
    textRenderer: effectiveRenderer,
    avoid: parsed.data.avoid,
    aspectRatio,
    type: parsed.data.type,
  });

  const session = await getSession();
  const { consumeCredits, refundCredits } = await import("@/lib/billing/credits");

  const isPremium = parsed.data.quality === "premium";
  const creditKind: "image" | "image_premium" | "video" | "video_premium" =
    parsed.data.type === "image"
      ? isPremium
        ? "image_premium"
        : "image"
      : isPremium
        ? "video_premium"
        : "video";

  const charge = await consumeCredits({
    workspaceId: session.workspaceId,
    kind: creditKind,
    referenceType: "ad_creative",
    meta: {
      name: parsed.data.name,
      format: parsed.data.format,
      quality: parsed.data.quality,
      theme: parsed.data.theme.slice(0, 200),
      style: parsed.data.style,
    },
  });

  if (!charge.ok) {
    if (charge.error === "insufficient_credits") {
      redirect(
        `/campanhas/criativos/gerar?status=insufficient&required=${charge.required ?? 0}&balance=${charge.balance ?? 0}`,
      );
    }
    redirect("/campanhas/criativos/gerar?status=error");
  }

  let fileUrl: string | null = null;
  let provider: "image_model" | "image_model_fallback" | "video_generator" | "template" =
    "template";

  try {
    if (parsed.data.type === "image") {
      const { generateImage } = await import("@/lib/ai-creative");
      const result = await generateImage({
        prompt: renderedPrompt,
        aspectRatio,
        quality: parsed.data.quality,
      });
      provider = result.provider === "stub" ? "template" : "image_model";
      // Persist provider URL into Supabase Storage so we don't depend on
      // short-lived hosted URLs (Together.ai expires its CDN links).
      // If the brief includes a headline, composite the typography overlay
      // before uploading — diffusion models can't render text reliably.
      if (result.url && result.provider !== "stub") {
        try {
          const { persistMedia } = await import("@/lib/storage/media");
          let sourceForStorage = result.url;
          const wantsOverlay =
            Boolean(parsed.data.headline?.trim()) && effectiveRenderer === "overlay";

          if (wantsOverlay) {
            try {
              const res = await fetch(result.url);
              if (!res.ok) throw new Error(`download ${res.status}`);
              const ab = await res.arrayBuffer();
              const { compositeTextOverlay } = await import(
                "@/lib/ai-creative/text-overlay"
              );
              const composited = await compositeTextOverlay({
                imageBuffer: Buffer.from(ab),
                headline: parsed.data.headline,
                subheadline: parsed.data.subheadline || undefined,
                position:
                  (parsed.data.textPosition as
                    | "top"
                    | "bottom"
                    | "center"
                    | "left"
                    | "right"
                    | "none") || "bottom",
                palette: parsed.data.palette,
              });
              sourceForStorage = `data:image/png;base64,${composited.toString("base64")}`;
            } catch (overlayErr) {
              console.error(
                "[creatives] text overlay falhou, salvando imagem sem texto",
                overlayErr,
              );
              // fall back to the raw provider URL
            }
          }

          const persisted = await persistMedia({
            sourceUrl: sourceForStorage,
            workspaceId: session.workspaceId,
            kind: "image",
          });
          fileUrl = persisted.publicUrl;
        } catch (err) {
          console.error("[creatives] persistMedia falhou, usando URL do provider", err);
          fileUrl = result.url;
        }
      } else {
        fileUrl = result.url;
      }
    } else {
      const { generateVideo } = await import("@/lib/ai-creative");
      const videoAspect =
        parsed.data.format === "9x16"
          ? "9:16"
          : parsed.data.format === "16x9"
            ? "16:9"
            : "1:1";
      const result = await generateVideo({
        prompt: renderedPrompt,
        aspectRatio: videoAspect,
      });
      provider = result.provider === "stub" ? "template" : "video_generator";
      if (result.url && result.provider !== "stub") {
        try {
          const { persistMedia } = await import("@/lib/storage/media");
          const persisted = await persistMedia({
            sourceUrl: result.url,
            workspaceId: session.workspaceId,
            kind: "video",
          });
          fileUrl = persisted.publicUrl;
        } catch (err) {
          console.error("[creatives] persistMedia (video) falhou", err);
          fileUrl = result.url;
        }
      } else {
        fileUrl = result.url;
      }
    }
  } catch (err) {
    console.error("[creatives] generation failed", err);
    await refundCredits(charge.transaction_id, "provider_failed");
    redirect("/campanhas/criativos/gerar?status=error");
  }

  if (!fileUrl) {
    await refundCredits(charge.transaction_id, "no_output");
    redirect(`/campanhas/criativos/gerar?status=queued&type=${parsed.data.type}`);
  }

  const { data, error } = await session.supabase
    .from("ai_creatives")
    .insert({
      workspace_id: session.workspaceId,
      created_by_user_id: session.user.id,
      type: parsed.data.type,
      prompt: renderedPrompt,
      provider,
      file_url: fileUrl,
      format: parsed.data.format,
      status: "ready",
      metadata: {
        name: parsed.data.name,
        brief: {
          quality: parsed.data.quality,
          theme: parsed.data.theme,
          highlight: parsed.data.highlight,
          background: parsed.data.background,
          style: parsed.data.style,
          mood: parsed.data.mood,
          lighting: parsed.data.lighting,
          palette: parsed.data.palette,
          paletteCustom: parsed.data.paletteCustom,
          composition: parsed.data.composition,
          headline: parsed.data.headline,
          subheadline: parsed.data.subheadline,
          textPosition: parsed.data.textPosition,
          textRenderer: effectiveRenderer,
          avoid: parsed.data.avoid,
        },
        rendered_prompt: renderedPrompt,
        credits_charged: charge.charged,
        credits_unlimited: charge.unlimited === true,
      },
    } as never)
    .select("id")
    .single();
  if (error) {
    await refundCredits(charge.transaction_id, "db_insert_failed");
    redirect("/campanhas/criativos/gerar?status=error");
  }

  const id = (data as unknown as { id: string })?.id;
  revalidatePath("/campanhas/criativos");
  redirect(
    `/campanhas/criativos/gerar?status=ok&id=${id ?? ""}&charged=${charge.charged}`,
  );
}
