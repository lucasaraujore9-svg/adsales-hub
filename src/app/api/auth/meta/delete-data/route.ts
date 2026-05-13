import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SignedRequest {
  user_id: string;
  algorithm: string;
  issued_at: number;
}

function base64UrlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return Buffer.from(padded + padding, "base64");
}

function parseSignedRequest(signed: string, appSecret: string): SignedRequest | null {
  const parts = signed.split(".");
  if (parts.length !== 2) return null;
  const [encodedSig, encodedPayload] = parts;

  const sig = base64UrlDecode(encodedSig);
  const expected = createHmac("sha256", appSecret)
    .update(encodedPayload)
    .digest();

  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(sig, expected)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"));
    if (payload.algorithm !== "HMAC-SHA256") return null;
    return payload as SignedRequest;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const appSecret = process.env.META_APP_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://adsaleshub.7iegroup.com.br";
  if (!appSecret) {
    return NextResponse.json({ error: "App not configured" }, { status: 500 });
  }

  let signedRequest: string | null = null;
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const body = await req.formData();
    signedRequest = String(body.get("signed_request") ?? "");
  } else {
    const body = await req.json().catch(() => null);
    if (body && typeof body === "object" && "signed_request" in body) {
      signedRequest = String((body as { signed_request: unknown }).signed_request);
    }
  }

  if (!signedRequest) {
    return NextResponse.json({ error: "Missing signed_request" }, { status: 400 });
  }

  const parsed = parseSignedRequest(signedRequest, appSecret);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const sb = createAdminSupabaseClient();
  const confirmationCode = randomBytes(16).toString("hex");

  // Track the deletion request for audit + status endpoint
  const insert = (sb.from as unknown as (
    t: string,
  ) => { insert: (v: unknown) => Promise<{ error: { message: string } | null }> })(
    "integration_events",
  ).insert;
  const { error: insertError } = await insert({
    provider: "meta",
    event_type: "delete_data_request",
    payload: {
      meta_user_id: parsed.user_id,
      issued_at: parsed.issued_at,
      confirmation_code: confirmationCode,
      status: "pending",
    },
    received_at: new Date().toISOString(),
  });

  if (insertError) {
    return NextResponse.json({ error: "Failed to log request" }, { status: 500 });
  }

  // Soft-disconnect all Meta integrations for this user immediately
  await sb
    .from("ad_accounts")
    .update({
      access_token_encrypted: null,
      token_expires_at: null,
      status: "disconnected",
      updated_at: new Date().toISOString(),
    } as never)
    .eq("provider", "meta")
    .eq("metadata->>meta_user_id", parsed.user_id);

  // Real PII deletion (form submissions, contacts derived from Meta leads, etc) is async.
  // Worker scans pending delete_data_requests and processes within 7 days.
  // For now, return the confirmation code so the user can check status.

  return NextResponse.json({
    url: `${appUrl}/api/auth/meta/data-deletion-status?id=${confirmationCode}`,
    confirmation_code: confirmationCode,
  });
}
