import "server-only";

const TOGETHER_BASE = "https://api.together.ai/v1";

export interface TogetherImageOptions {
  prompt: string;
  width: number;
  height: number;
  steps?: number;
  model?: string;
  apiKey: string;
}

interface TogetherImageResponse {
  data?: {
    url?: string;
    b64_json?: string;
  }[];
  model?: string;
  error?: { message?: string } | string;
}

const DEFAULT_MODEL = "black-forest-labs/FLUX.1-schnell";

/**
 * Together.ai image generation.
 *
 * Docs: https://docs.together.ai/reference/post_images-generations
 *
 * - FLUX.1-schnell is fast (4 steps) and ~$0.0027/image on paid tier; the
 *   `-Free` variant is rate-limited but free, fine for dev/test.
 * - Returns a hosted URL by default; we capture both url and b64 so callers
 *   can persist the image to Supabase Storage if needed.
 */
export async function generateImageTogether(
  opts: TogetherImageOptions,
): Promise<{ url: string; model?: string }> {
  const model = opts.model ?? DEFAULT_MODEL;

  // Only force `steps` for schnell — other FLUX models (dev, pro, FLUX.2)
  // have their own optimal step counts and prefer the provider default.
  const body: Record<string, unknown> = {
    model,
    prompt: opts.prompt,
    width: opts.width,
    height: opts.height,
    n: 1,
    response_format: "url",
  };
  if (opts.steps !== undefined) body.steps = opts.steps;

  const res = await fetch(`${TOGETHER_BASE}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Together.ai HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as TogetherImageResponse;
  const first = json.data?.[0];
  if (!first?.url && !first?.b64_json) {
    const msg =
      typeof json.error === "string"
        ? json.error
        : json.error?.message ?? "Resposta sem imagem";
    throw new Error(`Together.ai: ${msg}`);
  }
  const url = first.url ?? `data:image/png;base64,${first.b64_json}`;
  return { url, model: json.model ?? model };
}
