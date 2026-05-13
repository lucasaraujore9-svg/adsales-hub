import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";
import {
  isPublicPath,
  isAlwaysAllowed,
  matchModuleForPath,
} from "@/lib/billing/module-routes";

type CookieOptions = Parameters<NextResponse["cookies"]["set"]>[2];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Always refresh the Supabase session cookies so subsequent server
  // components see the latest access/refresh tokens.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieOptions;
          }[],
        ) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Resolve workspace + role + subscription + modules.
  // Note: we avoid an embed because `users` has two FKs to `workspaces`
  // (workspace_id and workspaces.owner_user_id), which PostgREST refuses
  // to disambiguate. Three small parallel queries are cheap anyway.
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("workspace_id, role, is_super_admin, staff_role")
    .eq("id", user.id)
    .single<{
      workspace_id: string | null;
      role: string;
      is_super_admin: boolean | null;
      staff_role: string | null;
    }>();

  if (!profile?.workspace_id) {
    if (profileError) {
      console.error("[proxy] profile query error:", profileError.message);
    }
    if (pathname.startsWith("/onboarding") || pathname.startsWith("/api/auth/signout")) {
      return response;
    }
    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = "/onboarding";
    return NextResponse.redirect(onboardingUrl);
  }

  // Authenticated with workspace — /onboarding is a no-op, send them home.
  if (pathname.startsWith("/onboarding")) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  const workspaceId = profile.workspace_id;
  const role = profile.role;
  const isSuperAdmin = Boolean(profile.is_super_admin);
  const staffRole = profile.staff_role;
  const isInternalStaff = isSuperAdmin || (staffRole !== null && staffRole !== "");

  // /super-admin is open to any internal staff; non-staff are bounced.
  if (pathname.startsWith("/super-admin") && !isInternalStaff) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    dashUrl.searchParams.set("forbidden", "1");
    return NextResponse.redirect(dashUrl);
  }
  // Super admins also bypass plan/module checks for the rest of the app.
  if (isSuperAdmin) {
    response.headers.set("x-workspace-id", workspaceId);
    response.headers.set("x-user-role", role);
    response.headers.set("x-super-admin", "1");
    return response;
  }

  const [{ data: subRow }, { data: modulesRaw }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("status, trial_end, current_period_end")
      .eq("workspace_id", workspaceId)
      .limit(1)
      .maybeSingle<{
        status: string;
        trial_end: string | null;
        current_period_end: string | null;
      }>(),
    supabase
      .from("workspace_modules")
      .select("enabled, modules(slug)")
      .eq("workspace_id", workspaceId),
  ]);

  const sub = subRow;
  const modulesRows = (modulesRaw ?? []) as unknown as {
    enabled: boolean;
    modules: { slug: string } | null;
  }[];
  const modules = modulesRows
    .filter((r) => r.enabled && r.modules)
    .map((r) => r.modules!.slug);

  const subStatus = sub?.status ?? "incomplete";
  const periodEnd = sub?.current_period_end ?? null;

  const isValidSubscription = (() => {
    if (subStatus === "active" || subStatus === "trialing") return true;
    if (subStatus === "past_due" && periodEnd) {
      const daysOverdue =
        (Date.now() - new Date(periodEnd).getTime()) / (1000 * 60 * 60 * 24);
      return daysOverdue < 7;
    }
    return false;
  })();

  if (!isValidSubscription && !isAlwaysAllowed(pathname)) {
    const billingUrl = request.nextUrl.clone();
    billingUrl.pathname = "/configuracoes/billing";
    billingUrl.searchParams.set("expired", "1");
    return NextResponse.redirect(billingUrl);
  }

  if (!isAlwaysAllowed(pathname)) {
    const requiredModule = matchModuleForPath(pathname);
    if (requiredModule && !modules.includes(requiredModule)) {
      const upgradeUrl = request.nextUrl.clone();
      upgradeUrl.pathname = "/upgrade";
      upgradeUrl.searchParams.set("module", requiredModule);
      upgradeUrl.searchParams.set("from", pathname);
      return NextResponse.rewrite(upgradeUrl);
    }
  }

  response.headers.set("x-workspace-id", workspaceId);
  response.headers.set("x-user-role", role);
  response.headers.set("x-subscription-status", subStatus);

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets, images, favicons, and the
     * raw webhook endpoints (which need to bypass auth entirely).
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/cron).*)",
  ],
};
