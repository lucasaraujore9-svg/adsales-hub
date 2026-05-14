import "server-only";

/**
 * Normaliza telefone para formato comparável (apenas dígitos).
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Verifica se um telefone está na lista DNC (Do Not Call) do workspace.
 */
export async function isInDNC(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  workspaceId: string,
  phone: string,
): Promise<boolean> {
  const normalized = normalizePhone(phone);
  if (!normalized) return false;
  const { data } = await admin
    .from("do_not_call_list")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("phone", normalized)
    .maybeSingle();
  return !!data;
}

export type WorkingHours = {
  timezone?: string;
  // Por dia: [hh:mm início, hh:mm fim] ou null/[] = não atende
  mon?: [string, string] | null;
  tue?: [string, string] | null;
  wed?: [string, string] | null;
  thu?: [string, string] | null;
  fri?: [string, string] | null;
  sat?: [string, string] | null;
  sun?: [string, string] | null;
};

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function partsInTz(date: Date, timezone: string): { day: number; hh: string; mm: string } {
  // Usa Intl pra extrair partes no timezone
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return { day: dayMap[wd] ?? 0, hh, mm: hh === "24" ? "00" : mm };
}

/**
 * Retorna true se o horário atual (no timezone configurado) está dentro
 * da janela de operação do SDR IA.
 */
export function isWithinWorkingHours(wh: WorkingHours | null | undefined, now = new Date()): boolean {
  if (!wh) return true; // sem config = sempre permitido
  const tz = wh.timezone ?? "America/Sao_Paulo";
  const { day, hh, mm } = partsInTz(now, tz);
  const range = (wh as Record<string, [string, string] | null | undefined>)[DAYS[day]];
  if (!range || range.length !== 2) return false;
  const t = `${hh}:${mm}`;
  return t >= range[0] && t <= range[1];
}

/**
 * Helper: registra um phone na DNC após "call_request" detectado.
 */
export async function addToDNC(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  params: {
    workspaceId: string;
    phone: string;
    source: "manual" | "self_request" | "call_request" | "bounced_max_attempts";
    reason?: string;
    contactId?: string | null;
    addedByUserId?: string | null;
  },
): Promise<void> {
  const normalized = normalizePhone(params.phone);
  if (!normalized) return;
  await admin
    .from("do_not_call_list")
    .upsert(
      {
        workspace_id: params.workspaceId,
        phone: normalized,
        source: params.source,
        reason: params.reason ?? null,
        contact_id: params.contactId ?? null,
        added_by_user_id: params.addedByUserId ?? null,
      } as never,
      { onConflict: "workspace_id,phone" },
    );
}
