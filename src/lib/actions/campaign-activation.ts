"use server";

import { getSession } from "@/lib/auth/guards";
import {
  getCampaignActivationChecks,
  isCampaignReadyToActivate,
  type ActivationCheck,
} from "@/lib/campaigns/activation-checks";

export type ChecklistResult = {
  checks: ActivationCheck[];
  ready: boolean;
};

export async function fetchActivationChecklist(
  campaignId: string,
): Promise<ChecklistResult> {
  const session = await getSession();
  const checks = await getCampaignActivationChecks(session.supabase, campaignId);
  return { checks, ready: isCampaignReadyToActivate(checks) };
}
