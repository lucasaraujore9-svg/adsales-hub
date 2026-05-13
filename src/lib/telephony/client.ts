import "server-only";

import { requireServerEnv } from "@/lib/env";
import type {
  VoiceAssistantConfig,
  VoiceCallDetails,
} from "@/lib/telephony/types";

const VOICE_ENGINE_BASE = process.env.VOICE_ENGINE_BASE_URL ?? "https://api.voice-engine.internal";

async function voiceEngineFetch<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: object,
  query?: Record<string, string | number | undefined>,
): Promise<T> {
  const url = new URL(`${VOICE_ENGINE_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${requireServerEnv("VOICE_ENGINE_API_KEY")}`,
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Voice engine API ${response.status}: ${text.slice(0, 200)}`);
  }
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export async function createAssistant(config: VoiceAssistantConfig): Promise<{ id: string }> {
  return voiceEngineFetch("POST", "/assistant", config);
}

export async function updateAssistant(
  assistantId: string,
  config: Partial<VoiceAssistantConfig>,
): Promise<{ id: string }> {
  return voiceEngineFetch("PATCH", `/assistant/${assistantId}`, config);
}

export async function getAssistant(assistantId: string) {
  return voiceEngineFetch<VoiceAssistantConfig & { id: string }>(
    "GET",
    `/assistant/${assistantId}`,
  );
}

export async function initiateOutboundCall(params: {
  phoneNumberId: string;
  assistantId: string;
  to: string;
  metadata?: Record<string, string>;
  assistantOverrides?: Partial<VoiceAssistantConfig>;
}): Promise<{ id: string } & Partial<VoiceCallDetails>> {
  return voiceEngineFetch("POST", "/call", {
    phoneNumberId: params.phoneNumberId,
    assistantId: params.assistantId,
    customer: { number: params.to },
    metadata: params.metadata,
    assistantOverrides: params.assistantOverrides,
  });
}

export async function getCall(callId: string): Promise<VoiceCallDetails> {
  return voiceEngineFetch("GET", `/call/${callId}`);
}

export async function listCalls(opts: {
  assistantId?: string;
  limit?: number;
  createdAtGe?: string;
} = {}) {
  return voiceEngineFetch<VoiceCallDetails[]>("GET", "/call", undefined, {
    assistantId: opts.assistantId,
    limit: opts.limit ?? 50,
    createdAtGe: opts.createdAtGe,
  });
}

export interface ImportPhoneNumberParams {
  number: string;
  credentialId: string;
  name?: string;
  assistantId?: string;
  serverUrl?: string;
}

export async function importPhoneNumber(
  params: ImportPhoneNumberParams,
): Promise<{ id: string; number: string }> {
  return voiceEngineFetch("POST", "/phone-number", {
    provider: "byo-phone-number",
    ...params,
  });
}

export async function createByoSipTrunkCredential(params: {
  name: string;
  sipTrunk: {
    gateway: { ip: string; port?: number };
    outboundAuthenticationPlan?: {
      authUsername: string;
      authPassword: string;
    };
  };
}): Promise<{ id: string }> {
  return voiceEngineFetch("POST", "/credential", {
    provider: "byo-sip-trunk",
    ...params,
  });
}
