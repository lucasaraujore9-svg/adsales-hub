import { z } from "zod";

export const reportSummarySchema = z.object({
  executive_summary: z.string(),
  highlights: z.array(z.string()),
  concerns: z.array(z.string()),
  recommendations: z.array(
    z.object({
      title: z.string(),
      rationale: z.string(),
      priority: z.enum(["low", "medium", "high"]),
    }),
  ),
});

export type ReportSummary = z.infer<typeof reportSummarySchema>;
