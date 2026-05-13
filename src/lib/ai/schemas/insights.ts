import { z } from "zod";

export const insightSchema = z.object({
  area: z.enum(["traffic", "sales", "social", "unified"]),
  type: z.enum([
    "trend",
    "anomaly",
    "correlation",
    "forecast",
    "recommendation",
    "optimization",
  ]),
  title: z.string(),
  description: z.string(),
  severity: z.enum(["info", "warning", "opportunity", "critical"]),
  suggested_action: z.string().optional(),
  action_type: z
    .enum([
      "pause_campaign",
      "resume_campaign",
      "increase_budget",
      "decrease_budget",
      "create_retargeting",
      "redistribute_leads",
      "custom",
    ])
    .nullable()
    .optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  valid_until: z.string().nullable().optional(),
});

export const insightsResponseSchema = z.object({
  insights: z.array(insightSchema).min(0).max(12),
  summary: z.string(),
});

export type Insight = z.infer<typeof insightSchema>;
export type InsightsResponse = z.infer<typeof insightsResponseSchema>;
