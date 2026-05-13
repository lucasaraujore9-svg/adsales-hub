import { z } from "zod";

export const generatedCreativeSchema = z.object({
  format: z.enum(["1x1", "9x16", "16x9", "4x5"]).default("1x1"),
  headline: z.string().max(40),
  primary_text: z.string(),
  description: z.string().max(125).optional(),
  cta: z.string(),
  image_prompt: z.string().optional(),
  video_brief: z.string().optional(),
});

export const generatedAdSchema = z.object({
  name: z.string(),
  headline: z.string(),
  primary_text: z.string(),
  description: z.string().optional(),
  cta: z.string(),
  link_url: z.string().url().optional(),
  creative: generatedCreativeSchema,
});

export const generatedAdSetSchema = z.object({
  name: z.string(),
  daily_budget: z.number().nonnegative(),
  placements: z.array(z.string()),
  bid_strategy: z.string().optional(),
  targeting: z.object({
    age_min: z.number().int().min(13).max(65).default(18),
    age_max: z.number().int().min(13).max(65).default(65),
    genders: z.array(z.enum(["all", "male", "female"])).default(["all"]),
    locations: z.array(z.string()).default([]),
    interests: z.array(z.string()).default([]),
    behaviors: z.array(z.string()).default([]),
    custom_audiences: z.array(z.string()).default([]),
  }),
  schedule: z
    .object({
      start_date: z.string().optional(),
      end_date: z.string().optional(),
    })
    .optional(),
});

export const generatedLeadFormSchema = z.object({
  name: z.string(),
  headline: z.string(),
  description: z.string(),
  fields: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        type: z.enum(["text", "email", "phone", "number", "select"]),
        required: z.boolean().default(true),
        options: z.array(z.string()).optional(),
      }),
    )
    .min(1),
  thank_you_message: z.string(),
  redirect_url: z.string().url().optional(),
});

export const generatedCampaignSchema = z.object({
  campaign: z.object({
    name: z.string(),
    objective: z.enum([
      "lead_gen",
      "traffic",
      "conversions",
      "engagement",
      "awareness",
      "sales",
      "app_promotion",
    ]),
    daily_budget: z.number().positive(),
    total_budget: z.number().positive().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  }),
  ad_sets: z.array(generatedAdSetSchema).min(1).max(4),
  ads: z.array(generatedAdSchema).min(1).max(6),
  lead_form: generatedLeadFormSchema.optional(),
  reasoning: z.object({
    audience: z.string(),
    creative: z.string(),
    budget: z.string(),
    expected_outcome: z.string(),
  }),
});

export type GeneratedCampaign = z.infer<typeof generatedCampaignSchema>;
