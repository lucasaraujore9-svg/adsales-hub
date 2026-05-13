import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function listWorkspaceInvoices(workspaceId: string) {
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("invoices")
    .select(
      "id, number, amount, currency, status, payment_method, pdf_url, hosted_invoice_url, due_date, paid_at, created_at",
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
