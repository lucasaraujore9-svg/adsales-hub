import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/**
 * Verifica se um evento de webhook já foi processado anteriormente.
 *
 * Use ANTES de processar pagamentos/eventos críticos para evitar
 * processar duas vezes em retries do gateway.
 *
 * Tabela `webhook_events_processed` não está nos tipos gerados ainda;
 * usamos cast para evitar friction até `npm run supabase:gen-types`.
 */
export async function isAlreadyProcessed(
  provider: string,
  eventId: string,
): Promise<boolean> {
  if (!eventId) return false;
  const admin = createAdminSupabaseClient() as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: unknown) => {
          eq: (col: string, val: unknown) => {
            maybeSingle: () => Promise<{ data: { id: string } | null }>;
          };
        };
      };
      insert: (body: Record<string, unknown>) => Promise<{
        error: { message?: string } | null;
      }>;
    };
  };
  const { data } = await admin
    .from("webhook_events_processed")
    .select("id")
    .eq("provider", provider)
    .eq("event_id", eventId)
    .maybeSingle();
  return !!data;
}

/**
 * Marca um evento como processado. Chame APÓS o processamento bem-sucedido.
 *
 * Em caso de race condition (duas chamadas simultâneas), a segunda falha
 * com erro de unique constraint — esperado e silencioso.
 */
export async function markProcessed(
  provider: string,
  eventId: string,
  opts?: {
    eventType?: string;
    workspaceId?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  if (!eventId) return;
  const admin = createAdminSupabaseClient() as unknown as {
    from: (table: string) => {
      insert: (body: Record<string, unknown>) => Promise<{
        error: { message?: string } | null;
      }>;
    };
  };
  const { error } = await admin.from("webhook_events_processed").insert({
    provider,
    event_id: eventId,
    event_type: opts?.eventType ?? null,
    workspace_id: opts?.workspaceId ?? null,
    metadata: opts?.metadata ?? {},
  });
  // Ignora unique violation (já foi marcado por outra chamada concorrente)
  if (error && !error.message?.toLowerCase().includes("duplicate")) {
    console.error(`[idempotency] failed to mark ${provider}:${eventId}`, error);
  }
}
