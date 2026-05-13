"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireStaff, requireSuperAdmin, staffCan } from "@/lib/auth/guards";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { recordCreditPurchase } from "@/lib/billing/credits";

export type ActionResult<T = unknown> = { ok: boolean; data?: T; error?: string };

const STAFF_ROLES = ["support", "customer_success", "sales", "engineering", "admin"] as const;
const WORKSPACE_ROLES = ["admin", "gestor", "vendedor", "media_buyer", "visualizador"] as const;

type RelaxedClient = {
  from: (t: string) => {
    update: (body: unknown) => {
      eq: (col: string, val: unknown) => Promise<{ error: { message: string } | null }>;
    };
    upsert: (
      body: unknown,
      opts?: { onConflict?: string },
    ) => Promise<{ error: { message: string } | null }>;
  };
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};

function adm(): RelaxedClient {
  return createAdminSupabaseClient() as unknown as RelaxedClient;
}

const grantSchema = z.object({
  workspace_id: z.string().uuid(),
  amount: z.number().int().min(1).max(1_000_000),
  note: z.string().max(500).optional(),
});

export async function grantCredits(input: unknown): Promise<ActionResult<{ balance: number }>> {
  const parsed = grantSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await requireStaff();
  if (!staffCan(session, "grant_credits")) {
    return { ok: false, error: "Sem permissao para conceder creditos." };
  }

  const result = await recordCreditPurchase({
    workspaceId: parsed.data.workspace_id,
    amount: parsed.data.amount,
    referenceId: `super_admin:${session.user.id}:${Date.now()}`,
    meta: {
      granted_by: session.user.id,
      note: parsed.data.note ?? null,
      type: "super_admin_grant",
    },
  });
  if (!result.ok) return { ok: false, error: "Falha ao conceder creditos" };

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/workspaces");
  return { ok: true, data: { balance: result.balance ?? 0 } };
}

const toggleUnlimitedSchema = z.object({
  workspace_id: z.string().uuid(),
  unlimited: z.boolean(),
});

export async function toggleUnlimitedCredits(
  input: unknown,
): Promise<ActionResult> {
  const parsed = toggleUnlimitedSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await requireStaff();
  if (!staffCan(session, "grant_credits")) {
    return { ok: false, error: "Sem permissao." };
  }

  const { error } = await adm()
    .from("workspace_credits")
    .upsert(
      { workspace_id: parsed.data.workspace_id, unlimited: parsed.data.unlimited },
      { onConflict: "workspace_id" },
    );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/super-admin");
  revalidatePath("/super-admin/workspaces");
  return { ok: true };
}

const toggleSuperAdminSchema = z.object({
  user_id: z.string().uuid(),
  is_super_admin: z.boolean(),
});

