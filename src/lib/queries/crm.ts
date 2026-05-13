import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type SB = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export interface DealRow {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage_id: string;
  status: "open" | "won" | "lost";
  position: number;
  expected_close_date: string | null;
  stage_entered_at: string;
  created_at: string;
  closed_at: string | null;
  source: string | null;
  pipeline_id: string;
  owner_user_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  loss_reason_id: string | null;
  loss_reason_notes: string | null;
}

export interface ContactRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  company_id: string | null;
  position: string | null;
  lifecycle_stage: string;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  owner_user_id: string | null;
  last_contacted_at: string | null;
  created_at: string;
}

export interface ActivityRow {
  id: string;
  type:
    | "call"
    | "email"
    | "whatsapp"
    | "meeting"
    | "task"
    | "note"
    | "sms"
    | "video_meeting"
    | "demo"
    | "follow_up"
    | "linkedin";
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  outcome: string | null;
  deal_id: string | null;
  contact_id: string | null;
  user_id: string | null;
}

export interface CompanyRow {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
}

export interface StageRow {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  probability: number;
  color: string | null;
  is_won: boolean;
  is_lost: boolean;
}

export interface PipelineRow {
  id: string;
  name: string;
  is_default: boolean;
}

export interface UserRow {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  role: string;
}

export async function listDeals(
  supabase: SB,
  workspaceId: string,
): Promise<DealRow[]> {
  const { data } = await supabase
    .from("deals")
    .select(
      "id, title, value, currency, stage_id, status, position, expected_close_date, stage_entered_at, created_at, closed_at, source, pipeline_id, owner_user_id, contact_id, company_id, loss_reason_id, loss_reason_notes",
    )
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: true });
  return (data ?? []) as unknown as DealRow[];
}

export async function getDeal(supabase: SB, id: string): Promise<DealRow | null> {
  const { data } = await supabase
    .from("deals")
    .select(
      "id, title, value, currency, stage_id, status, position, expected_close_date, stage_entered_at, created_at, closed_at, source, pipeline_id, owner_user_id, contact_id, company_id, loss_reason_id, loss_reason_notes",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as DealRow | null) ?? null;
}

interface ContactFilters {
  search?: string;
  lifecycle?: string;
  source?: string;
}

export async function listContacts(
  supabase: SB,
  workspaceId: string,
  opts: ContactFilters & { limit?: number; offset?: number } = {},
): Promise<ContactRow[]> {
  const limit = opts.limit ?? 100;
  const offset = opts.offset ?? 0;
  let q = supabase
    .from("contacts")
    .select(
      "id, name, email, phone, whatsapp, company_id, position, lifecycle_stage, source, utm_source, utm_medium, utm_campaign, owner_user_id, last_contacted_at, created_at",
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (opts.lifecycle) q = q.eq("lifecycle_stage", opts.lifecycle);
  if (opts.source) q = q.eq("source", opts.source);
  if (opts.search) {
    const s = opts.search.replace(/[%,]/g, "");
    q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`);
  }
  const { data } = await q.range(offset, offset + limit - 1);
  return (data ?? []) as unknown as ContactRow[];
}

export async function countContacts(
  supabase: SB,
  workspaceId: string,
  opts: ContactFilters = {},
): Promise<number> {
  let q = supabase
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);
  if (opts.lifecycle) q = q.eq("lifecycle_stage", opts.lifecycle);
  if (opts.source) q = q.eq("source", opts.source);
  if (opts.search) {
    const s = opts.search.replace(/[%,]/g, "");
    q = q.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`);
  }
  const { count } = await q;
  return count ?? 0;
}

export async function distinctContactSources(
  supabase: SB,
  workspaceId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from("contacts")
    .select("source")
    .eq("workspace_id", workspaceId)
    .not("source", "is", null);
  const set = new Set<string>();
  for (const r of (data ?? []) as { source: string | null }[]) {
    if (r.source) set.add(r.source);
  }
  return [...set].sort();
}

