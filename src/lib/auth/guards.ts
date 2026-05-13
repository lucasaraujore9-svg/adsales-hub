import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import {
  hasPermission,
  isValidRole,
  type Permission,
  type Role,
} from "@/lib/auth/roles";

type ServerSupabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export interface AuthContext {
  user: User;
  supabase: ServerSupabase;
}

export type StaffRole =
  | "support"
  | "customer_success"
  | "sales"
  | "engineering"
  | "admin";

export interface SessionContext {
  user: User;
  supabase: ServerSupabase;
  workspaceId: string;
  workspaceName: string;
  role: Role;
  isSuperAdmin: boolean;
  staffRole: StaffRole | null;
  isInternalStaff: boolean;
  profile: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
  };
}

const STAFF_ROLES: readonly StaffRole[] = [
  "support",
  "customer_success",
  "sales",
  "engineering",
  "admin",
] as const;

function asStaffRole(value: unknown): StaffRole | null {
  return typeof value === "string" && (STAFF_ROLES as readonly string[]).includes(value)
    ? (value as StaffRole)
    : null;
}

/**
 * Ensures the request has a valid Supabase session.
 * Redirects to /login when unauthenticated.
 */
export const requireAuth = cache(async (): Promise<AuthContext> => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/login");
  }
  return { user, supabase };
});

/**
 * Like requireAuth but also hydrates the workspace + role from public.users.
 * Redirects to /login when the row is missing (unexpected) or unauthenticated.
 */
export const getSession = cache(async (): Promise<SessionContext> => {
  const { user, supabase } = await requireAuth();

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, email, name, avatar_url, role, workspace_id, is_super_admin, staff_role")
    .eq("id", user.id)
    .single<{
      id: string;
      email: string;
      name: string | null;
      avatar_url: string | null;
      role: string;
      workspace_id: string;
      is_super_admin: boolean | null;
      staff_role: string | null;
    }>();

  if (error || !profile) {
    redirect("/login");
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", profile.workspace_id)
    .maybeSingle<{ name: string }>();

  const role = isValidRole(profile.role) ? profile.role : "visualizador";

  const staffRole = asStaffRole(profile.staff_role);
  const isSuperAdmin = Boolean(profile.is_super_admin);

  return {
    user,
    supabase,
    workspaceId: profile.workspace_id,
    workspaceName: workspace?.name ?? "Workspace",
    role,
    isSuperAdmin,
    staffRole,
    isInternalStaff: isSuperAdmin || staffRole !== null,
    profile: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar_url: profile.avatar_url,
    },
  };
});

/**
 * Like getSession but redirects non-super-admins to /dashboard.
 */
export async function requireSuperAdmin(): Promise<SessionContext> {
  const session = await getSession();
  if (!session.isSuperAdmin) {
    redirect("/dashboard?forbidden=1");
  }
  return session;
}

/**
 * Allows any internal staff (super_admin OR users with staff_role set).
 * Use for /super-admin pages that should be accessible to support/CS too.
 */
export async function requireStaff(): Promise<SessionContext> {
  const session = await getSession();
  if (!session.isInternalStaff) {
    redirect("/dashboard?forbidden=1");
  }
  return session;
}

/**
 * Capability check used by sensitive actions (grant credits, change plan,
 * promote super admin). Tweak the matrix as the team grows.
 */
export function staffCan(
  session: Pick<SessionContext, "isSuperAdmin" | "staffRole">,
  capability:
    | "view_workspaces"
    | "edit_workspace"
    | "grant_credits"
    | "change_plan"
    | "manage_super_admin"
    | "manage_staff"
    | "manage_integrations",
): boolean {
  if (session.isSuperAdmin) return true;
  const role = session.staffRole;
  if (role === "admin") return capability !== "manage_super_admin";
  if (role === "engineering") {
    return capability !== "manage_super_admin";
  }
  if (role === "customer_success") {
    return ["view_workspaces", "edit_workspace", "grant_credits", "change_plan"].includes(
      capability,
    );
  }
  if (role === "support") {
    return ["view_workspaces"].includes(capability);
  }
  if (role === "sales") {
    return ["view_workspaces", "edit_workspace"].includes(capability);
  }
  return false;
}

export async function requireRole(...roles: Role[]): Promise<SessionContext> {
  const session = await getSession();
  if (!roles.includes(session.role)) {
    redirect("/dashboard?forbidden=1");
  }
  return session;
}

export async function requirePermission(
  permission: Permission,
): Promise<SessionContext> {
  const session = await getSession();
  if (!hasPermission(session.role, permission)) {
    redirect("/dashboard?forbidden=1");
  }
  return session;
}

export async function requireWorkspaceAdmin(): Promise<SessionContext> {
  return requireRole("admin");
}
