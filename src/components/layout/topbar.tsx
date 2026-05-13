import Link from "next/link";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlobalSearch } from "@/components/layout/global-search";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { ThemeToggle } from "@/components/theme-toggle";

interface Props {
  workspaceName: string;
  planName: string | null;
  isTrial: boolean;
  user: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  activeModules: string[];
  logoUrl?: string | null;
  isSuperAdmin?: boolean;
  isInternalStaff?: boolean;
  staffRoleLabel?: string;
}

export function Topbar({
  workspaceName,
  planName,
  isTrial,
  user,
  activeModules,
  logoUrl,
  isSuperAdmin,
  isInternalStaff,
  staffRoleLabel,
}: Props) {
  void logoUrl;
  const showStaffBadge = Boolean(isSuperAdmin || isInternalStaff);
  const badgeLabel = isSuperAdmin ? "Super admin" : (staffRoleLabel ?? "Equipe");
  return (
    <header className="z-30 flex h-14 shrink-0 items-center gap-3 border-b border-[color:var(--line)] bg-[color:var(--bg)]/95 px-4 backdrop-blur">
      <MobileDrawer activeModules={activeModules} workspaceName={workspaceName} />

      <div className="hidden items-center gap-2 md:flex">
        <span className="text-sm font-medium">{workspaceName}</span>
        {planName && (
          <Badge
            variant="outline"
            className="border-[color:var(--line-2)] text-[10px] uppercase tracking-kicker"
          >
            {isTrial ? "Trial · " : ""}
            {planName}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 justify-center">
        <GlobalSearch />
      </div>

      {showStaffBadge && (
        <Link
          href="/super-admin"
          className="hidden items-center gap-1.5 rounded-pill border border-[color:var(--bad)]/40 bg-[color:var(--bad)]/10 px-3 py-1 text-[11px] font-medium uppercase tracking-kicker text-[color:var(--bad)] transition-colors hover:bg-[color:var(--bad)]/15 md:inline-flex"
          title="Painel interno"
        >
          <Shield className="h-3 w-3" />
          {badgeLabel}
        </Link>
      )}
      <ThemeToggle />
      <NotificationBell />
      <UserMenu
        name={user.name}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />
    </header>
  );
}
