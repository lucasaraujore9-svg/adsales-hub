import "server-only";

import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export interface ApiAuthContext {
  workspaceId: string;
  apiKeyId: string;
  scopes: string[];
}

export async function authenticateApiRequest(
  req: NextRequest,
  requiredScope: string,
): Promise<{ ctx: ApiAuthContext } | { response: NextResponse }> {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return {
      response: NextResponse.json(
        { ok: false, error: "Missing Authorization: Bearer header" },
        { status: 401 },
      ),
    };
  }
  const token = auth.slice("bearer ".length).trim();
  if (!token.startsWith("ahk_")) {
    return {
      response: NextResponse.json(
        { ok: false, error: "Invalid token format" },
        { status: 401 },
      ),
    };
  }

  const hash = createHash("sha256").update(token).digest("hex");
  const sb = createAdminSupabaseClient();

  const { data } = await sb
    .from("api_keys")
    .select("id, workspace_id, scopes, revoked_at, expires_at")
    .eq("key_hash", hash)
    .maybeSingle();

  const key = data as
    | {
        id: string;
        workspace_id: string;
        scopes: string[];
        revoked_at: string | null;
        expires_at: string | null;
      }
    | null;

  if (!key) {
    return {
      response: NextResponse.json(
        { ok: false, error: "Invalid API key" },
        { status: 401 },
      ),
    };
  }

  if (key.revoked_at) {
    return {
      response: NextResponse.json(
        { ok: false, error: "API key revoked" },
        { status: 401 },
      ),
    };
  }
  if (key.expires_at && new Date(key.expires_at) < new Date()) {
    return {
      response: NextResponse.json(
        { ok: false, error: "API key expired" },
        { status: 401 },
      ),
    };
  }

  const hasScope = key.scopes.includes("*") || key.scopes.includes(requiredScope);
  if (!hasScope) {
    return {
      response: NextResponse.json(
        {
          ok: false,
          error: `Insufficient scope: ${requiredScope} required`,
        },
        { status: 403 },
      ),
    };
  }

  // Fire-and-forget last_used_at update
  void sb
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() } as never)
    .eq("id", key.id);

  return {
    ctx: {
      workspaceId: key.workspace_id,
      apiKeyId: key.id,
      scopes: key.scopes,
    },
  };
}

export function getAdmin() {
  return createAdminSupabaseClient();
}
