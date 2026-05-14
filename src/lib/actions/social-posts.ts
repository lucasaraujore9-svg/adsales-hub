"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { serverEnv } from "@/lib/env";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const PLATFORMS = ["instagram", "facebook", "linkedin", "tiktok", "youtube", "pinterest"] as const;
type PlatformKey = (typeof PLATFORMS)[number];

const postSchema = z.object({
  content_text: z.string().min(2).max(3000),
  hashtags: z.array(z.string()).default([]),
  platforms: z.array(z.enum(PLATFORMS)).min(1),
  scheduled_at: z.string().optional().nullable(),
  first_comment: z.string().optional().nullable(),
});

export async function createSocialPost(input: unknown): Promise<
  ActionResult<{ id: string }>
> {
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();

  const status = parsed.data.scheduled_at ? "scheduled" : "draft";
  const body = {
    workspace_id: session.workspaceId,
    created_by_user_id: session.user.id,
    content_text: parsed.data.content_text,
    hashtags: parsed.data.hashtags,
    platforms: parsed.data.platforms,
    media_urls: [],
    status,
    scheduled_at: parsed.data.scheduled_at ?? null,
    first_comment: parsed.data.first_comment ?? null,
  };

  const { data, error } = await session.supabase
    .from("social_posts")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/social");
  revalidatePath("/social/calendario");
  revalidatePath("/social/posts");
  return { ok: true, data: data as { id: string } };
}

export async function deleteSocialPost(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("social_posts")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/social");
  return { ok: true };
}

export async function setSocialPostStatus(
  id: string,
  status: "draft" | "pending_approval" | "approved" | "rejected" | "scheduled",
): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("social_posts")
    .update({ status } as never)
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/social");
  return { ok: true };
}

const briefSchema = z.object({
  topic: z.string().min(3).max(500),
  objective: z.string().min(2).max(200),
  brand_voice: z.string().max(500).optional().nullable(),
  platforms: z.array(z.enum(PLATFORMS)).min(1),
});

const imageBriefSchema = z.object({
  prompt: z.string().min(3).max(1000),
  aspect_ratio: z.enum(["1:1", "4:5", "9:16", "16:9"]).default("1:1"),
});

export interface AiSocialDraft {
  content_text: string;
  hashtags: string[];
  first_comment: string | null;
  best_times: { platform: string; day: string; hour: number }[];
  source: "ai" | "stub";
}

function stubDraft(brief: z.infer<typeof briefSchema>): AiSocialDraft {
  return {
    content_text: `${brief.topic}\n\nObjetivo: ${brief.objective}.\n\nConfigure ANTHROPIC_API_KEY no servidor para gerar conteudo real com IA. Edite este rascunho antes de agendar.`,
    hashtags: ["marketing", "vendas", "saas", "crm", "trafegopago"],
    first_comment: brief.platforms.includes("instagram")
      ? `Hashtags adicionais para alcance: #marketingdigital #adsalesehub`
      : null,
    best_times: brief.platforms.map((p) => ({ platform: p, day: "tue", hour: 11 })),
    source: "stub",
  };
}

