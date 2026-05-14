import "server-only";

export interface DealAuditEntry {
  id: string;
  event_type: string;
  field: string | null;
  old_value: unknown;
  new_value: unknown;
  actor_user_id: string | null;
  actor_name: string | null;
  created_at: string;
}

/**
 * Histórico de mudanças do negócio (deal_audit_log).
 * Resolve actor_user_id para nome do usuário.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDealHistory(sb: any, dealId: string): Promise<DealAuditEntry[]> {
  const { data } = await sb
    .from("deal_audit_log")
    .select("id, event_type, field, old_value, new_value, actor_user_id, created_at")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (data ?? []) as Omit<DealAuditEntry, "actor_name">[];

  const actorIds = Array.from(
    new Set(rows.map((r) => r.actor_user_id).filter(Boolean) as string[]),
  );
  const nameById = new Map<string, string>();
  if (actorIds.length > 0) {
    const { data: users } = await sb
      .from("users")
      .select("id, name")
      .in("id", actorIds);
    for (const u of (users ?? []) as { id: string; name: string | null }[]) {
      if (u.name) nameById.set(u.id, u.name);
    }
  }

  return rows.map((r) => ({
    ...r,
    actor_name: r.actor_user_id ? nameById.get(r.actor_user_id) ?? null : null,
  }));
}
