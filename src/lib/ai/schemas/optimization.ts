import { z } from "zod";

export const optimizationActionSchema = z.object({
  type: z.enum(["suggestion", "auto_action"]),
  action: z.enum([
    "pause_ad",
    "resume_ad",
    "increase_budget",
    "decrease_budget",
    "new_creative",
    "adjust_audience",
    "pause_campaign",
    "resume_campaign",
    "custom",
  ]),
  target: z.object({
    scope: z.enum(["campaign", "ad_set", "ad"]),
    id: z.string(),
    name: z.string(),
  }),
  rationale: z.string(),
  expected_impact: z.string().optional(),
  change: z
    .object({
      from: z.unknown().optional(),
      to: z.unknown().optional(),
      delta_pct: z.number().optional(),
      budget_delta: z.number().optional(),
      targeting_changes: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

export const optimizationPlanSchema = z.object({
  actions: z.array(optimizationActionSchema),
  summary: z.string(),
  period_analyzed: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

export type OptimizationAction = z.infer<typeof optimizationActionSchema>;
export type OptimizationPlan = z.infer<typeof optimizationPlanSchema>;
