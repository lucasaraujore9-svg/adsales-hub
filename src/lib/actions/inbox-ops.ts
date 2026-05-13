"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth/guards";
import { planAutoAssignment, listTeamWorkload } from "@/lib/queries/inbox-workload";

/**
 * Auto-distribute unassigned open conversations across the team using a
 * round-robin weighted by current load (lower load goes first). Called
 * manually by admin/gestor via the workload bar.
 */
export async function autoAssignOpenConversations(): Promise<void> {
  const session = await getSession();
  const sb = session.supabase;

  const [{ data: unassignedRaw }, workload] = await Promise.all([
    sb
      .from("conversations")
      .select("id")
      .eq("workspace_id", session.workspaceId)
      .is("assignee_user_id", null)
      .eq("status", "open"),
    listTeamWorkload(sb, session.workspaceId),
  ]);
  const unassigned = ((unassignedRaw ?? []) as unknown as { id: string }[]).map((r) => r.id);
  const plan = planAutoAssignment(workload, unassigned);
  for (const { conversation_id, assignee_user_id } of plan) {
    await sb
      .from("conversations")
      .update({ assignee_user_id } as never)
      .eq("id", conversation_id);
  }
  revalidatePath("/inbox");
  revalidatePath("/inbox/[id]", "page");
}

const convertSchema = z.object({
  conversation_id: z.string().uuid(),
  title: z.string().min(2),
  value: z.coerce.number().nonnegative().default(0),
});

export async function convertConversationToDeal(formData: FormData): Promise<void> {
  const parsed = convertSchema.safeParse({
    conversation_id: formData.get("conversation_id"),
    title: formData.get("title"),
    value: formData.get("value"),
  });
  if (!parsed.success) return;
  const session = await getSession();

  const { data: conv } = await session.supabase
    .from("conversations")
    .select("contact_id, channel, workspace_id")
    .eq("id", parsed.data.conversation_id)
    .single();
  const c = conv as unknown as {
    contact_id: string | null;
    channel: string;
  } | null;
  if (!c) return;

  const { data: pipeline } = await session.supabase
    .from("pipelines")
    .select("id, pipeline_stages(id, position, is_lost)")
    .eq("workspace_id", session.workspaceId)
    .eq("is_default", true)
    .limit(1);
  const pipelineData = pipeline?.[0] as unknown as {
    id: string;
    pipeline_stages: { id: string; position: number; is_lost: boolean }[];
  } | undefined;
  if (!pipelineData) return;

  const firstStage = pipelineData.pipeline_stages
    .filter((s) => !s.is_lost)
    .sort((a, b) => a.position - b.position)[0];
  if (!firstStage) return;

  const { data: deal } = await session.supabase
    .from("deals")
    .insert({
      workspace_id: session.workspaceId,
      pipeline_id: pipelineData.id,
      stage_id: firstStage.id,
      contact_id: c.contact_id,
      owner_user_id: session.user.id,
      title: parsed.data.title,
      value: parsed.data.value,
      status: "open",
      source: c.channel.startsWith("whatsapp") ? "referral" : "website",
    } as never)
    .select("id")
    .single();
  const dealId = (deal as unknown as { id: string })?.id;
  if (dealId) {
    await session.supabase
      .from("conversations")
      .update({ deal_id: dealId } as never)
      .eq("id", parsed.data.conversation_id);
  }
  revalidatePath(`/inbox/${parsed.data.conversation_id}`);
  revalidatePath("/pipeline");
  if (dealId) redirect(`/negocios/${dealId}`);
}

const resolveSchema = z.object({
  conversation_id: z.string().uuid(),
  create_activity: z.string().optional(),
  activity_title: z.string().optional(),
});

export async function resolveAndMaybeCreateActivity(formData: FormData): Promise<void> {
  const parsed = resolveSchema.safeParse({
    conversation_id: formData.get("conversation_id"),
    create_activity: formData.get("create_activity"),
    activity_title: formData.get("activity_title"),
  });
  if (!parsed.success) return;
  const session = await getSession();

  await session.supabase
    .from("conversations")
    .update({ status: "resolved" } as never)
    .eq("id", parsed.data.conversation_id);

  if (parsed.data.create_activity === "1" && parsed.data.activity_title) {
    const { data: conv } = await session.supabase
      .from("conversations")
      .select("contact_id, deal_id")
      .eq("id", parsed.data.conversation_id)
      .single();
    const c = conv as unknown as {
      contact_id: string | null;
      deal_id: string | null;
    } | null;

    await session.supabase.from("activities").insert({
      workspace_id: session.workspaceId,
      user_id: session.user.id,
      type: "task",
      title: parsed.data.activity_title,
      contact_id: c?.contact_id ?? null,
      deal_id: c?.deal_id ?? null,
      due_date: new Date(Date.now() + 2 * 864e5).toISOString(),
      completed: false,
    } as never);
  }

  revalidatePath("/inbox");
  revalidatePath(`/inbox/${parsed.data.conversation_id}`);
}