export async function getContact(supabase: SB, id: string): Promise<ContactRow | null> {
  const { data } = await supabase
    .from("contacts")
    .select(
      "id, name, email, phone, whatsapp, company_id, position, lifecycle_stage, source, utm_source, utm_medium, utm_campaign, owner_user_id, last_contacted_at, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as unknown as ContactRow | null) ?? null;
}

export async function listCompanies(
  supabase: SB,
  workspaceId: string,
): Promise<CompanyRow[]> {
  const { data } = await supabase
    .from("companies")
    .select("id, name, website, industry")
    .eq("workspace_id", workspaceId)
    .order("name");
  return (data ?? []) as unknown as CompanyRow[];
}

export async function listActivities(
  supabase: SB,
  workspaceId: string,
  opts: { dealId?: string; contactId?: string; limit?: number } = {},
): Promise<ActivityRow[]> {
  let q = supabase
    .from("activities")
    .select(
      "id, type, title, description, due_date, completed, completed_at, outcome, deal_id, contact_id, user_id",
    )
    .eq("workspace_id", workspaceId)
    .order("due_date", { ascending: true, nullsFirst: false });
  if (opts.dealId) q = q.eq("deal_id", opts.dealId);
  if (opts.contactId) q = q.eq("contact_id", opts.contactId);
  const { data } = await q.limit(opts.limit ?? 200);
  return (data ?? []) as unknown as ActivityRow[];
}

export async function listPipelinesAndStages(supabase: SB, workspaceId: string) {
  const [{ data: pipelines }, { data: stages }] = await Promise.all([
    supabase
      .from("pipelines")
      .select("id, name, is_default")
      .eq("workspace_id", workspaceId)
      .order("position"),
    supabase
      .from("pipeline_stages")
      .select("id, pipeline_id, name, position, probability, color, is_won, is_lost")
      .order("position"),
  ]);
  return {
    pipelines: (pipelines ?? []) as unknown as PipelineRow[],
    stages: (stages ?? []) as unknown as StageRow[],
  };
}

export async function listWorkspaceUsers(
  supabase: SB,
  workspaceId: string,
): Promise<UserRow[]> {
  const { data } = await supabase
    .from("users")
    .select("id, name, email, avatar_url, role")
    .eq("workspace_id", workspaceId);
  return (data ?? []) as unknown as UserRow[];
}

export async function dealStats(supabase: SB, workspaceId: string) {
  const deals = await listDeals(supabase, workspaceId);
  const open = deals.filter((d) => d.status === "open");
  const won = deals.filter((d) => d.status === "won");
  const lost = deals.filter((d) => d.status === "lost");
  const pipelineTotal = open.reduce((acc, d) => acc + Number(d.value || 0), 0);
  const wonTotal = won.reduce((acc, d) => acc + Number(d.value || 0), 0);
  return { deals, open, won, lost, pipelineTotal, wonTotal };
}

export interface LeadSourceRow {
  id: string;
  deal_id: string | null;
  contact_id: string | null;
  source_type: string;
  campaign_id: string | null;
  ad_set_id: string | null;
  ad_id: string | null;
  form_id: string | null;
  lead_form_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  cost: number | null;
  captured_at: string | null;
  campaign?: { name: string } | null;
  ad_set?: { name: string } | null;
  ad?: { name: string } | null;
  lead_form?: { name: string } | null;
}

export async function leadSourcesForDeal(
  supabase: SB,
  dealId: string,
): Promise<LeadSourceRow[]> {
  const { data } = await supabase
    .from("lead_sources")
    .select(
      "id, deal_id, contact_id, source_type, campaign_id, ad_set_id, ad_id, form_id, lead_form_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, cost, captured_at, campaign:campaigns(name), ad_set:ad_sets(name), ad:ads(name), lead_form:lead_forms(name)",
    )
    .eq("deal_id", dealId)
    .order("captured_at", { ascending: false, nullsFirst: false });
  return (data ?? []) as unknown as LeadSourceRow[];
}

export function mapById<T extends { id: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((r) => [r.id, r]));
}

