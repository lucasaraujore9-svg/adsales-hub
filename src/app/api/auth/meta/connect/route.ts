import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth/guards";
import { buildOAuthUrl } from "@/lib/meta/oauth";

export async function GET() {
  await requireAuth();

  if (!process.env.META_APP_ID || !process.env.META_APP_SECRET) {
    return NextResponse.redirect(
      new URL(
        "/configuracoes/meta-ads?error=app_not_configured",
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      ),
    );
  }

  const state = randomBytes(16).toString("base64url");

  const cookieStore = await cookies();
  cookieStore.set("meta_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return NextResponse.redirect(buildOAuthUrl(state));
}
