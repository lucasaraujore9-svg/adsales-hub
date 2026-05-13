"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const fieldSchema = z.object({
  entity: z.enum(["deal", "contact", "company", "activity"]),
  name: z.string().min(2).max(80),
  field_key: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z][a-z0-9_]*$/, {
      message: "field_key deve ser snake_case (ex: budget_anual)",
    }),
  type: z.enum([
    "text",
    "number",
    "date",
    "select",
    "multiselect",
    "boolean",
    "url",
    "email",
    "phone",
  ]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
});

export async function createCustomField(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = fieldSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();
  const body = {
    workspace_id: session.workspaceId,
    entity: parsed.data.entity,
    name: parsed.data.name,
    field_key: parsed.data.field_key,
    type: parsed.data.type,
    required: parsed.data.required,
    options:
      parsed.data.type === "select" || parsed.data.type === "multiselect"
        ? parsed.data.options ?? []
        : null,
  };
  const { data, error } = await session.supabase
    .from("custom_fields")
    .insert(body as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/campos");
  return { ok: true, data: data as { id: string } };
}

export async function deleteCustomField(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("custom_fields")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/campos");
  return { ok: true };
}