export async function listDealNotes(
  supabase: SB,
  dealId: string,
): Promise<NoteRow[]> {
  const { data } = await supabase
    .from("notes")
    .select("id, content, created_at, user_id")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []) as unknown as NoteRow[];
}

export async function listDealCalls(
  supabase: SB,
  dealId: string,
): Promise<CallRow[]> {
  const { data } = await supabase
    .from("calls")
    .select("id, status, direction, duration_seconds, started_at, ended_at, created_at")
    .eq("deal_id", dealId)
    .order("started_at", { ascending: false, nullsFirst: false })
    .limit(100);
  return (data ?? []) as unknown as CallRow[];
}

export type TimelineEvent =
  | { kind: "created"; at: string; title: string; meta?: string }
  | { kind: "stage_entered"; at: string; title: string; meta?: string }
  | { kind: "closed"; at: string; title: string; meta?: string; tone: "good" | "bad" }
  | { kind: "activity_done"; at: string; title: string; meta?: string }
  | { kind: "note"; at: string; title: string; meta?: string }
  | { kind: "call"; at: string; title: string; meta?: string };

export interface NoteRow {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
}

export interface CallRow {
  id: string;
  status: string;
  direction: string;
  duration_seconds: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export async function dealTimeline(
  supabase: SB,
  deal: Pick<DealRow, "id" | "created_at" | "stage_entered_at" | "closed_at" | "status">,
  stageName: string | null,
): Promise<TimelineEvent[]> {
  const [{ data: notes }, { data: calls }, { data: doneActivities }] = await Promise.all([
    supabase
      .from("notes")
      .select("id, content, created_at, user_id")
      .eq("deal_id", deal.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("calls")
      .select("id, status, direction, duration_seconds, started_at, ended_at, created_at")
      .eq("deal_id", deal.id)
      .order("started_at", { ascending: false, nullsFirst: false })
      .limit(50),
    supabase
      .from("activities")
      .select("id, type, title, completed, completed_at, due_date")
      .eq("deal_id", deal.id)
      .eq("completed", true)
      .order("completed_at", { ascending: false, nullsFirst: false })
      .limit(50),
  ]);

  const events: TimelineEvent[] = [];

  events.push({
    kind: "created",
    at: deal.created_at,
    title: "Negocio criado",
  });

  if (deal.stage_entered_at && deal.stage_entered_at !== deal.created_at) {
    events.push({
      kind: "stage_entered",
      at: deal.stage_entered_at,
      title: stageName ? `Mudou para ${stageName}` : "Mudou de estagio",
    });
  }

  if (deal.closed_at) {
    events.push({
      kind: "closed",
      at: deal.closed_at,
      title: deal.status === "won" ? "Negocio ganho" : "Negocio perdido",
      tone: deal.status === "won" ? "good" : "bad",
    });
  }

  for (const n of (notes ?? []) as unknown as NoteRow[]) {
    events.push({
      kind: "note",
      at: n.created_at,
      title: "Nota adicionada",
      meta: n.content.length > 120 ? `${n.content.slice(0, 120)}...` : n.content,
    });
  }

  for (const c of (calls ?? []) as unknown as CallRow[]) {
    const at = c.started_at ?? c.created_at;
    const mins = Math.round(c.duration_seconds / 60);
    events.push({
      kind: "call",
      at,
      title: `Ligacao ${c.direction === "inbound" ? "recebida" : "feita"}`,
      meta: `${c.status} · ${mins}min`,
    });
  }

  for (const a of (doneActivities ?? []) as Array<{
    id: string;
    type: string;
    title: string;
    completed_at: string | null;
    due_date: string | null;
  }>) {
    const at = a.completed_at ?? a.due_date;
    if (!at) continue;
    events.push({
      kind: "activity_done",
      at,
      title: `${a.type}: ${a.title}`,
      meta: "concluida",
    });
  }

  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}
