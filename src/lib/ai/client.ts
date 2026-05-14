import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import { requireServerEnv } from "@/lib/env";
import { extractJson } from "@/lib/ai/validate";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (_client) return _client;
  _client = new Anthropic({ apiKey: requireServerEnv("ANTHROPIC_API_KEY") });
  return _client;
}

export const DEFAULT_MODEL = "claude-sonnet-4-6";
export const REASONING_MODEL = "claude-opus-4-7";
export const FAST_MODEL = "claude-haiku-4-5-20251001";

interface GenerateParams {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  stopSequences?: string[];
}

const RETRY_ERRORS = new Set([429, 529, 502, 503, 504]);

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      if (!status || !RETRY_ERRORS.has(status) || attempt === retries) {
        throw err;
      }
      const waitMs = 400 * 2 ** attempt + Math.random() * 200;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
  throw lastError;
}

export async function generate(params: GenerateParams): Promise<string> {
  const anthropic = getAnthropic();
  return withRetry(async () => {
    const response = await anthropic.messages.create({
      model: params.model ?? DEFAULT_MODEL,
      max_tokens: params.maxTokens ?? 2048,
      temperature: params.temperature ?? 0.6,
      system: params.systemPrompt,
      stop_sequences: params.stopSequences,
      messages: [{ role: "user", content: params.userMessage }],
    });
    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new Error("No text content in Claude response");
    }
    return block.text.trim();
  });
}

export async function generateJSON<S extends z.ZodTypeAny>(params: {
  systemPrompt: string;
  userMessage: string;
  schema: S;
  maxTokens?: number;
  model?: string;
}): Promise<z.output<S>> {
  const systemPrompt = `${params.systemPrompt}\n\nResponda EXCLUSIVAMENTE com JSON válido. Sem comentarios, sem texto antes ou depois. O JSON deve corresponder exatamente ao schema fornecido.`;
  const raw = await generate({
    systemPrompt,
    userMessage: params.userMessage,
    maxTokens: params.maxTokens ?? 4096,
    temperature: 0.4,
    model: params.model,
  });
  const json = extractJson(raw);
  return params.schema.parse(json);
}

export async function* stream(params: GenerateParams) {
  const anthropic = getAnthropic();
  const response = await anthropic.messages.stream({
    model: params.model ?? DEFAULT_MODEL,
    max_tokens: params.maxTokens ?? 2048,
    temperature: params.temperature ?? 0.6,
    system: params.systemPrompt,
    messages: [{ role: "user", content: params.userMessage }],
  });

  for await (const event of response) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}
