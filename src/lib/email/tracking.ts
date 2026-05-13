import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type ResendEventType =
  | "email.sent"
  | "email.delivered"
  | "email.delivery_delayed"
  | "email.bounced"
  | "email.complained"
  | "email.opened"
  | "email.clicked";

export interface ResendWebhookEvent {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    tags?: Record<string, string>;
    to: string[];
    subject?: string;
    from?: string;
  };
}

const METRIC_MAP: Partial<Record<ResendEventType, keyof MetricsPatch>> = {
  "email.delivered": "delivered",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.opened": "opened",
  "email.clicked": "clicked",
};

interface MetricsPatch {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  complained: number;
}

export async function handleResendEvent(event: ResendWebhookEvent): Promise<void> {
  const campaignId = event.data.tags?.campaign_id;
  if (!campaignId) return;

  const column = METRIC_MAP[event.type];
  if (!column) return;

  const admin = createAdminSupabaseClient();
  const { data: existing } = await admin
    .from("email_campaign_metrics")
    .select(column)
    .eq("email_campaign_id", campaignId)
    .maybeSingle();

  const currentValue = (existing as Record<string, number | null> | null)?.[column] ?? 0;

  if (existing) {
    await admin
      .from("email_campaign_metrics")
      .update({ [column]: currentValue + 1 } as never)
      .eq("email_campaign_id", campaignId);
  } else {
    await admin
      .from("email_campaign_metrics")
      .insert({
        email_campaign_id: campaignId,
        [column]: 1,
      } as never);
  }
}
