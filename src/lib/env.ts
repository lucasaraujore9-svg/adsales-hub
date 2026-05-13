import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  IMAGE_MODEL_FALLBACK_TOKEN: z.string().optional(),
  VIDEO_GENERATOR_API_KEY: z.string().optional(),
  TOGETHER_API_KEY: z.string().optional(),
  HIGGSFIELD_API_KEY: z.string().optional(),
  LOCAL_AI_BASE_URL: z.string().optional(),
  LOCAL_AI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_OPERACAO: z.string().optional(),
  STRIPE_PRICE_CRESCIMENTO: z.string().optional(),
  STRIPE_PRICE_ESCALA: z.string().optional(),
  ASAAS_API_KEY: z.string().optional(),
  ASAAS_BASE_URL: z.string().optional(),
  ASAAS_WEBHOOK_TOKEN: z.string().optional(),
  MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional(),
  PAYMENT_GATEWAY: z.enum(["asaas", "mercadopago", "stripe"]).optional(),
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_SYSTEM_USER_TOKEN: z.string().optional(),
  META_WEBHOOK_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
  VOICE_ENGINE_API_KEY: z.string().optional(),
  VOICE_ENGINE_WEBHOOK_SECRET: z.string().optional(),
  DID_PROVIDER_API_TOKEN: z.string().optional(),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_DOMAIN: z.string().default("localhost"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

const nonEmpty = (value: string | undefined, fallback?: string) =>
  value && value.length > 0 ? value : fallback;

const rawPublic = {
  NEXT_PUBLIC_APP_URL: nonEmpty(process.env.NEXT_PUBLIC_APP_URL),
  NEXT_PUBLIC_APP_DOMAIN: nonEmpty(process.env.NEXT_PUBLIC_APP_DOMAIN),
  NEXT_PUBLIC_SUPABASE_URL: nonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "https://placeholder.supabase.co",
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: nonEmpty(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "placeholder-anon-key",
  ),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: nonEmpty(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  ),
};

export const publicEnv = publicEnvSchema.parse(rawPublic);

let _serverEnv: z.infer<typeof serverEnvSchema> | null = null;

export function serverEnv() {
  if (_serverEnv) return _serverEnv;
  _serverEnv = serverEnvSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    IMAGE_MODEL_FALLBACK_TOKEN: process.env.IMAGE_MODEL_FALLBACK_TOKEN,
    VIDEO_GENERATOR_API_KEY: process.env.VIDEO_GENERATOR_API_KEY,
    TOGETHER_API_KEY: process.env.TOGETHER_API_KEY,
    HIGGSFIELD_API_KEY: process.env.HIGGSFIELD_API_KEY,
    LOCAL_AI_BASE_URL: process.env.LOCAL_AI_BASE_URL,
    LOCAL_AI_API_KEY: process.env.LOCAL_AI_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_OPERACAO: process.env.STRIPE_PRICE_OPERACAO,
    STRIPE_PRICE_CRESCIMENTO: process.env.STRIPE_PRICE_CRESCIMENTO,
    STRIPE_PRICE_ESCALA: process.env.STRIPE_PRICE_ESCALA,
    ASAAS_API_KEY: process.env.ASAAS_API_KEY,
    ASAAS_BASE_URL: process.env.ASAAS_BASE_URL,
    ASAAS_WEBHOOK_TOKEN: process.env.ASAAS_WEBHOOK_TOKEN,
    MERCADO_PAGO_ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    MERCADO_PAGO_WEBHOOK_SECRET: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
    PAYMENT_GATEWAY: process.env.PAYMENT_GATEWAY as "asaas" | "mercadopago" | "stripe" | undefined,
    META_APP_ID: process.env.META_APP_ID,
    META_APP_SECRET: process.env.META_APP_SECRET,
    META_SYSTEM_USER_TOKEN: process.env.META_SYSTEM_USER_TOKEN,
    META_WEBHOOK_VERIFY_TOKEN: process.env.META_WEBHOOK_VERIFY_TOKEN,
    WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
    WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    VOICE_ENGINE_API_KEY: process.env.VOICE_ENGINE_API_KEY,
    VOICE_ENGINE_WEBHOOK_SECRET: process.env.VOICE_ENGINE_WEBHOOK_SECRET,
    DID_PROVIDER_API_TOKEN: process.env.DID_PROVIDER_API_TOKEN,
  });
  return _serverEnv;
}

export function requireServerEnv<K extends keyof z.infer<typeof serverEnvSchema>>(
  key: K,
): NonNullable<z.infer<typeof serverEnvSchema>[K]> {
  const value = serverEnv()[key];
  if (!value) {
    throw new Error(`${String(key)} is not set in environment`);
  }
  return value as NonNullable<z.infer<typeof serverEnvSchema>[K]>;
}
