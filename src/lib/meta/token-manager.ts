import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { decrypt, encrypt } from "@/lib/crypto";
import { exchangeForLongLivedToken } from "@/lib/meta/oauth";

export interface StoredMetaToken {
  accessToken: string;
  expiresAt: Date | null;
  adAccountId: string;
  workspaceId: string;
}

/**
 * Fetch + decrypt the Meta access token for an ad account. Automatically
 * attempts a long-lived token refresh if the current token expires within
 * the given threshold.
 */
export async function getMetaToken(
  adAccountId: string,
  opts: { refreshThresholdDays?: number } = {},
): Promise<StoredMetaToken> {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("ad_accounts")
    .select("id, workspace_id, access_token_encrypted, token_expires_at")
    .eq("id", adAccountId)
    .single();

  if (error || !data?.access_token_encrypted) {
    throw new Error(`No Meta token stored for ad account ${adAccountId}`);
  }

  const token = decrypt(data.access_token_encrypted as string);
  const expiresAt = data.token_expires_at
    ? new Date(data.token_expires_at as string)
    : null;

  const threshold = (opts.refreshThresholdDays ?? 7) * 24 * 60 * 60 * 1000;
  if (expiresAt && expiresAt.getTime() - Date.now() < threshold) {
    const refreshed = await exchangeForLongLivedToken(token);
    const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000);
    await admin
      .from("ad_accounts")
      .update({
        access_token_encrypted: encrypt(refreshed.access_token),
        token_expires_at: newExpiresAt.toISOString(),
      })
      .eq("id", adAccountId);
    return {
      accessToken: refreshed.access_token,
      expiresAt: newExpiresAt,
      adAccountId,
      workspaceId: data.workspace_id as string,
    };
  }

  return {
    accessToken: token,
    expiresAt,
    adAccountId,
    workspaceId: data.workspace_id as string,
  };
}

/**
 * Persist a fresh Meta token for an ad account (used after OAuth connect).
 */
export async function storeMetaToken(params: {
  workspaceId: string;
  providerAccountId: string;
  name: string;
  currency: string;
  timezone: string;
  accessToken: string;
  expiresInSeconds: number;
}): Promise<string> {
  const admin = createAdminSupabaseClient();
  const expiresAt = new Date(Date.now() + params.expiresInSeconds * 1000).toISOString();

  const payload = {
    workspace_id: params.workspaceId,
    provider: "meta",
    provider_account_id: params.providerAccountId,
    name: params.name,
    currency: params.currency,
    timezone: params.timezone,
    access_token_encrypted: encrypt(params.accessToken),
    token_expires_at: expiresAt,
    status: "active",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await admin
    .from("ad_accounts")
    .upsert(payload, { onConflict: "workspace_id,provider,provider_account_id" })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to upsert ad account: ${error?.message ?? "unknown"}`);
  }
  return data.id as string;
}
