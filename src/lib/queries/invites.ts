import "server-only";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export interface PendingInvite {
  id: string;
  email: string;
  role: string;
  name: string | null;
  invited_at: string;
  invited_by: string | null;
  invited_by_name: string | null;
}

interface RawAuthUser {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  invited_at?: string | null;
  created_at?: string;
  user_metadata?: {
    workspace_id?: string;
    role?: string;
    name?: string;
    invited_by?: string;
  };
}

/**
 * Lista convites pendentes do workspace (auth.users com email não-confirmado).
 *
 * Como o sistema usa Supabase Auth Admin para convites, não há tabela
 * dedicada. Filtramos pelo metadata.workspace_id e email_confirmed_at IS NULL.
 */
export async function listPendingInvites(
  workspaceId: string,
): Promise<PendingInvite[]> {
  const admin = createAdminSupabaseClient();

  // Lista todos os users (paginado). Para workspaces grandes, esse loop pode
  // ser custoso; aceitável para MVP.
  const allUsers: RawAuthUser[] = [];
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) break;
    const users = (data?.users ?? []) as unknown as RawAuthUser[];
    allUsers.push(...users);
    if (users.length < perPage) break;
    page += 1;
    if (page > 25) break; // safety bound: 5000 users
  }

  const pending = allUsers.filter(
    (u) =>
      u.user_metadata?.workspace_id === workspaceId &&
      !u.email_confirmed_at &&
      !!u.email,
  );

  // Resolve nome do convidador
  const inviterIds = Array.from(
    new Set(pending.map((u) => u.user_metadata?.invited_by).filter(Boolean) as string[]),
  );
  const inviterNames = new Map<string, string>();
  if (inviterIds.length > 0) {
    const adminSb = createAdminSupabaseClient() as unknown as {
      from: (t: string) => {
        select: (cols: string) => {
          in: (col: string, vals: string[]) => Promise<{
            data: Array<{ id: string; name: string | null }> | null;
          }>;
        };
      };
    };
    const { data: rows } = await adminSb
      .from("users")
      .select("id, name")
      .in("id", inviterIds);
    for (const r of rows ?? []) {
      if (r.id && r.name) inviterNames.set(r.id, r.name);
    }
  }

  return pending.map((u) => ({
    id: u.id,
    email: u.email!,
    role: u.user_metadata?.role ?? "vendedor",
    name: u.user_metadata?.name ?? null,
    invited_at: u.invited_at ?? u.created_at ?? new Date().toISOString(),
    invited_by: u.user_metadata?.invited_by ?? null,
    invited_by_name: u.user_metadata?.invited_by
      ? inviterNames.get(u.user_metadata.invited_by) ?? null
      : null,
  }));
}
