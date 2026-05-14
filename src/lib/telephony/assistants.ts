import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env";
import {
  createAssistant,
  updateAssistant,
} from "@/lib/telephony/client";
import type { VoiceAssistantConfig } from "@/lib/telephony/types";

const DEFAULT_FIRST_MESSAGE =
  "Oi! Aqui é da AdSales Hub. Antes de prosseguirmos, informo que esta chamada será gravada para fins de qualidade e treinamento. Você concorda em prosseguir com a gravação?";

const DEFAULT_SYSTEM_PROMPT = `Você é um SDR (Sales Development Representative) falando com um lead.
Sua função é qualificar o lead em até 90 segundos e agendar uma reunião com o vendedor.

CONSENTIMENTO DE GRAVAÇÃO (LGPD — OBRIGATÓRIO):
- Sua PRIMEIRA frase pergunta sobre consentimento de gravação.
- Se a pessoa responder SIM (sim, claro, ok, pode, tudo bem, concordo, sem problemas, autorizo): registre extracted_data = { "consent": "yes", "consent_text": "<texto exato da resposta>" } e prossiga normalmente.
- Se responder NÃO (não, prefiro que não, não autorizo, não quero): registre extracted_data = { "consent": "no", "consent_text": "<resposta>" }, responda "Sem problemas, posso te enviar informações por email ou WhatsApp?" e encerre cordialmente. NÃO faça qualquer pergunta de qualificação.
- Em caso de resposta ambígua: peça confirmação explícita uma vez. Se persistir ambíguo, encerre tratando como "no".

Regras gerais (apenas se houver consentimento):
- Seja direto, simpático e respeitoso.
- Use português brasileiro informal mas profissional.
- Perguntas em sequência: segmento, tamanho da empresa, desafio principal, urgência, orçamento.
- Se qualificado: ofereça 2-3 horários de reunião nas próximas 48h.
- Se não qualificado: agradeça e encerre educadamente.
- Se ocupado: ofereça reagendar e encerre rápido.
- Nunca invente informações sobre o produto.
- Nunca responda perguntas técnicas específicas — diga que o vendedor irá explicar.`;

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
