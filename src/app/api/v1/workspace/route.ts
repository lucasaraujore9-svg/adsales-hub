import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest, getAdmin } from "@/lib/api/auth";

interface SubscriptionRow {
  status: string;
  trial_end: string | null;
  current_period_end: string | null;
  baskets: { name: string; slug: string | null } | null;
}

interface ModuleRow {
  enabled: boolean;
  modules: { slug: string; name: string | null; is_active: boolean } | null;
}

interface BrandingRow {
  accent_color: string | null;
  accent_color_light: string | null;
  logo_url: string | null;
  logo_icon_url: string | null;
  secondary_color: string | null;
  favicon_url: string | null;
}

interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  subdomain: string | null;
  timezone: string;
  locale: string;
  currency: string;
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, "contacts:read");
  if ("response" in auth) return auth.response;
  const sb = getAdmin();
  const wid = auth.ctx.workspaceId;

  const [
    { data: workspace },
    { data: subRows },
    { data: moduleRows },
    { data: brandingRow },
  ] = await Promise.all([
    sb
      .from("workspaces")
      .select("id, name, slug, domain, subdomain, timezone, locale, currency")
      .eq("id", wid)
      .maybeSingle(),
    sb
      .from("subscriptions")
      .select("status, trial_end, current_period_end, baskets(name, slug)")
      .eq("workspace_id", wid)
      .limit(1),
    sb
      .from("workspace_modules")
      .select("enabled, modules(slug, name, is_active)")
      .eq("workspace_id", wid),
    sb
      .from("workspace_branding")
      .select(
        "accent_color, accent_color_light, logo_url, logo_icon_url, secondary_color, favicon_url",
      )
      .eq("workspace_id", wid)
      .maybeSingle(),
  ]);

  if (!workspace) {
    return NextResponse.json({ ok: false, error: "Workspace not found" }, { status: 404 });
  }
  const ws = workspace as WorkspaceRow;
  const sub = (subRows?.[0] ?? null) as SubscriptionRow | null;
  const branding = (brandingRow ?? null) as BrandingRow | null;

  const modules = ((moduleRows ?? []) as unknown as ModuleRow[])
    .filter((r) => r.enabled && r.modules?.is_active)
    .map((r) => ({ slug: r.modules!.slug, name: r.modules!.name }));

  const trialDaysLeft = sub?.trial_end
    ? Math.max(
        0,
        Math.ceil((new Date(sub.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      )
    : 0;

  return NextResponse.json({
    ok: true,
    data: {
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      domain: ws.domain,
      subdomain: ws.subdomain,
      timezone: ws.timezone,
      locale: ws.locale,
      currency: ws.currency,
      subscription: sub
        ? {
            status: sub.status,
            basket: sub.baskets?.name ?? null,
            basket_slug: sub.baskets?.slug ?? null,
            trial_end: sub.trial_end,
            trial_days_left: trialDaysLeft,
            period_end: sub.current_period_end,
          }
        : null,
      modules,
      branding: branding
        ? {
            accent_color: branding.accent_color,
            accent_color_light: branding.accent_color_light,
            logo_url: branding.logo_url,
            logo_icon_url: branding.logo_icon_url,
            secondary_color: branding.secondary_color,
            favicon_url: branding.favicon_url,
          }
        : null,
      api_key: {
        scopes: auth.ctx.scopes,
      },
    },
  });
}
