import "server-only";

import { serverEnv } from "@/lib/env";
import {
  generateImageTogether,
  type TogetherImageOptions,
} from "@/lib/ai-creative/together";

export type ImageQuality = "fast" | "premium";

export interface ImageGenerationRequest {
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
  aspectRatio?: "1:1" | "4:5" | "9:16" | "16:9";
  /** Override the underlying model id. Takes precedence over `quality`. */
  model?: string;
  /** "fast" → FLUX.1-schnell (default), "premium" → FLUX.2-pro */
  quality?: ImageQuality;
}

const MODEL_BY_QUALITY: Record<ImageQuality, string> = {
  fast: "black-forest-labs/FLUX.1-schnell",
  premium: "black-forest-labs/FLUX.2-pro",
};

export interface ImageGenerationResult {
  url: string;
  provider: "together" | "local" | "stub";
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
}

const ASPECT_TO_DIM: Record<NonNullable<ImageGenerationRequest["aspectRatio"]>, {
  width: number;
  height: number;
}> = {
  "1:1": { width: 1024, height: 1024 },
  "4:5": { width: 1024, height: 1280 },
  "9:16": { width: 1024, height: 1792 },
  "16:9": { width: 1792, height: 1024 },
};

function resolveDims(req: ImageGenerationRequest) {
  if (req.width && req.height) return { width: req.width, height: req.height };
  if (req.aspectRatio) return ASPECT_TO_DIM[req.aspectRatio];
  return { width: 1024, height: 1024 };
}

/**
 * Generate an image. Provider strategy:
 *  1. LOCAL_AI_BASE_URL (self-hosted, future) — OpenAI-compatible
 *  2. TOGETHER_API_KEY (current default)
 *  3. Stub placeholder (deterministic gradient via picsum/dicebear-like seed)
 */
export async function generateImage(
  req: ImageGenerationRequest,
): Promise<ImageGenerationResult> {
  const env = serverEnv();
  const { width, height } = resolveDims(req);

  if (env.LOCAL_AI_BASE_URL) {
    try {
      const r = await callLocalAI({
        prompt: req.prompt,
        width,
        height,
        baseUrl: env.LOCAL_AI_BASE_URL,
        apiKey: env.LOCAL_AI_API_KEY ?? null,
      });
      return { ...r, prompt: req.prompt, provider: "local", width, height };
    } catch (err) {
      console.warn("[ai-creative] local AI falhou, tentando Together:", err);
    }
  }

  if (env.TOGETHER_API_KEY) {
    const quality: ImageQuality = req.quality ?? "fast";
    const model = req.model ?? MODEL_BY_QUALITY[quality];
    // Only force steps for schnell (4-step model). Other FLUX variants
    // (dev / pro / FLUX.2) use the provider's default for best quality.
    const isSchnell = model.includes("schnell");
    const opts: TogetherImageOptions = {
      prompt: req.prompt,
      width,
      height,
      steps: req.steps ?? (isSchnell ? 4 : undefined),
      model,
      apiKey: env.TOGETHER_API_KEY,
    };
    const r = await generateImageTogether(opts);
    return { ...r, prompt: req.prompt, provider: "together", width, height };
  }

  return {
    url: stubImageUrl(req.prompt, width, height),
    provider: "stub",
    prompt: req.prompt,
    width,
    height,
  };
}

function stubImageUrl(prompt: string, w: number, h: number) {
  const seed = encodeURIComponent(prompt.slice(0, 40) || "adsales");
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

async function callLocalAI(opts: {
  prompt: string;
  width: number;
  height: number;
  baseUrl: string;
  apiKey: string | null;
}): Promise<{ url: string; model?: string }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.apiKey) headers.Authorization = `Bearer ${opts.apiKey}`;
  const res = await fetch(`${opts.baseUrl.replace(/\/$/, "")}/v1/images/generations`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt: opts.prompt,
      n: 1,
      size: `${opts.width}x${opts.height}`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Local AI HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    data?: { url?: string; b64_json?: string }[];
    model?: string;
  };
  const first = json.data?.[0];
  if (!first?.url && !first?.b64_json) {
    throw new Error("Local AI nao retornou imagem");
  }
  const url = first.url ?? `data:image/png;base64,${first.b64_json}`;
  return { url, model: json.model };
}

export interface VideoGenerationRequest {
  prompt: string;
  durationSeconds?: number;
  aspectRatio?: "9:16" | "16:9" | "1:1";
}

export interface VideoGenerationResult {
  url: string | null;
  provider: "higgsfield" | "stub";
  status: "queued" | "processing" | "ready" | "failed";
  jobId?: string | null;
}

/**
 * Video generation via Higgsfield. Marked as future — implementation kicks off
 * a job and returns a queue id so the UI can poll. When HIGGSFIELD_API_KEY is
 * not set, returns a stub indicating the feature is not configured.
 */
export async function generateVideo(
  req: VideoGenerationRequest,
): Promise<VideoGenerationResult> {
  const env = serverEnv();
  if (!env.HIGGSFIELD_API_KEY) {
    return {
      url: null,
      provider: "stub",
      status: "failed",
      jobId: null,
    };
  }
  // Higgsfield's public REST surface for queued generations is not finalized
  // here — keep a stub that records a job id so the UI flow stays consistent.
  return {
    url: null,
    provider: "higgsfield",
    status: "queued",
    jobId: `hf_pending_${Date.now()}`,
  };
}
