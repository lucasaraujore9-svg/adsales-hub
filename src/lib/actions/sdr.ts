"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const sdrSchema = z.object({
  is_active: z.boolean().default(false),
  phone_number: z.string().max(30).optional().nullable(),
  tone: z.enum(["formal", "casual", "technical"]).default("formal"),
  language: z.enum(["pt-BR", "en", "es"]).default("pt-BR"),
  max_attempts: z.coerce.number().int().min(1).max(10).default(3),
  qualification_questions: z.array(z.string()).default([]),
  working_hours_start: z.string().default("09:00"),
  working_hours_end: z.string().default("18:00"),
});

export async function upsertSdrConfig(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = sdrSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();

  const body = {
    workspace_id: session.workspaceId,
    is_active: parsed.data.is_active,
    phone_number: parsed.data.phone_number ?? null,
    tone: parsed.data.tone,
    language: parsed.data.language,
    max_attempts: parsed.data.max_attempts,
    qualification_script: { questions: parsed.data.qualification_questions },
    working_hours: {
      start: parsed.data.working_hours_start,
      end: parsed.data.working_hours_end,
    },
  };

  const { data: existing } = await session.supabase
    .from("sdr_configs")
    .select("id")
    .eq("workspace_id", session.workspaceId)
    .maybeSingle();

  if (existing && (existing as { id?: string }).id) {
    const { error } = await session.supabase
      .from("sdr_configs")
      .update(body as never)
      .eq("id", (existing as { id: string }).id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/configuracoes/sdr-ia");
    revalidatePath("/prospeccao/sdr-ia");
    return { ok: true, data: existing as { id: string } };
  }

  const { data, error } = await session.supabase
    .from("sdr_configs")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/sdr-ia");
  revalidatePath("/prospeccao/sdr-ia");
  return { ok: true, data: data as { id: string } };
}
