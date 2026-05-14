"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import { friendlyError } from "@/lib/errors/friendly";
import { checkRateLimit, formatResetIn } from "@/lib/rate-limit";

async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe a senha"),
});

const signupSchema = z
  .object({
    name: z.string().min(2, "Nome muito curto"),
    email: z.string().email("Email inválido"),
    workspace_name: z.string().min(2, "Informe o nome da empresa"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Inclua pelo menos 1 letra maiúscula")
      .regex(/[0-9]/, "Inclua pelo menos 1 número")
      .regex(/[^a-zA-Z0-9]/, "Inclua pelo menos 1 caractere especial (!@#$ etc)"),
    password_confirm: z.string(),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "As senhas não coincidem",
    path: ["password_confirm"],
  });

const forgotSchema = z.object({
  email: z.string().email("Email inválido"),
});

export type ActionResult = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function fieldErrors(issue: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of issue.issues) {
    const key = String(i.path[0] ?? "_");
    if (!out[key]) out[key] = i.message;
  }
  return out;
}

export async function loginWithPassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  // Rate limit: 5 tentativas por email + 10 por IP em 15 min
  const ip = await getClientIp();
  const email = parsed.data.email.toLowerCase();
  const byEmail = checkRateLimit(`login:email:${email}`, 5, 15 * 60_000);
  const byIp = checkRateLimit(`login:ip:${ip}`, 10, 15 * 60_000);
  if (!byEmail.ok || !byIp.ok) {
    const wait = Math.max(byEmail.resetIn, byIp.resetIn);
    return {
      ok: false,
      error: `Muitas tentativas. Tente novamente em ${formatResetIn(wait)}.`,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ok: false, error: friendlyError(error, "auth") };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signupWithPassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    workspace_name: formData.get("workspace_name"),
    password: formData.get("password"),
    password_confirm: formData.get("password_confirm"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  // Rate limit: 3 signups por IP em 15 min
  const ip = await getClientIp();
  const rl = checkRateLimit(`signup:ip:${ip}`, 3, 15 * 60_000);
  if (!rl.ok) {
    return {
      ok: false,
      error: `Muitas tentativas. Tente novamente em ${formatResetIn(rl.resetIn)}.`,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      data: {
        name: parsed.data.name,
        full_name: parsed.data.name,
        workspace_name: parsed.data.workspace_name,
      },
    },
  });

  if (error) {
    return { ok: false, error: friendlyError(error, "auth") };
  }

  return {
    ok: true,
    error: undefined,
  };
}

export async function sendPasswordReset(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = forgotSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  // Rate limit: 3 reset requests por email em 1 hora
  const email = parsed.data.email.toLowerCase();
  const rl = checkRateLimit(`reset:email:${email}`, 3, 60 * 60_000);
  if (!rl.ok) {
    // Resposta genérica para não vazar info sobre o email
    return { ok: true };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/configuracoes/perfil`,
  });

  if (error) {
    return { ok: false, error: friendlyError(error, "auth") };
  }

  return { ok: true };
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function signInWithOAuth(provider: "google" | "facebook") {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  });
  if (error || !data?.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "OAuth falhou")}`);
  }
  redirect(data.url);
}
