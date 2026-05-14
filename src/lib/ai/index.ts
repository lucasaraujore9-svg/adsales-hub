import "server-only";

import { generate, generateJSON, stream, DEFAULT_MODEL } from "@/lib/ai/client";
import { recordAiUsage } from "@/lib/ai/usage";
import {
  generatedCampaignSchema,
  type GeneratedCampaign,
} from "@/lib/ai/schemas/campaign";
import {
  optimizationPlanSchema,
  type OptimizationPlan,
} from "@/lib/ai/schemas/optimization";
import {
  insightsResponseSchema,
  type InsightsResponse,
} from "@/lib/ai/schemas/insights";
import {
  reportSummarySchema,
  type ReportSummary,
} from "@/lib/ai/schemas/report";
import {
  callAnalysisSchema,
  type CallAnalysis,
} from "@/lib/ai/schemas/call-analysis";
import {
  socialSuggestionSchema,
  type SocialSuggestion,
} from "@/lib/ai/schemas/social";
import { CAMPAIGN_GENERATION_PROMPT } from "@/lib/ai/prompts/campaign-generation";
import { CAMPAIGN_OPTIMIZATION_PROMPT } from "@/lib/ai/prompts/campaign-optimization";
import { INSIGHTS_PROMPT } from "@/lib/ai/prompts/insights";
import { REPORT_SUMMARY_PROMPT } from "@/lib/ai/prompts/report-summary";
import { ASK_AI_PROMPT } from "@/lib/ai/prompts/ask-ai";
import { CALL_ANALYSIS_PROMPT } from "@/lib/ai/prompts/call-analysis";
import { SOCIAL_MEDIA_PROMPT } from "@/lib/ai/prompts/social-media";

export type { GeneratedCampaign, OptimizationPlan, InsightsResponse, ReportSummary, CallAnalysis, SocialSuggestion };

interface CallOpts {
  workspaceId: string;
}

export async function generateCampaign(
  briefing: string,
  context: { accountCurrency?: string; accountTimezone?: string; hint?: string },
  opts: CallOpts,
): Promise<GeneratedCampaign> {
  const userMessage = `Briefing do usuário:\n\n${briefing}\n\nContexto da conta:\n${JSON.stringify(context)}`;
  const result = await generateJSON({
    systemPrompt: CAMPAIGN_GENERATION_PROMPT,
    userMessage,
    schema: generatedCampaignSchema,
    maxTokens: 6000,
  });
  await recordAiUsage(opts.workspaceId);
  return result;
}

export async function optimizeCampaigns(
  payload: {
    metrics: unknown;
    crmData?: unknown;
    automationLevel: "suggestion_only" | "low" | "medium" | "high";
  },
  opts: CallOpts,
): Promise<OptimizationPlan> {
  const userMessage = JSON.stringify(payload);
  const result = await generateJSON({
    systemPrompt: CAMPAIGN_OPTIMIZATION_PROMPT,
    userMessage,
    schema: optimizationPlanSchema,
    maxTokens: 4096,
  });
  await recordAiUsage(opts.workspaceId);
  return result;
}

export async function generateInsights(
  dataSnapshot: unknown,
  opts: CallOpts,
): Promise<InsightsResponse> {
  const result = await generateJSON({
    systemPrompt: INSIGHTS_PROMPT,
    userMessage: JSON.stringify(dataSnapshot),
    schema: insightsResponseSchema,
    maxTokens: 3500,
  });
  await recordAiUsage(opts.workspaceId);
  return result;
}

export async function generateReportSummary(
  snapshot: unknown,
  opts: CallOpts,
): Promise<ReportSummary> {
  const result = await generateJSON({
    systemPrompt: REPORT_SUMMARY_PROMPT,
    userMessage: JSON.stringify(snapshot),
    schema: reportSummarySchema,
    maxTokens: 2048,
  });
  await recordAiUsage(opts.workspaceId);
  return result;
}

export async function* askAI(
  question: string,
  dataContext: unknown,
  opts: CallOpts,
) {
  const userMessage = `Pergunta: ${question}\n\nContexto de dados:\n${JSON.stringify(dataContext)}`;
  for await (const chunk of stream({
    systemPrompt: ASK_AI_PROMPT,
    userMessage,
    maxTokens: 2048,
  })) {
    yield chunk;
  }
  await recordAiUsage(opts.workspaceId);
}

export async function askAIOnce(
  question: string,
  dataContext: unknown,
  opts: CallOpts,
): Promise<string> {
  const userMessage = `Pergunta: ${question}\n\nContexto de dados:\n${JSON.stringify(dataContext)}`;
  const result = await generate({
    systemPrompt: ASK_AI_PROMPT,
    userMessage,
    maxTokens: 2048,
  });
  await recordAiUsage(opts.workspaceId);
  return result;
}

export async function analyzeCall(
  transcript: string,
  opts: CallOpts,
): Promise<CallAnalysis> {
  const result = await generateJSON({
    systemPrompt: CALL_ANALYSIS_PROMPT,
    userMessage: `Transcricao da ligacao:\n\n${transcript}`,
    schema: callAnalysisSchema,
    maxTokens: 3500,
  });
  await recordAiUsage(opts.workspaceId);
  return result;
}

export async function suggestSocialContent(
  brief: {
    topic: string;
    objective: string;
    brand_voice?: string;
    platforms: string[];
  },
  opts: CallOpts,
): Promise<SocialSuggestion> {
  const result = await generateJSON({
    systemPrompt: SOCIAL_MEDIA_PROMPT,
    userMessage: JSON.stringify(brief),
    schema: socialSuggestionSchema,
    maxTokens: 2500,
  });
  await recordAiUsage(opts.workspaceId);
  return result;
}

export { DEFAULT_MODEL };
