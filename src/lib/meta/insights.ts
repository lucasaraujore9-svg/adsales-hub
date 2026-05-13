import "server-only";

import { metaFetch } from "@/lib/meta/client";
import type { MetaInsight, MetaPagedResponse } from "@/lib/meta/types";

export type InsightLevel = "campaign" | "adset" | "ad" | "account";

export type DatePreset =
  | "today"
  | "yesterday"
  | "last_3d"
  | "last_7d"
  | "last_14d"
  | "last_28d"
  | "last_30d"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "maximum";

export interface InsightQuery {
  level: InsightLevel;
  fields?: string[];
  date_preset?: DatePreset;
  time_range?: { since: string; until: string };
  time_increment?: number | "all_days" | "monthly";
  breakdowns?: string[];
  action_breakdowns?: string[];
  filtering?: Array<{ field: string; operator: string; value: unknown }>;
  limit?: number;
  after?: string;
}

const DEFAULT_FIELDS = [
  "impressions",
  "reach",
  "clicks",
  "ctr",
  "cpc",
  "cpm",
  "spend",
  "frequency",
  "actions",
  "cost_per_action_type",
  "date_start",
  "date_stop",
];

function insightPath(level: InsightLevel, entityId: string) {
  if (level === "account") return `act_${entityId}/insights`;
  return `${entityId}/insights`;
}

export async function fetchInsights(
  token: string,
  entityId: string,
  query: InsightQuery,
): Promise<MetaPagedResponse<MetaInsight>> {
  return metaFetch({
    token,
    path: insightPath(query.level, entityId),
    query: {
      fields: (query.fields ?? DEFAULT_FIELDS).join(","),
      date_preset: query.date_preset,
      time_range: query.time_range ? JSON.stringify(query.time_range) : undefined,
      time_increment: query.time_increment ?? 1,
      breakdowns: query.breakdowns?.join(","),
      action_breakdowns: query.action_breakdowns?.join(","),
      filtering: query.filtering ? JSON.stringify(query.filtering) : undefined,
      limit: query.limit ?? 500,
      after: query.after,
    },
  });
}

/**
 * Normalize a MetaInsight row into the shape expected by our
 * campaign_metrics / ad_set_metrics / ad_metrics tables.
 */
export function normalizeInsight(row: MetaInsight) {
  const leads = row.actions?.find(
    (a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped",
  );
  const purchases = row.actions?.find(
    (a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase",
  );
  const spend = Number(row.spend ?? 0);
  const leadsCount = Number(leads?.value ?? 0);
  return {
    date: row.date_start,
    impressions: Number(row.impressions ?? 0),
    reach: Number(row.reach ?? 0),
    clicks: Number(row.clicks ?? 0),
    ctr: Number(row.ctr ?? 0),
    cpl: leadsCount > 0 ? spend / leadsCount : 0,
    spend,
    leads: leadsCount,
    purchases: Number(purchases?.value ?? 0),
    frequency: Number(row.frequency ?? 0),
  };
}
