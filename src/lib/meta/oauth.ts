import "server-only";

import { publicEnv, requireServerEnv } from "@/lib/env";
import { META_GRAPH_BASE, metaFetch } from "@/lib/meta/client";
import type { MetaAdAccount } from "@/lib/meta/types";

const FB_LOGIN_BASE = "https://www.facebook.com/v21.0";

export const META_DEFAULT_SCOPES = [
  "ads_management",
  "ads_read",
  "leads_retrieval",
  "pages_manage_ads",
  "pages_read_engagement",
  "pages_show_list",
  "business_management",
  "instagram_basic",
  "instagram_content_publish",
  "instagram_manage_insights",
  "email",
  "public_profile",
];

export function buildOAuthUrl(state: string, scopes: string[] = META_DEFAULT_SCOPES) {
  const appId = requireServerEnv("META_APP_ID");
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: `${publicEnv.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`,
    state,
    scope: scopes.join(","),
    response_type: "code",
    auth_type: "rerequest",
  });
  return `${FB_LOGIN_BASE}/dialog/oauth?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const appId = requireServerEnv("META_APP_ID");
  const appSecret = requireServerEnv("META_APP_SECRET");

  const url = new URL(`${META_GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set(
    "redirect_uri",
    `${publicEnv.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`,
  );
  url.searchParams.set("code", code);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Meta token exchange failed: ${await res.text()}`);
  return res.json();
}

export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<{
  access_token: string;
  expires_in: number;
  token_type: string;
}> {
  const appId = requireServerEnv("META_APP_ID");
  const appSecret = requireServerEnv("META_APP_SECRET");

  const url = new URL(`${META_GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Meta long-lived token exchange failed: ${await res.text()}`);
  return res.json();
}

export async function listAdAccounts(token: string): Promise<MetaAdAccount[]> {
  const response = await metaFetch<{ data: MetaAdAccount[] }>({
    token,
    path: "me/adaccounts",
    query: {
      fields: "id,account_id,name,currency,timezone_name,account_status",
    },
  });
  return response.data ?? [];
}

export async function getUserProfile(token: string): Promise<{ id: string; name: string; email?: string }> {
  return metaFetch({
    token,
    path: "me",
    query: { fields: "id,name,email" },
  });
}
