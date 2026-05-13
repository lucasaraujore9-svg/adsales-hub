import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/guards";
import { publicEnv } from "@/lib/env";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  listAdAccounts,
  getUserProfile,
} from "@/lib/meta/oauth";
import { storeMetaToken } from "@/lib/meta/token-manager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function appUrl(path: string): string {
  const base = publicEnv.NEXT_PUBLIC_APP_URL || "https://adsaleshub.7iegroup.com.br";
  return new URL(path, base).toString();
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorReason = url.searchParams.get("error_reason");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    const reason = errorReason ?? error;
    return NextResponse.redirect(
      appUrl(
        `/configuracoes/meta-ads?error=${encodeURIComponent(reason)}${
          errorDescription ? `&desc=${encodeURIComponent(errorDescription)}` : ""
        }`,
      ),
    );
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(appUrl("/configuracoes/meta-ads?error=missing_params"));
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("meta_oauth_state")?.value;
  if (!storedState || storedState !== stateParam) {
    return NextResponse.redirect(appUrl("/configuracoes/meta-ads?error=state_mismatch"));
  }
  cookieStore.delete("meta_oauth_state");

  const session = await getSession();

  let longLived: { access_token: string; expires_in: number; token_type: string };
  let userProfile: { id: string; name: string; email?: string };
  let accounts: Awaited<ReturnType<typeof listAdAccounts>>;

  try {
    const shortLived = await exchangeCodeForToken(code);
    longLived = await exchangeForLongLivedToken(shortLived.access_token);
    userProfile = await getUserProfile(longLived.access_token);
    accounts = await listAdAccounts(longLived.access_token);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "exchange_failed";
    return NextResponse.redirect(
      appUrl(`/configuracoes/meta-ads?error=${encodeURIComponent("exchange_failed")}&desc=${encodeURIComponent(msg)}`),
    );
  }

  if (accounts.length === 0) {
    return NextResponse.redirect(
      appUrl(
        `/configuracoes/meta-ads?error=no_ad_accounts&meta_user=${encodeURIComponent(userProfile.name)}`,
      ),
    );
  }

  let stored = 0;
  let failed = 0;
  for (const account of accounts) {
    try {
      await storeMetaToken({
        workspaceId: session.workspaceId,
        providerAccountId: account.account_id,
        name: account.name,
        currency: account.currency,
        timezone: account.timezone_name,
        accessToken: longLived.access_token,
        expiresInSeconds: longLived.expires_in,
      });
      stored++;
    } catch {
      failed++;
    }
  }

  return NextResponse.redirect(
    appUrl(
      `/configuracoes/meta-ads?connected=${stored}${failed > 0 ? `&failed=${failed}` : ""}`,
    ),
  );
}
