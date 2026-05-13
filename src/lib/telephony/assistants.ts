import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env";
import {
  createAssistant,
  updateAssistant,
} from "@/lib/telephony/client";
import type { VoiceAssistantConfig } from "@/lib/telephony/types";

const DEFAULT_FIRST_MESSAGE =
  "Oi! Aqui e da AdSales Hub. Posso fazer algumas perguntas rapidas pra entender melhor o seu momento?";

const DEFAULT_SYSTEM_PROMPT = `Voce e um SDR (Sales Development Representative) falando com um lead.
Sua funcao e qualificar o lead em ate 90 segundos e agendar uma reuniao com o vendedor.

Regras:
- Seja direto, simpatico e respeitoso.
- Use portugues brasileiro informal mas profissional.
- Perguntas em sequencia: segmento, tamanho da empresa, desafio principal, urgencia, orcamento.
- Se qualificado: ofereca 2-3 horarios de reuniao nas proximas 48h.
- Se nao qualificado: agradeca e encerre educadamente.
- Se ocupado: ofereca reagendar e encerre rapido.
- Nunca invente informacoes sobre o produto.
- Nunca responda perguntas tecnicas especificas — diga que o vendedor ira explicar.`;

function defaultConfig(
  workspaceName: string,
  serverUrl: string,
  secret?: string,
): VoiceAssistantConfig {
  return {
    name: `SDR IA — ${workspaceName}`,
    firstMessage: DEFAULT_FIRST_MESSAGE,
    firstMessageMode: "assistant-speaks-first",
    model: {
      provider: "primary-llm",
      model: "default",
      messages: [{ role: "system", content: DEFAULT_SYSTEM_PROMPT }],
      temperature: 0.6,
      maxTokens: 350,
    },
    voice: {
      provider: "tts-provider",
      voiceId: "default-voice",
      language: "pt-BR",
    },
    transcriber: { provider: "stt-provider", language: "pt-BR" },
    serverUrl,
    serverUrlSecret: secret,
    maxDurationSeconds: 600,
    silenceTimeoutSeconds: 20,
    endCallFunctionEnabled: true,
  };
}

export async function ensureAssistant(
  workspaceId: string,
  overrides?: {
    script?: string;
    tone?: "formal" | "casual" | "technical";
    language?: "pt-BR" | "en" | "es";
    voiceId?: string;
  },
): Promise<string> {
  const admin = createAdminSupabaseClient();
  const { data: workspace } = await admin
    .from("workspaces")
    .select("id, name")
    .eq("id", workspaceId)
    .single();

  const { data: config } = await admin
    .from("sdr_configs")
    .select("voice_assistant_id, tone, language, qualification_script")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const serverUrl = `${publicEnv.NEXT_PUBLIC_APP_URL}/api/webhooks/voice-engine`;
  const secret = process.env.VOICE_ENGINE_WEBHOOK_SECRET;

  const script =
    overrides?.script ??
    (config?.qualification_script as { system?: string } | null)?.system ??
    DEFAULT_SYSTEM_PROMPT;

  const payload: Partial<VoiceAssistantConfig> = {
    name: `SDR IA — ${workspace?.name ?? workspaceId}`,
    firstMessage: DEFAULT_FIRST_MESSAGE,
    model: {
      provider: "primary-llm",
      model: "default",
      messages: [{ role: "system", content: script }],
      temperature: overrides?.tone === "formal" ? 0.4 : 0.65,
      maxTokens: 350,
    },
    voice: {
      provider: "tts-provider",
      voiceId: overrides?.voiceId ?? "default-voice",
      language: overrides?.language ?? "pt-BR",
    },
    transcriber: {
      provider: "stt-provider",
      language: overrides?.language ?? "pt-BR",
    },
    serverUrl,
    serverUrlSecret: secret,
  };

  if (config?.voice_assistant_id) {
    await updateAssistant(config.voice_assistant_id as string, payload);
    return config.voice_assistant_id as string;
  }

  const fullConfig = {
    ...defaultConfig(workspace?.name ?? "Workspace", serverUrl, secret),
    ...payload,
  } as VoiceAssistantConfig;

  const created = await createAssistant(fullConfig);
  await admin.from("sdr_configs").upsert(
    {
      workspace_id: workspaceId,
      voice_assistant_id: created.id,
    },
    { onConflict: "workspace_id" },
  );
  return created.id;
}
