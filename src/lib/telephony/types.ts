export interface VoiceAssistantModel {
  provider: string;
  model: string;
  messages?: Array<{ role: "system" | "assistant" | "user"; content: string }>;
  temperature?: number;
  maxTokens?: number;
  tools?: Array<Record<string, unknown>>;
}

export interface VoiceAssistantVoice {
  provider: string;
  voiceId: string;
  language?: string;
}

export interface VoiceAssistantConfig {
  name: string;
  firstMessage?: string;
  firstMessageMode?: "assistant-speaks-first" | "assistant-waits-for-user";
  model: VoiceAssistantModel;
  voice: VoiceAssistantVoice;
  transcriber?: { provider: string; language?: string };
  serverUrl?: string;
  serverUrlSecret?: string;
  maxDurationSeconds?: number;
  endCallFunctionEnabled?: boolean;
  silenceTimeoutSeconds?: number;
  metadata?: Record<string, string>;
}

export interface VoiceCallDetails {
  id: string;
  status:
    | "queued"
    | "ringing"
    | "in-progress"
    | "completed"
    | "forwarding"
    | "ended"
    | "failed";
  type: "inboundPhoneCall" | "outboundPhoneCall" | "webCall";
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  analysis?: {
    summary?: string;
    successEvaluation?: string;
    structuredData?: Record<string, unknown>;
  };
  costs?: Array<{ type: string; amount: number }>;
  recordingUrl?: string;
  transcript?: string;
  metadata?: Record<string, string>;
  endedReason?: string;
}

export interface VoiceWebhookEvent {
  message: {
    type:
      | "assistant-request"
      | "status-update"
      | "transcript"
      | "end-of-call-report"
      | "hang"
      | "speech-update"
      | "tool-calls";
    call?: VoiceCallDetails;
    artifact?: {
      transcript?: string;
      messages?: Array<{ role: string; message: string }>;
      recordingUrl?: string;
    };
    status?: string;
    endedReason?: string;
    transcript?: string;
    role?: string;
    summary?: string;
    analysis?: Record<string, unknown>;
    durationSeconds?: number;
  };
}

export interface DidNumber {
  number: string;
  sip: {
    host: string;
    username: string;
    password: string;
    port?: number;
    transport?: "udp" | "tcp" | "tls";
  };
  status: "active" | "suspended" | "canceled";
  plan?: string;
  price?: number;
}