export async function toggleSuperAdmin(
  input: unknown,
): Promise<ActionResult> {
  const parsed = toggleSuperAdminSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await requireSuperAdmin();

  // Prevent self-demotion to avoid lockout
  if (parsed.data.user_id === session.user.id && !parsed.data.is_super_admin) {
    return { ok: false, error: "Voce nao pode remover seu proprio status de super admin." };
  }

  const { error } = await adm()
    .from("users")
    .update({ is_super_admin: parsed.data.is_super_admin })
    .eq("id", parsed.data.user_id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/super-admin/users");
  return { ok: true };
}

const setBasketSchema = z.object({
  workspace_id: z.string().uuid(),
  basket_name: z.enum(["operacao", "crescimento", "escala", "custom", "master"]),
});

export async function setWorkspaceBasket(
  input: unknown,
): Promise<ActionResult> {
  const parsed = setBasketSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await requireStaff();
  if (!staffCan(session, "change_plan")) {
    return { ok: false, error: "Sem permissao." };
  }

  const supa = adm();
  const { data: basketData, error: basketErr } = await supa.rpc(
    "_internal_get_basket_id",
    { p_name: parsed.data.basket_name },
  );
  // Fallback: query the basket id directly
  let basketId: string | null = null;
  if (!basketErr && basketData && typeof basketData === "string") {
    basketId = basketData;
  } else {
    const { data } = await (createAdminSupabaseClient() as unknown as {
      from: (t: string) => {
        select: (cols: string) => {
          eq: (c: string, v: unknown) => {
            maybeSingle: () => Promise<{ data: unknown }>;
          };
        };
      };
    })
      .from("baskets")
      .select("id")
      .eq("name", parsed.data.basket_name)
      .maybeSingle();
    basketId = (data as { id?: string } | null)?.id ?? null;
  }
  if (!basketId) return { ok: false, error: "Basket nao encontrado" };

  const { error } = await supa.from("subscriptions").upsert(
    {
      workspace_id: parsed.data.workspace_id,
      basket_id: basketId,
      status: "active",
      trial_end: null,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(
        Date.now() + (parsed.data.basket_name === "master"
          ? 100 * 365 * 86400_000
          : 30 * 86400_000),
      ).toISOString(),
    },
    { onConflict: "workspace_id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/super-admin/workspaces");
  return { ok: true };
}

// ----------------------------------------------------------------------------
// Workspace edit (general info)
// ----------------------------------------------------------------------------
const slugRe = /^[a-z0-9](?:[a-z0-9-]{0,40}[a-z0-9])?$/;
const updateWorkspaceSchema = z.object({
  workspace_id: z.string().uuid(),
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(42).regex(slugRe, "slug invalido"),
  domain: z.string().max(120).optional().nullable(),
  timezone: z.string().min(2).max(60),
  locale: z.string().min(2).max(10),
});

export async function updateWorkspace(input: unknown): Promise<ActionResult> {
  const parsed = updateWorkspaceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await requireStaff();
  if (!staffCan(session, "edit_workspace")) {
    return { ok: false, error: "Sem permissao." };
  }

  const { error } = await adm()
    .from("workspaces")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      domain: parsed.data.domain ?? null,
      timezone: parsed.data.timezone,
      locale: parsed.data.locale,
    })
    .eq("id", parsed.data.workspace_id);
  if (error) {
    if (error.message?.includes("workspaces_slug_key")) {
      return { ok: false, error: "Slug ja em uso." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/super-admin/workspaces");
  revalidatePath(`/super-admin/workspaces/${parsed.data.workspace_id}`);
  return { ok: true };
}

// ----------------------------------------------------------------------------
// Workspace member management
// ----------------------------------------------------------------------------
const setWorkspaceUserRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(WORKSPACE_ROLES),
});

export async function setWorkspaceUserRole(input: unknown): Promise<ActionResult> {
  const parsed = setWorkspaceUserRoleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await requireStaff();
  if (!staffCan(session, "edit_workspace")) {
    return { ok: false, error: "Sem permissao." };
  }

  const { error } = await adm()
    .from("users")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.user_id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/super-admin/workspaces");
  return { ok: true };
}

const setUserActiveSchema = z.object({
  user_id: z.string().uuid(),
  is_active: z.boolean(),
});

export async function setUserActive(input: unknown): Promise<ActionResult> {
  const parsed = setUserActiveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await requireStaff();
  if (!staffCan(session, "edit_workspace")) {
    return { ok: false, error: "Sem permissao." };
  }

  const { error } = await adm()
    .from("users")
    .update({ is_active: parsed.data.is_active })
    .eq("id", parsed.data.user_id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/super-admin/workspaces");
  return { ok: true };
}

// ----------------------------------------------------------------------------
// Staff role management (super_admin only — controls internal team)
// ----------------------------------------------------------------------------
const setStaffRoleSchema = z.object({
  user_id: z.string().uuid(),
  staff_role: z.enum(STAFF_ROLES).nullable(),
});

export async function setStaffRole(input: unknown): Promise<ActionResult> {
  const parsed = setStaffRoleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await requireSuperAdmin();
  if (parsed.data.user_id === session.user.id && parsed.data.staff_role === null) {
    return { ok: false, error: "Nao remova seu proprio acesso de equipe." };
  }
  const { error } = await adm()
    .from("users")
    .update({ staff_role: parsed.data.staff_role })
    .eq("id", parsed.data.user_id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/super-admin/staff");
  revalidatePath("/super-admin/users");
  return { ok: true };
}

// ----------------------------------------------------------------------------
// Disconnect external account (ad_account / social_account)
// ----------------------------------------------------------------------------
const disconnectSchema = z.object({
  scope: z.enum(["ad_account", "social_account"]),
  id: z.string().uuid(),
});

export async function disconnectIntegration(input: unknown): Promise<ActionResult> {
  const parsed = disconnectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.message };
  const session = await requireStaff();
  if (!staffCan(session, "manage_integrations")) {
    return { ok: false, error: "Sem permissao para gerenciar integracoes." };
  }

  const table = parsed.data.scope === "ad_account" ? "ad_accounts" : "social_accounts";
  const { error } = await adm()
    .from(table)
    .update({
      status: "disconnected",
      access_token_encrypted: null,
      refresh_token_encrypted: null,
    })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/super-admin/workspaces");
  return { ok: true };
}
