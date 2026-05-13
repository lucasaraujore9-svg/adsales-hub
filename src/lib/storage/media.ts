import "server-only";

import { randomUUID } from "node:crypto";
import { publicEnv } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type MediaKind = "image" | "video";

export interface PersistMediaInput {
  /** Source URL or `data:` URI returned by the provider */
  sourceUrl: string;
  /** Workspace owning the asset (used as path prefix for organization) */
  workspaceId: string;
  /** image | video */
  kind: MediaKind;
  /** Optional preferred file id (e.g. ai_creatives.id). Otherwise uuid. */
  id?: string;
  /** MIME type override; otherwise inferred */
  contentType?: string;
}

export interface PersistMediaResult {
  /** Public URL on Supabase Storage */
  publicUrl: string;
  /** bucket path (workspace_id/file.ext) */
  path: string;
  /** Resolved content type */
  contentType: string;
  /** Size in bytes */
  size: number;
}

const BUCKET = "ai-creatives";

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

function extFromContentType(ct: string, fallback: string): string {
  return EXT_BY_TYPE[ct.toLowerCase()] ?? fallback;
}

async function downloadToBuffer(
  source: string,
): Promise<{ data: Uint8Array; contentType: string }> {
  if (source.startsWith("data:")) {
    const match = source.match(/^data:([^;,]+)(;base64)?,(.*)$/);
    if (!match) throw new Error("data URI invalido");
    const ct = match[1] || "application/octet-stream";
    const payload = decodeURIComponent(match[3]);
    const buf = match[2]
      ? Buffer.from(payload, "base64")
      : Buffer.from(payload, "utf8");
    return { data: new Uint8Array(buf), contentType: ct };
  }

  const res = await fetch(source);
  if (!res.ok) {
    throw new Error(`Falha ao baixar midia (${res.status})`);
  }
  const ct =
    res.headers.get("content-type")?.split(";")[0]?.trim() ||
    "application/octet-stream";
  const ab = await res.arrayBuffer();
  return { data: new Uint8Array(ab), contentType: ct };
}

/**
 * Downloads a provider-hosted asset (Together.ai, Higgsfield, etc.) and
 * uploads it to Supabase Storage so we don't depend on short-lived URLs.
 *
 * Returns the public URL routed via the workspace's Supabase API host.
 */
export async function persistMedia(
  input: PersistMediaInput,
): Promise<PersistMediaResult> {
  const { data, contentType: detectedType } = await downloadToBuffer(input.sourceUrl);
  const contentType =
    input.contentType ??
    detectedType ??
    (input.kind === "image" ? "image/png" : "video/mp4");
  const ext = extFromContentType(contentType, input.kind === "image" ? "png" : "mp4");
  const id = input.id ?? randomUUID();
  const path = `${input.workspaceId}/${id}.${ext}`;

  const admin = createAdminSupabaseClient();
  const { error } = await admin.storage.from(BUCKET).upload(path, data, {
    contentType,
    upsert: true,
    cacheControl: "31536000, immutable",
  });
  if (error) {
    throw new Error(`storage upload falhou: ${error.message}`);
  }

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
  // Self-hosted Supabase returns a URL pointing to the Kong gateway. We rebuild
  // it using NEXT_PUBLIC_SUPABASE_URL to ensure the public-facing host is used.
  const publicUrl = pub?.publicUrl
    ? pub.publicUrl.replace(/^https?:\/\/[^/]+/, publicEnv.NEXT_PUBLIC_SUPABASE_URL)
    : `${publicEnv.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

  return {
    publicUrl,
    path,
    contentType,
    size: data.byteLength,
  };
}