export async function generateSocialPostWithAI(
  input: unknown,
): Promise<ActionResult<AiSocialDraft>> {
  const parsed = briefSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();

  if (!serverEnv().ANTHROPIC_API_KEY) {
    return { ok: true, data: stubDraft(parsed.data) };
  }

  try {
    const { suggestSocialContent } = await import("@/lib/ai");
    const result = await suggestSocialContent(
      {
        topic: parsed.data.topic,
        objective: parsed.data.objective,
        brand_voice: parsed.data.brand_voice ?? undefined,
        platforms: parsed.data.platforms,
      },
      { workspaceId: session.workspaceId },
    );

    const wantedPlatforms = new Set<PlatformKey>(parsed.data.platforms);
    const matched = result.captions.filter((c) =>
      wantedPlatforms.has(c.platform as PlatformKey),
    );
    const primary = (matched[0] ?? result.captions[0])?.text ?? parsed.data.topic;
    const hashtags = (result.hashtags ?? []).map((h) => h.replace(/^#/, "").trim()).filter(Boolean);

    return {
      ok: true,
      data: {
        content_text: primary,
        hashtags,
        first_comment: result.first_comment ?? null,
        best_times: result.best_times ?? [],
        source: "ai",
      },
    };
  } catch (err) {
    console.error("[ai/social] falha", err);
    return { ok: true, data: stubDraft(parsed.data) };
  }
}

export interface AiImageResult {
  url: string;
  prompt: string;
  width?: number;
  height?: number;
  aspect_ratio: string;
  charged: number;
  balance: number;
  unlimited?: boolean;
}

export type ImageActionError =
  | "insufficient_credits"
  | "generation_failed"
  | "invalid_input";

export interface ImageActionFailure {
  ok: false;
  error: string;
  reason: ImageActionError;
  required?: number;
  balance?: number;
}

export async function generateSocialImage(
  input: unknown,
): Promise<{ ok: true; data: AiImageResult } | ImageActionFailure> {
  const parsed = imageBriefSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.message, reason: "invalid_input" };
  }
  const session = await getSession();

  const { consumeCredits, refundCredits } = await import("@/lib/billing/credits");
  const charge = await consumeCredits({
    workspaceId: session.workspaceId,
    kind: "image",
    referenceType: "social_post_image",
    meta: {
      prompt: parsed.data.prompt,
      aspect_ratio: parsed.data.aspect_ratio,
    },
  });

  if (!charge.ok) {
    if (charge.error === "insufficient_credits") {
      return {
        ok: false,
        error: `Voce não tem creditos suficientes. Necessario: ${charge.required ?? 0}, disponível: ${charge.balance ?? 0}.`,
        reason: "insufficient_credits",
        required: charge.required,
        balance: charge.balance,
      };
    }
    return {
      ok: false,
      error: "Servico de imagens indisponivel.",
      reason: "generation_failed",
    };
  }

  try {
    const { generateImage } = await import("@/lib/ai-creative");
    const result = await generateImage({
      prompt: parsed.data.prompt,
      aspectRatio: parsed.data.aspect_ratio,
    });

    let finalUrl = result.url;
    if (result.url && result.provider !== "stub") {
      try {
        const { persistMedia } = await import("@/lib/storage/media");
        const persisted = await persistMedia({
          sourceUrl: result.url,
          workspaceId: session.workspaceId,
          kind: "image",
        });
        finalUrl = persisted.publicUrl;
      } catch (err) {
        console.error("[ai/image] persistMedia falhou, usando URL do provider", err);
      }
    }

    return {
      ok: true,
      data: {
        url: finalUrl,
        prompt: parsed.data.prompt,
        width: result.width,
        height: result.height,
        aspect_ratio: parsed.data.aspect_ratio,
        charged: charge.charged,
        balance: charge.balance,
        unlimited: charge.unlimited === true,
      },
    };
  } catch (err) {
    console.error("[ai/image] falha — refundando", err);
    await refundCredits(charge.transaction_id, "provider_failed");
    return {
      ok: false,
      error: "Nao foi possível gerar a imagem agora. Os creditos foram devolvidos.",
      reason: "generation_failed",
    };
  }
}

export interface CreditsState {
  balance: number;
  monthlyAllowanceRemaining: number;
  monthlyAllowance: number;
  imageCost: number;
  videoCost: number;
}

export async function getCreditsState(): Promise<CreditsState> {
  const session = await getSession();
  const { getCreditBalance, getCreditCost } = await import("@/lib/billing/credits");
  const [balance, imageCost, videoCost] = await Promise.all([
    getCreditBalance(session.workspaceId),
    getCreditCost("image"),
    getCreditCost("video"),
  ]);
  return {
    balance: balance.balance,
    monthlyAllowanceRemaining: balance.monthlyAllowanceRemaining,
    monthlyAllowance: balance.monthlyAllowance,
    imageCost: imageCost ?? 10,
    videoCost: videoCost ?? 100,
  };
}

const createWithMediaSchema = postSchema.extend({
  media_urls: z
    .array(
      z.object({
        url: z.string().url(),
        type: z.enum(["image", "video"]).default("image"),
        provider: z.string().optional(),
        prompt: z.string().optional(),
      }),
    )
    .default([]),
});

export async function createSocialPostWithMedia(input: unknown): Promise<
  ActionResult<{ id: string }>
> {
  const parsed = createWithMediaSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();

  const status = parsed.data.scheduled_at ? "scheduled" : "draft";
  const body = {
    workspace_id: session.workspaceId,
    created_by_user_id: session.user.id,
    content_text: parsed.data.content_text,
    hashtags: parsed.data.hashtags,
    platforms: parsed.data.platforms,
    media_urls: parsed.data.media_urls,
    status,
    scheduled_at: parsed.data.scheduled_at ?? null,
    first_comment: parsed.data.first_comment ?? null,
  };

  const { data, error } = await session.supabase
    .from("social_posts")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/social");
  revalidatePath("/social/calendario");
  revalidatePath("/social/posts");
  return { ok: true, data: data as { id: string } };
}
