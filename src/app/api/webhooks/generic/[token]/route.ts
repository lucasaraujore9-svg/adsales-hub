import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Generic webhook receiver — accepts any JSON/form submission and logs it
 * against a workspace identified by a deterministic token. Used by Typeform,
 * Google Forms, Elementor, or any custom landing page.
 *
 * URL: /api/webhooks/generic/{token}
 * The token is the share_token of a form row (set during creation). The
 * incoming payload is stored in form_submissions and optionally spawned as a
 * deal + contact, matching the Meta leadgen flow.
 */
export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const admin = createAdminSupabaseClient();

  // Locate a form by matching the token (use form.slug as simple join key for now)
  const { data: formRaw } = await admin
    .from("forms")
    .select("id, workspace_id")
    .eq("slug", token)
    .maybeSingle();
  const form = formRaw as unknown as { id: string; workspace_id: string } | null;
  if (!form) {
    return NextResponse.json({ error: "form_not_found" }, { status: 404 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const payload: Record<string, unknown> =
    contentType.includes("application/json")
      ? (await request.json().catch(() => ({})))
      : Object.fromEntries(
          (await request.formData().catch(() => new FormData())).entries(),
        );

  const email = String(payload.email ?? payload.Email ?? "");
  const name = String(payload.name ?? payload.full_name ?? payload.nome ?? email);
  const phone = String(payload.phone ?? payload.telefone ?? payload.whatsapp ?? "");

  let contactId: string | null = null;
  if (email) {
    const { data: existing } = await admin
      .from("contacts")
      .select("id")
      .eq("workspace_id", form.workspace_id)
      .eq("email", email)
      .maybeSingle();
    if ((existing as unknown as { id: string } | null)?.id) {
      contactId = (existing as unknown as { id: string }).id;
    } else {
      const { data: created } = await admin
        .from("contacts")
        .insert({
          workspace_id: form.workspace_id,
          name,
          email,
          phone,
          whatsapp: phone,
          source: "website",
          lifecycle_stage: "lead",
        } as never)
        .select("id")
        .single();
      contactId = (created as unknown as { id: string })?.id ?? null;
    }
  }

  await admin.from("form_submissions").insert({
    workspace_id: form.workspace_id,
    form_id: form.id,
    landing_page_id: null,
    data: payload,
    utm_source: String(payload.utm_source ?? ""),
    utm_medium: String(payload.utm_medium ?? ""),
    utm_campaign: String(payload.utm_campaign ?? ""),
    contact_id: contactId,
  } as never);

  return NextResponse.json({ received: true, contact_id: contactId });
}
