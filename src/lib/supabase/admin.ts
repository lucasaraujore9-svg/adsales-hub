import "server-only";

import { createClient } from "@supabase/supabase-js";
import { publicEnv, requireServerEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/database.types";

let cached: ReturnType<typeof createClient<Database>> | null = null;

export function createAdminSupabaseClient() {
  if (cached) return cached;
  cached = createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    requireServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
  return cached;
}

/**
 * Calls a Postgres RPC via the admin client without losing `this` binding.
 *
 * IMPORTANT: do not write `const rpc = admin.rpc as ...; rpc(...)`. The Supabase
 * SDK's `rpc` method depends on `this.rest` internally, so detaching it throws
 * `Cannot read properties of undefined (reading 'rest')`. Use this helper or
 * call `admin.rpc(...)` directly with method-style invocation.
 */
type RpcLikeClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};

export async function adminRpc(
  fn: string,
  args: Record<string, unknown>,
): Promise<{ data: unknown; error: { message: string } | null }> {
  const client = createAdminSupabaseClient() as unknown as RpcLikeClient;
  return client.rpc(fn, args);
}

export async function rpcOnClient(
  client: { rpc: RpcLikeClient["rpc"] } | unknown,
  fn: string,
  args: Record<string, unknown>,
): Promise<{ data: unknown; error: { message: string } | null }> {
  const c = client as unknown as RpcLikeClient;
  return c.rpc(fn, args);
}
