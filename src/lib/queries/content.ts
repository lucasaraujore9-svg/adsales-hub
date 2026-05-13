import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type SB = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export interface LandingPageRow {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  published: boolean;
  published_at: string | null;
  updated_at: string;
  template_id: string | null;
}

export async function listLandingPages(supabase: SB, workspaceId: string): Promise<LandingPageRow[]> {
  const { data } = await supabase
    .from("landing_pages")
    .select("id, name, slug, domain, published, published_at, updated_at, template_id")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });
  return (data ?? []) as unknown as LandingPageRow[];
}

export async function landingPageStats(supabase: SB, workspaceId: string) {
  const [pages, { data: submissions }] = await Promise.all([
    listLandingPages(supabase, workspaceId),
    supabase
      .from("form_submissions")
      .select("landing_page_id")
      .eq("workspace_id", workspaceId),
  ]);
  const subRows = (submissions ?? []) as unknown as { landing_page_id: string | null }[];
  const bySlug = pages.map((p) => {
    const subs = subRows.filter((s) => s.landing_page_id === p.id).length;
    return { ...p, submissions: subs };
  });
  return bySlug;
}

export interface FormRow {
  id: string;
  name: string;
  slug: string;
  fields: unknown;
  is_active: boolean;
  updated_at: string;
}

export async function listForms(supabase: SB, workspaceId: string): Promise<FormRow[]> {
  const { data } = await supabase
    .from("forms")
    .select("id, name, slug, fields, is_active, updated_at")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });
  return (data ?? []) as unknown as FormRow[];
}

export async function formStats(supabase: SB, workspaceId: string) {
  const [forms, { data: subs }] = await Promise.all([
    listForms(supabase, workspaceId),
    supabase
      .from("form_submissions")
      .select("form_id, created_at")
      .eq("workspace_id", workspaceId),
  ]);
  const rows = (subs ?? []) as unknown as { form_id: string | null; created_at: string }[];
  return forms.map((f) => {
    const count = rows.filter((s) => s.form_id === f.id).length;
    return { ...f, submissions_30d: count };
  });
}

export interface EmailCampaignRow {
  id: string;
  name: string;
  subject: string;
  from_name: string;
  from_email: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed" | "canceled";
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface EmailCampaignMetricsRow {
  email_campaign_id: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  complained: number;
  open_rate: number;
  click_rate: number;
}

export async function listEmailCampaigns(supabase: SB, workspaceId: string) {
  const [{ data: campaigns }, { data: metrics }] = await Promise.all([
    supabase
      .from("email_campaigns")
      .select("id, name, subject, from_name, from_email, status, scheduled_at, sent_at, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false }),
    supabase
      .from("email_campaign_metrics")
      .select(
        "email_campaign_id, sent, delivered, opened, clicked, unsubscribed, bounced, complained, open_rate, click_rate",
      ),
  ]);
  const list = (campaigns ?? []) as unknown as EmailCampaignRow[];
  const m = (metrics ?? []) as unknown as EmailCampaignMetricsRow[];
  return list.map((c) => ({
    ...c,
    metrics: m.find((x) => x.email_campaign_id === c.id) ?? null,
  }));
}

export interface SocialAccountRow {
  id: string;
  platform: string;
  account_name: string;
  status: "active" | "expired" | "disconnected" | "error";
  account_id: string;
  profile_url: string | null;
}

export interface SocialPostRow {
  id: string;
  content_text: string | null;
  hashtags: string[];
  media_urls: unknown;
  platforms: string[];
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  approval_token: string | null;
  created_by_user_id: string | null;
  created_at: string;
}

export async function listSocialAccounts(
  supabase: SB,
  workspaceId: string,
): Promise<SocialAccountRow[]> {
  const { data } = await supabase
    .from("social_accounts")
    .select("id, platform, account_name, status, account_id, profile_url")
    .eq("workspace_id", workspaceId);
  return (data ?? []) as unknown as SocialAccountRow[];
}

export async function listSocialPosts(
  supabase: SB,
  workspaceId: string,
): Promise<SocialPostRow[]> {
  const { data } = await supabase
    .from("social_posts")
    .select(
      "id, content_text, hashtags, media_urls, platforms, status, scheduled_at, published_at, approval_token, created_by_user_id, created_at",
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as SocialPostRow[];
}
