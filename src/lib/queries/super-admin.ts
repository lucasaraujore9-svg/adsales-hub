import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type AdminClient = {
  from: (t: string) => {
    select: (cols: string, opts?: { count?: "exact"; head?: boolean }) => {
      eq: (col: string, val: unknown) => Promise<{ data: unknown; count?: number | null }>;
      order: (col: string, opts?: { ascending?: boolean }) => {
        limit: (n: number) => Promise<{ data: unknown }>;
      };
    } & Promise<{ count: number | null; data: unknown }>;
  };
};

function client(): AdminClient {
  return createAdminSupabaseClient() as unknown as AdminClient;
}

export interface SystemOverview {
  workspaceCount: number;
  userCount: number;
  superAdminCount: number;
  postCount: number;
  publishedPostCount: number;
  scheduledPostCount: number;
  totalCreditsBalance: number;
  totalCreditsSpent: number;
  totalCreditsPurchased: number;
  unlimitedWorkspaces: number;
  pendingPurchases: number;
}

export async function getSystemOverview(): Promise<SystemOverview> {
  const sb = client();
  const counts = await Promise.all([
    sb.from("workspaces").select("id", { count: "exact", head: true }),
    sb.from("users").select("id", { count: "exact", head: true }),
    sb.from("users").select("id", { count: "exact", head: true }).eq("is_super_admin", true),
    sb.from("social_posts").select("id", { count: "exact", head: true }),
    sb.from("social_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
    sb.from("social_posts").select("id", { count: "exact", head: true }).eq("status", "scheduled"),
    sb.from("workspace_credits").select("id", { count: "exact", head: true }).eq("unlimited", true),
    sb.from("credit_purchases").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  // sums via direct query (small dataset)
  const { data: bals } = await sb
    .from("workspace_credits")
    .select("balance, total_spent, total_purchased") as unknown as {
      data: { balance: number; total_spent: number; total_purchased: number }[] | null;
    };
  const sums = (bals ?? []).reduce(
    (acc, r) => ({
      bal: acc.bal + (r.balance ?? 0),
      spent: acc.spent + (r.total_spent ?? 0),
      purchased: acc.purchased + (r.total_purchased ?? 0),
    }),
    { bal: 0, spent: 0, purchased: 0 },
  );

  const num = (i: number) =>
    (counts[i] as unknown as { count: number | null }).count ?? 0;

  return {
    workspaceCount: num(0),
    userCount: num(1),
    superAdminCount: num(2),
    postCount: num(3),
    publishedPostCount: num(4),
    scheduledPostCount: num(5),
    unlimitedWorkspaces: num(6),
    pendingPurchases: num(7),
    totalCreditsBalance: sums.bal,
    totalCreditsSpent: sums.spent,
    totalCreditsPurchased: sums.purchased,
  };
}

export interface WorkspaceListRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  user_count: number;
  basket_name: string | null;
  subscription_status: string | null;
  trial_end: string | null;
  credits_balance: number;
  credits_unlimited: boolean;
  credits_monthly_allowance: number;
}

export async function listWorkspaces(): Promise<WorkspaceListRow[]> {
  const sb = client();
  const { data: ws } = await sb
    .from("workspaces")
    .select("id, name, slug, created_at")
    .order("created_at", { ascending: false })
    .limit(200) as unknown as {
      data: { id: string; name: string; slug: string; created_at: string }[] | null;
    };

  const workspaces = ws ?? [];
  if (workspaces.length === 0) return [];

  const [{ data: subs }, { data: credits }, { data: users }] = await Promise.all([
    sb.from("subscriptions").select("workspace_id, status, trial_end, baskets(name)") as unknown as Promise<{
      data: { workspace_id: string; status: string; trial_end: string | null; baskets: { name: string } | null }[] | null;
    }>,
    sb.from("workspace_credits").select("workspace_id, balance, unlimited, monthly_allowance") as unknown as Promise<{
      data: { workspace_id: string; balance: number; unlimited: boolean; monthly_allowance: number }[] | null;
    }>,
    sb.from("users").select("workspace_id") as unknown as Promise<{
      data: { workspace_id: string }[] | null;
    }>,
  ]);

  const subMap = new Map((subs ?? []).map((s) => [s.workspace_id, s]));
  const credMap = new Map((credits ?? []).map((c) => [c.workspace_id, c]));
  const userCounts = new Map<string, number>();
  for (const u of users ?? []) {
    userCounts.set(u.workspace_id, (userCounts.get(u.workspace_id) ?? 0) + 1);
  }

  return workspaces.map((w) => {
    const sub = subMap.get(w.id);
    const cred = credMap.get(w.id);
    return {
      id: w.id,
      name: w.name,
      slug: w.slug,
      created_at: w.created_at,
      user_count: userCounts.get(w.id) ?? 0,
      basket_name: sub?.baskets?.name ?? null,
      subscription_status: sub?.status ?? null,
      trial_end: sub?.trial_end ?? null,
      credits_balance: cred?.balance ?? 0,
      credits_unlimited: Boolean(cred?.unlimited),
      credits_monthly_allowance: cred?.monthly_allowance ?? 0,
    };
  });
}

export interface UserListRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  is_super_admin: boolean;
  workspace_id: string;
  workspace_name: string | null;
  created_at: string;
}

export async function listUsers(): Promise<UserListRow[]> {
  const sb = client();
  const [{ data: users }, { data: ws }] = await Promise.all([
    sb.from("users").select("id, email, name, role, is_super_admin, workspace_id, created_at")
      .order("created_at", { ascending: false }).limit(500) as unknown as Promise<{
        data: {
          id: string; email: string; name: string | null; role: string;
          is_super_admin: boolean | null; workspace_id: string; created_at: string;
        }[] | null;
      }>,
    sb.from("workspaces").select("id, name") as unknown as Promise<{
      data: { id: string; name: string }[] | null;
    }>,
  ]);
  const wsMap = new Map((ws ?? []).map((w) => [w.id, w.name]));
  return (users ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    is_super_admin: Boolean(u.is_super_admin),
    workspace_id: u.workspace_id,
    workspace_name: wsMap.get(u.workspace_id) ?? null,
    created_at: u.created_at,
  }));
}

