import type { ReactNode } from "react";
import { getSession } from "@/lib/auth/guards";
import { getWorkspaceAccess } from "@/lib/billing/feature-gate";
import { getBranding } from "@/lib/queries/branding";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { TrialBanner } from "@/components/billing/trial-banner";

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  const [access, branding] = await Promise.all([
    getWorkspaceAccess(session.workspaceId),
    getBranding(session.supabase, session.workspaceId),
  ]);
  const activeModules = access?.modules ?? ["crm"];

  return (
    <div
      className="h-dvh overflow-hidden bg-[color:var(--bg)] text-[color:var(--ink)]"
      style={
        {
          "--accent": branding.accent_color,
          ...(branding.accent_color_light
            ? { "--accent-light": branding.accent_color_light }
            : {}),
        } as React.CSSProperties
      }
    >
      <div className="flex h-full">
        <Sidebar
          activeModules={activeModules}
          workspaceName={session.workspaceName}
          logoUrl={branding.logo_icon_url ?? branding.logo_url ?? null}
        />
        <div className="flex h-full min-w-0 flex-1 flex-col">
          {access?.isTrialing && (
            <TrialBanner
              daysLeft={access.trialDaysLeft}
              basketName={access.basketName}
            />
          )}
          <Topbar
            workspaceName={session.workspaceName}
            planName={access?.basketName ?? null}
            isTrial={access?.isTrialing ?? false}
            user={{
              name: session.profile.name,
              email: session.profile.email,
              avatarUrl: session.profile.avatar_url,
            }}
            activeModules={activeModules}
            logoUrl={branding.logo_icon_url ?? null}
            isSuperAdmin={session.isSuperAdmin}
            isInternalStaff={session.isInternalStaff}
            staffRoleLabel={
              session.staffRole
                ? ({
                    admin: "Admin",
                    engineering: "Engenharia",
                    customer_success: "CS",
                    support: "Suporte",
                    sales: "Vendas",
                  } as Record<string, string>)[session.staffRole]
                : undefined
            }
          />
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
