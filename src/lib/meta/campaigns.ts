import "server-only";

import { metaFetch } from "@/lib/meta/client";
import type { MetaCampaign, MetaPagedResponse, MetaStatus } from "@/lib/meta/types";

export async function createCampaign(
  token: string,
  adAccountId: string,
  payload: MetaCampaign,
): Promise<{ id: string }> {
  return metaFetch({
    token,
    method: "POST",
    path: `act_${adAccountId}/campaigns`,
    body: {
      ...payload,
      special_ad_categories: payload.special_ad_categories ?? [],
    },
  });
}

export async function updateCampaign(
  token: string,
  campaignId: string,
  updates: Partial<MetaCampaign>,
): Promise<{ success: boolean }> {
  return metaFetch({
    token,
    method: "POST",
    path: campaignId,
    body: updates,
  });
}

export async function deleteCampaign(token: string, campaignId: string) {
  return metaFetch<{ success: boolean }>({
    token,
    method: "DELETE",
    path: campaignId,
  });
}

export async function setCampaignStatus(
  token: string,
  campaignId: string,
  status: MetaStatus,
) {
  return updateCampaign(token, campaignId, { status });
}

export async function listCampaigns(
  token: string,
  adAccountId: string,
  opts: { limit?: number; fields?: string[]; after?: string } = {},
): Promise<MetaPagedResponse<MetaCampaign & { id: string }>> {
  return metaFetch({
    token,
    path: `act_${adAccountId}/campaigns`,
    query: {
      limit: opts.limit ?? 50,
      after: opts.after,
      fields:
        opts.fields?.join(",") ??
        "id,name,objective,status,daily_budget,lifetime_budget,start_time,stop_time",
    },
  });
}
