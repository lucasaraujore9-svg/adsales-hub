"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const SCOPES = [
  "contacts:read",
  "contacts:write",
  "deals:read",
  "deals:write",
  "campaigns:read",
  "campaigns:write",
  "forms:read",
  "forms:write",
  "*",
] as const;

const createSchema = z.object({
  name: z.string().min(2).max(80),
  scopes: z.array(z.enum(SCOPES)).min(1),
  expires_in_days: z.coerce.number().int().min(0).max(3650).default(0),
});

function generateKey(): { plain: string; prefix: string; hash: string } {
  const raw = randomBytes(24).toString("base64url");
  const plain = `ahk_${raw}`;
  const prefix = plain.slice(0, 12); // ahk_xxxxxxxx
  const hash = createHash("sha256").update(plain).digest("hex");
  return { plain, prefix, hash };
}

export async function createApiKey(input: unknown): Promise<
  ActionResult<{ id: string; plain_key: string; prefix: string }>
> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await getSession();

  const { plain, prefix, hash } = generateKey();
  const expiresAt =
    parsed.data.expires_in_days > 0
      ? new Date(Date.now() + parsed.data.expires_in_days * 86400e3).toISOString()
      : null;

  const { data, error } = await session.supabase
    .from("api_keys")
    .insert({
      workspace_id: session.workspaceId,
      name: parsed.data.name,
      key_prefix: prefix,
      key_hash: hash,
      scopes: parsed.data.scopes,
      created_by_user_id: session.user.id,
      expires_at: expiresAt,
    } as never)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/configuracoes/api");
  return {
    ok: true,
    data: {
      id: (data as { id: string }).id,
      plain_key: plain,
      prefix,
    },
  };
}

export async function revokeApiKey(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() } as never)
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/api");
  return { ok: true };
}

export async function deleteApiKey(id: string): Promise<ActionResult> {
  const session = await getSession();
  const { error } = await session.supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .eq("workspace_id", session.workspaceId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/configuracoes/api");
  return { ok: true };
}
