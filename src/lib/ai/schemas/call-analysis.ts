import { z } from "zod";

export const callAnalysisSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  strengths: z.array(z.string()).min(0),
  opportunities: z.array(z.string()).min(0),
  objections: z
    .array(
      z.object({
        objection: z.string(),
        response_suggestion: z.string().optional(),
      }),
    )
    .min(0),
  next_steps: z.array(z.string()).min(0),
});

export type CallAnalysis = z.infer<typeof callAnalysisSchema>;
