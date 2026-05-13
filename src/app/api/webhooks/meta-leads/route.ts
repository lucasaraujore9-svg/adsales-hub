import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireServerEnv } from "@/lib/env";
import { fetchLeadsForForm } from "@/lib/meta/lead-forms";
import { getMetaToken } from "@/lib/meta/token-manager";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Meta Lead Ads webhook.
 *
 * GET  = verification challenge (hub.mode / hub.challenge / hub.verify_token)
 * POST = payload { entry: [{ changes: [{ field: 'leadgen', value: { leadgen_id, form_id, page_id, ad_id, created_time } }] }] }
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");
  const verifyToken = requireServerEnv("META_WEBHOOK_VERIFY_TOKEN");
  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

interface LeadgenChange {
  field: string;
  value: {
    leadgen_id: string;
    form_id: string;
    page_id?: string;
    ad_id?: string;
    adgroup_id?: string;
    created_time?: number;
  };
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  if (!payload?.entry) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();

  for (const entry of payload.entry as Array<{ changes: LeadgenChange[] }>) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "leadgen") continue;
      const formId = change.value.form_id;
      const leadgenId = change.value.leadgen_id;

      // Find the lead_form to know the workspace
      const { data: leadForm } = await admin
        .from("lead_forms")
        .select("id, workspace_id, campaign_id")
        .eq("provider_form_id", formId)
        .maybeSingle();
      const lf = leadForm as unknown as {
        id: string;
        workspace_id: string;
        campaign_id: string | null;
      } | null;
      if (!lf) {
        console.warn("[meta-leads] unknown form", formId);
        continue;
      }

      // Fetch the lead data from Meta. Without campaign tied to ad account we need the workspace's main ad account.
      const { data: accounts } = await admin
        .from("ad_accounts")
        .select("id, provider")
        .eq("workspace_id", lf.workspace_id)
        .eq("provider", "meta")
        .limit(1);
      const account = (accounts?.[0] ?? null) as unknown as { id: string } | null;

      try {
        if (account) {
          const token = await getMetaToken(account.id);
          const page = await fetchLeadsForForm(token.accessToken, formId, { limit: 1 });
          const lead = page.data.find((l) => l.id === leadgenId);
          if (lead) {
            await handleLeadRow(admin, lf, lead);
          }
        }
      } catch (err) {
        console.error("[meta-leads] fetch failed", err);
      }

      // Always persist the raw webhook event
      await admin.from("webhook_logs").insert({
        workspace_id: lf.workspace_id,
        direction: "incoming",
        event: "meta.leadgen",
        payload: change.value as unknown as Record<string, unknown>,
      } as never);
    }
  }

  return NextResponse.json({ received: true });
}

async function handleLeadRow(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  leadForm: { id: string; workspace_id: string; campaign_id: string | null },
  lead: {
    id: string;
    field_data: { name: string; values: string[] }[];
    created_time: string;
    ad_id?: string;
    adset_id?: string;
    campaign_id?: string;
  },
) {
  const fields: Record<string, string> = {};
  for (const fd of lead.field_data) {
    fields[fd.name] = (fd.values ?? [])[0] ?? "";
  }

  // Create or find contact by email
  let contactId: string | null = null;
  if (fields.email) {
    const { data: existing } = await admin
      .from("contacts")
      .select("id")
      .eq("workspace_id", leadForm.workspace_id)
      .eq("email", fields.email)
      .maybeSingle();
    if ((existing as unknown as { id: string } | null)?.id) {
      contactId = (existing as unknown as { id: string }).id;
    } else {
      const { data: created } = await admin
        .from("contacts")
        .insert({
          workspace_id: leadForm.workspace_id,
          name: fields.full_name ?? fields.name ?? fields.email,
          email: fields.email,
          phone: fields.phone_number ?? null,
          whatsapp: fields.phone_number ?? null,
          source: "meta_ads",
          lifecycle_stage: "lead",
        } as never)
        .select("id")
        .single();
      contactId = (created as unknown as { id: string })?.id ?? null;
    }
  }

  // Find default pipeline + first stage
  const { data: pipeline } = await admin
    .from("pipelines")
    .select("id")
    .eq("workspace_id", leadForm.workspace_id)
    .eq("is_default", true)
    .limit(1);
  const pipelineId = (pipeline?.[0] as unknown as { id: string } | undefined)?.id;
  let dealId: string | null = null;
  if (pipelineId) {
    const { data: stage } = await admin
      .from("pipeline_stages")
      .select("id")
      .eq("pipeline_id", pipelineId)
      .order("position")
      .limit(1);
    const stageId = (stage?.[0] as unknown as { id: string } | undefined)?.id;
    if (stageId) {
      const { data: deal } = await admin
        .from("deals")
        .insert({
          workspace_id: leadForm.workspace_id,
          pipeline_id: pipelineId,
          stage_id: stageId,
          contact_id: contactId,
          title: `Lead Meta Ads: ${fields.full_name ?? fields.email ?? "sem nome"}`,
          value: 0,
          status: "open",
          source: "meta_ads",
        } as never)
        .select("id")
        .single();
      dealId = (deal as unknown as { id: string })?.id ?? null;
    }
  }

  // Lead source
  await admin.from("lead_sources").insert({
    workspace_id: leadForm.workspace_id,
    deal_id: dealId,
    contact_id: contactId,
    source_type: "meta_ads",
    lead_form_id: leadForm.id,
    captured_at: lead.created_time,
  } as never);

  // Form submission record
  await admin.from("form_submissions").insert({
    workspace_id: leadForm.workspace_id,
    landing_page_id: null,
    form_id: null,
    data: fields as unknown as Record<string, unknown>,
    utm_source: "facebook",
    utm_medium: "cpc",
    utm_campaign: "meta_leadgen",
    deal_id: dealId,
    contact_id: contactId,
  } as never);
}
