import { z } from "zod";

export const socialSuggestionSchema = z.object({
  captions: z
    .array(
      z.object({
        platform: z.enum([
          "instagram",
          "facebook",
          "linkedin",
          "tiktok",
          "youtube",
          "pinterest",
          "threads",
          "x",
        ]),
        text: z.string(),
      }),
    )
    .min(1),
  hashtags: z.array(z.string()).min(0),
  best_times: z
    .array(
      z.object({
        platform: z.string(),
        day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
        hour: z.number().int().min(0).max(23),
      }),
    )
    .min(0),
  first_comment: z.string().optional(),
});

export type SocialSuggestion = z.infer<typeof socialSuggestionSchema>;