export interface CreditPurchaseRow {
  id: string;
  workspace_id: string;
  workspace_name: string | null;
  pack_id: string;
  credits: number;
  amount_cents: number;
  gateway: string;
  status: string;
  created_at: string;
  paid_at: string | null;
}

export interface WorkspaceDetail {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  subdomain: string | null;
  timezone: string;
  locale: string;
  currency: string;
  created_at: string;
  owner_user_id: string | null;
  basket_name: string | null;
  subscription_status: string | null;
  subscription_period_end: string | null;
  trial_end: string | null;
  credits: {
    balance: number;
    monthly_allowance: number;
    monthly_allowance_remaining: number;
    total_purchased: number;
    total_spent: number;
    unlimited: boolean;
  };
}

export interface WorkspaceUserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  is_active: boolean;
  is_super_admin: boolean;
  staff_role: string | null;
  created_at: string;
  last_seen_at: string | null;
}

export interface AdAccountRow {
  id: string;
  provider: string;
  account_name: string;
  status: string;
  currency: string | null;
  timezone: string | null;
  created_at: string;
}

export interface SocialAccountSummary {
  id: string;
  platform: string;
  account_name: string;
  status: string;
  token_expires_at: string | null;
}

export interface WebhookSecretRow {
  label: string;
  hint: string;
  configured: boolean;
}

export async function getWorkspaceDetail(
  workspaceId: string,
): Promise<WorkspaceDetail | null> {
  const sb = client() as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (c: string, v: unknown) => {
          maybeSingle: () => Promise<{ data: unknown }>;
        };
      };
    };
  };

  const { data: w } = await sb
    .from("workspaces")
    .select(
      "id, name, slug, domain, subdomain, timezone, locale, currency, created_at, owner_user_id",
    )
    .eq("id", workspaceId)
    .maybeSingle();
  const ws = w as {
    id: string;
    name: string;
    slug: string;
    domain: string | null;
    subdomain: string | null;
    timezone: string;
    locale: string;
    currency: string;
    created_at: string;
    owner_user_id: string | null;
  } | null;
  if (!ws) return null;

  const sb2 = client() as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (c: string, v: unknown) => {
          maybeSingle: () => Promise<{ data: unknown }>;
        };
      };
    };
  };

  const [{ data: subData }, { data: credData }] = await Promise.all([
    sb2
      .from("subscriptions")
      .select("status, current_period_end, trial_end, baskets(name)")
      .eq("workspace_id", workspaceId)
      .maybeSingle(),
    sb2
      .from("workspace_credits")
      .select(
        "balance, monthly_allowance, monthly_allowance_remaining, total_purchased, total_spent, unlimited",
      )
      .eq("workspace_id", workspaceId)
      .maybeSingle(),
  ]);

  const sub = subData as {
    status: string;
    current_period_end: string | null;
    trial_end: string | null;
    baskets: { name: string } | null;
  } | null;
  const cred = credData as {
    balance: number;
    monthly_allowance: number;
    monthly_allowance_remaining: number;
    total_purchased: number;
    total_spent: number;
    unlimited: boolean;
  } | null;

  return {
    ...ws,
    basket_name: sub?.baskets?.name ?? null,
    subscription_status: sub?.status ?? null,
    subscription_period_end: sub?.current_period_end ?? null,
    trial_end: sub?.trial_end ?? null,
    credits: {
      balance: cred?.balance ?? 0,
      monthly_allowance: cred?.monthly_allowance ?? 0,
      monthly_allowance_remaining: cred?.monthly_allowance_remaining ?? 0,
      total_purchased: cred?.total_purchased ?? 0,
      total_spent: cred?.total_spent ?? 0,
      unlimited: Boolean(cred?.unlimited),
    },
  };
}

