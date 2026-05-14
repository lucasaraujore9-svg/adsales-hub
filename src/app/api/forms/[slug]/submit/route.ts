import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

interface FormRow {
  id: string;
  workspace_id: string;
  fields: unknown;
  redirect_url: string | null;
  is_active: boolean;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

function asField(raw: unknown): FormField | null {
  if (typeof raw !== "object" || raw === null) return null;
  const f = raw as Record<string, unknown>;
  const name = String(f.name ?? "");
  if (!name) return null;
  return {
    name,
    label: String(f.label ?? name),
    type: String(f.type ?? "text"),
    required: Boolean(f.required),
  };
}

function pickIp(req: NextRequest): string | null {
  const xfwd = req.headers.get("x-forwarded-for");
  if (xfwd) return xfwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return null;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const sb = createAdminSupabaseClient();

  const { data } = await sb
    .from("forms")
    .select("id, workspace_id, fields, redirect_url, is_active")
    .eq("slug", slug)
    .maybeSingle();
  const form = data as FormRow | null;
  if (!form || !form.is_active) {
    return NextResponse.json({ ok: false, error: "Formulario não encontrado" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const fields = (Array.isArray(form.fields) ? form.fields : [])
    .map(asField)
    .filter((f): f is FormField => f !== null);

  // Pull declared field values + UTMs
  const declared: Record<string, string> = {};
  for (const f of fields) {
    const value = body[f.name];
    if (f.required && (value === undefined || value === null || value === "")) {
      return NextResponse.json(
        { ok: false, error: `Campo obrigatorio faltando: ${f.label}` },
        { status: 400 },
      );
    }
    if (value !== undefined && value !== null && value !== "") {
      declared[f.name] = String(value);
    }
  }

  const utm_source = typeof body.__utm_source === "string" ? body.__utm_source : null;
  const utm_medium = typeof body.__utm_medium === "string" ? body.__utm_medium : null;
  const utm_campaign = typeof body.__utm_campaign === "string" ? body.__utm_campaign : null;
  const utm_content = typeof body.__utm_content === "string" ? body.__utm_content : null;
  const utm_term = typeof body.__utm_term === "string" ? body.__utm_term : null;
  const referrer = typeof body.__referrer === "string" ? body.__referrer : null;

  // Try to upsert a contact if email provided
  let contact_id: string | null = null;
  const email = declared.email ?? declared.contact_email ?? null;
  const name = declared.name ?? declared.full_name ?? declared.nome ?? null;
  const phone = declared.phone ?? declared.telefone ?? null;
  const whatsapp = declared.whatsapp ?? null;

  if (email) {
    const { data: existing } = await sb
      .from("contacts")
      .select("id")
      .eq("workspace_id", form.workspace_id)
      .eq("email", email)
      .maybeSingle();

    if (existing && (existing as { id?: string }).id) {
      contact_id = (existing as { id: string }).id;
      await sb
        .from("contacts")
        .update({
          last_contacted_at: new Date().toISOString(),
          phone: phone ?? null,
          whatsapp: whatsapp ?? null,
        } as never)
        .eq("id", contact_id);
    } else {
      const { data: created } = await sb
        .from("contacts")
        .insert({
          workspace_id: form.workspace_id,
          name: name ?? email,
          email,
          phone: phone ?? null,
          whatsapp: whatsapp ?? null,
          source: "form",
          utm_source,
          utm_medium,
          utm_campaign,
          lifecycle_stage: "lead",
          last_contacted_at: new Date().toISOString(),
        } as never)
        .select("id")
        .single();
      contact_id = (created as { id?: string } | null)?.id ?? null;
    }
  }

  // Insert submission
  const { error } = await sb.from("form_submissions").insert({
    workspace_id: form.workspace_id,
    form_id: form.id,
    data: declared,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    referrer,
    ip_address: pickIp(req),
    user_agent: req.headers.get("user-agent"),
    contact_id,
  } as never);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  void (async () => {
    const { dispatchWebhook } = await import("@/lib/webhooks/dispatch");
    await dispatchWebhook(form.workspace_id, "form.submitted", {
      form_id: form.id,
      form_slug: slug,
      data: declared,
      utm_source,
      utm_medium,
      utm_campaign,
      contact_id,
    });
    if (contact_id) {
      await dispatchWebhook(form.workspace_id, "lead.captured", {
        contact_id,
        source: "form",
        form_slug: slug,
        utm_source,
        utm_medium,
        utm_campaign,
      });
    }
  })();

  return NextResponse.json({
    ok: true,
    redirect: form.redirect_url ?? null,
  });
}
