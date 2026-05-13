import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type Platform =
  | "instagram"
  | "facebook"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "threads"
  | "x";

interface SocialPostRecord {
  id: string;
  workspace_id: string;
  content_text: string | null;
  hashtags: string[] | null;
  media_urls: unknown;
  platforms: unknown;
  first_comment: string | null;
  scheduled_at: string | null;
}

interface SocialAccountRecord {
  id: string;
  platform: string;
  account_id: string;
  account_name: string;
  status: string;
  access_token_encrypted: string | null;
}

export interface PlatformPublishResult {
  platform: string;
  ok: boolean;
  provider_post_id?: string | null;
  error?: string;
  simulated?: boolean;
}

interface PublishOutcome {
  postId: string;
  results: PlatformPublishResult[];
  status: "published" | "failed" | "publishing";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function extractMediaUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const urls: string[] = [];
  for (const v of value) {
    if (typeof v === "string") urls.push(v);
    else if (v && typeof v === "object" && typeof (v as { url?: unknown }).url === "string") {
      urls.push((v as { url: string }).url);
    }
  }
  return urls;
}

function buildCaption(post: SocialPostRecord): string {
  const tags = (post.hashtags ?? [])
    .map((h) => (h.startsWith("#") ? h : `#${h}`))
    .join(" ");
  return [post.content_text?.trim() ?? "", tags].filter(Boolean).join("\n\n");
}

async function publishToInstagram(
  account: SocialAccountRecord,
  post: SocialPostRecord,
): Promise<PlatformPublishResult> {
  const media = extractMediaUrls(post.media_urls);
  const firstMedia = media[0];

  if (!account.access_token_encrypted) {
    return {
      platform: "instagram",
      ok: false,
      error: "Conta sem token de acesso",
    };
  }
  if (!firstMedia) {
    return {
      platform: "instagram",
      ok: false,
      error: "Instagram exige ao menos 1 imagem ou video",
    };
  }

  try {
    const { decrypt } = await import("@/lib/crypto");
    const { metaFetch } = await import("@/lib/meta/client");
    const token = decrypt(account.access_token_encrypted);
    const caption = buildCaption(post);

    const container = await metaFetch<{ id: string }>({
      path: `/${account.account_id}/media`,
      method: "POST",
      token,
      body: { image_url: firstMedia, caption },
    });

    const published = await metaFetch<{ id: string }>({
      path: `/${account.account_id}/media_publish`,
      method: "POST",
      token,
      body: { creation_id: container.id },
    });

    if (post.first_comment) {
      try {
        await metaFetch({
          path: `/${published.id}/comments`,
          method: "POST",
          token,
          body: { message: post.first_comment },
        });
      } catch (err) {
        console.warn("[social/publish] first_comment falhou", err);
      }
    }

    return { platform: "instagram", ok: true, provider_post_id: published.id };
  } catch (err) {
    return {
      platform: "instagram",
      ok: false,
      error: err instanceof Error ? err.message : "Falha desconhecida",
    };
  }
}

async function publishToFacebook(
  account: SocialAccountRecord,
  post: SocialPostRecord,
): Promise<PlatformPublishResult> {
  if (!account.access_token_encrypted) {
    return { platform: "facebook", ok: false, error: "Conta sem token" };
  }
  try {
    const { decrypt } = await import("@/lib/crypto");
    const { metaFetch } = await import("@/lib/meta/client");
    const token = decrypt(account.access_token_encrypted);
    const caption = buildCaption(post);
    const result = await metaFetch<{ id: string }>({
      path: `/${account.account_id}/feed`,
      method: "POST",
      token,
      body: { message: caption },
    });
    return { platform: "facebook", ok: true, provider_post_id: result.id };
  } catch (err) {
    return {
      platform: "facebook",
      ok: false,
      error: err instanceof Error ? err.message : "Falha desconhecida",
    };
  }
}

async function publishSimulated(
  platform: Platform,
  post: SocialPostRecord,
): Promise<PlatformPublishResult> {
  const id = `sim_${platform}_${post.id.slice(0, 8)}_${Date.now()}`;
  return {
    platform,
    ok: true,
    provider_post_id: id,
    simulated: true,
  };
}

async function publishOnePlatform(
  platform: Platform,
  account: SocialAccountRecord | undefined,
  post: SocialPostRecord,
): Promise<PlatformPublishResult> {
  if (!account || account.status !== "active") {
    return publishSimulated(platform, post);
  }
  if (platform === "instagram") return publishToInstagram(account, post);
  if (platform === "facebook") return publishToFacebook(account, post);
  return publishSimulated(platform, post);
}

export async function publishSocialPost(postId: string): Promise<PublishOutcome> {
  const admin = createAdminSupabaseClient();

  const { data: postData, error: postErr } = await admin
    .from("social_posts")
    .select(
      "id, workspace_id, content_text, hashtags, media_urls, platforms, first_comment, scheduled_at",
    )
    .eq("id", postId)
    .single();

  if (postErr || !postData) {
    return {
      postId,
      results: [],
      status: "failed",
    };
  }
  const post = postData as unknown as SocialPostRecord;
  const platforms = asStringArray(post.platforms) as Platform[];

  await admin
    .from("social_posts")
    .update({ status: "publishing" } as never)
    .eq("id", postId);

  const { data: accountsData } = await admin
    .from("social_accounts")
    .select("id, platform, account_id, account_name, status, access_token_encrypted")
    .eq("workspace_id", post.workspace_id);
  const accounts = (accountsData ?? []) as unknown as SocialAccountRecord[];

  const results: PlatformPublishResult[] = [];
  for (const platform of platforms) {
    const account = accounts.find((a) => a.platform === platform);
    const r = await publishOnePlatform(platform, account, post);
    results.push(r);

    if (r.ok) {
      await admin
        .from("social_post_metrics")
        .upsert(
          {
            social_post_id: postId,
            platform,
            provider_post_id: r.provider_post_id ?? null,
          } as never,
          { onConflict: "social_post_id,platform" },
        );
    }
  }

  const allOk = results.length > 0 && results.every((r) => r.ok);
  const status: "published" | "failed" = allOk ? "published" : "failed";
  await admin
    .from("social_posts")
    .update({
      status,
      published_at: allOk ? new Date().toISOString() : null,
    } as never)
    .eq("id", postId);

  return { postId, results, status };
}

export async function publishDueSocialPosts(opts: { limit?: number } = {}) {
  const admin = createAdminSupabaseClient();
  const nowIso = new Date().toISOString();
  const { data } = await admin
    .from("social_posts")
    .select("id")
    .eq("status", "scheduled")
    .lte("scheduled_at", nowIso)
    .order("scheduled_at", { ascending: true })
    .limit(opts.limit ?? 20);

  const ids = ((data ?? []) as unknown as { id: string }[]).map((r) => r.id);
  const outcomes: PublishOutcome[] = [];
  for (const id of ids) {
    try {
      const out = await publishSocialPost(id);
      outcomes.push(out);
    } catch (err) {
      console.error("[social/publish] erro fatal", id, err);
      await admin
        .from("social_posts")
        .update({ status: "failed" } as never)
        .eq("id", id);
    }
  }
  return {
    checked: ids.length,
    published: outcomes.filter((o) => o.status === "published").length,
    failed: outcomes.filter((o) => o.status === "failed").length,
    outcomes,
  };
}