export async function listWorkspaceUsers(workspaceId: string): Promise<WorkspaceUserRow[]> {
  const sb = client() as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (c: string, v: unknown) => {
          order: (col: string, opts?: { ascending?: boolean }) => Promise<{ data: unknown }>;
        };
      };
    };
  };
  const { data } = await sb
    .from("users")
    .select(
      "id, email, name, role, is_active, is_super_admin, staff_role, created_at, last_seen_at",
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });
  return ((data as unknown as WorkspaceUserRow[] | null) ?? []).map((u) => ({
    ...u,
    is_super_admin: Boolean(u.is_super_admin),
  }));
}

export async function listWorkspaceAdAccounts(workspaceId: string): Promise<AdAccountRow[]> {
  const sb = client() as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (c: string, v: unknown) => {
          order: (col: string, opts?: { ascending?: boolean }) => Promise<{ data: unknown }>;
        };
      };
    };
  };
  const { data } = await sb
    .from("ad_accounts")
    .select("id, provider, account_name, status, currency, timezone, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  return (data as unknown as AdAccountRow[] | null) ?? [];
}

export async function listWorkspaceSocialAccounts(
  workspaceId: string,
): Promise<SocialAccountSummary[]> {
  const sb = client() as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (c: string, v: unknown) => Promise<{ data: unknown }>;
      };
    };
  };
  const { data } = await sb
    .from("social_accounts")
    .select("id, platform, account_name, status, token_expires_at")
    .eq("workspace_id", workspaceId);
  return (data as unknown as SocialAccountSummary[] | null) ?? [];
}

export interface WorkspaceListWithUsersRow extends WorkspaceListRow {}

export async function listInternalStaff(): Promise<UserListRow[]> {
  const sb = client() as unknown as {
    from: (t: string) => {
      select: (cols: string) => {
        not: (col: string, op: string, val: unknown) => {
          order: (col: string, opts?: { ascending?: boolean }) => Promise<{ data: unknown }>;
        };
        or: (
          query: string,
        ) => {
          order: (col: string, opts?: { ascending?: boolean }) => Promise<{ data: unknown }>;
        };
      };
    };
  };
  const { data } = await sb
    .from("users")
    .select("id, email, name, role, is_super_admin, staff_role, workspace_id, created_at")
    .or("is_super_admin.eq.true,staff_role.not.is.null")
    .order("created_at", { ascending: false });

  const users = (data as unknown as
    | {
        id: string;
        email: string;
        name: string | null;
        role: string;
        is_super_admin: boolean | null;
        staff_role: string | null;
        workspace_id: string;
        created_at: string;
      }[]
    | null) ?? [];

  // Workspace name resolution
  const ws = (await (
    client() as unknown as {
      from: (t: string) => {
        select: (cols: string) => Promise<{ data: { id: string; name: string }[] | null }>;
      };
    }
  )
    .from("workspaces")
    .select("id, name")).data ?? [];
  const wsMap = new Map(ws.map((w) => [w.id, w.name]));

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    is_super_admin: Boolean(u.is_super_admin),
    workspace_id: u.workspace_id,
    workspace_name: wsMap.get(u.workspace_id) ?? null,
    created_at: u.created_at,
  }));
}

export async function listRecentPurchases(limit = 50): Promise<CreditPurchaseRow[]> {
  const sb = client();
  const [{ data: rows }, { data: ws }] = await Promise.all([
    sb.from("credit_purchases").select(
      "id, workspace_id, pack_id, credits, amount_cents, gateway, status, created_at, paid_at",
    ).order("created_at", { ascending: false }).limit(limit) as unknown as Promise<{
      data: {
        id: string; workspace_id: string; pack_id: string; credits: number;
        amount_cents: number; gateway: string; status: string; created_at: string; paid_at: string | null;
      }[] | null;
    }>,
    sb.from("workspaces").select("id, name") as unknown as Promise<{
      data: { id: string; name: string }[] | null;
    }>,
  ]);
  const wsMap = new Map((ws ?? []).map((w) => [w.id, w.name]));
  return (rows ?? []).map((r) => ({ ...r, workspace_name: wsMap.get(r.workspace_id) ?? null }));
}
