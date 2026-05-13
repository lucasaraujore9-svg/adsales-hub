import "server-only";

import { metaFetch } from "@/lib/meta/client";
import type { MetaAdSet, MetaPagedResponse, MetaStatus } from "@/lib/meta/types";

export async function createAdSet(
  token: string,
  adAccountId: string,
  payload: MetaAdSet,
): Promise<{ id: string }> {
  return metaFetch({
    token,
    method: "POST",
    path: `act_${adAccountId}/adsets`,
    body: payload,
  });
}

export async function updateAdSet(
  token: string,
  adSetId: string,
  updates: Partial<MetaAdSet>,
): Promise<{ success: boolean }> {
  return metaFetch({
    token,
    method: "POST",
    path: adSetId,
    body: updates,
  });
}

export async function setAdSetStatus(token: string, adSetId: string, status: MetaStatus) {
  return updateAdSet(token, adSetId, { status });
}

export async function listAdSets(
  token: string,
  campaignId: string,
  opts: { limit?: number; after?: string } = {},
): Promise<MetaPagedResponse<MetaAdSet & { id: string }>> {
  return metaFetch({
    token,
    path: `${campaignId}/adsets`,
    query: {
      limit: opts.limit ?? 50,
      after: opts.after,
      fields:
        "id,name,status,optimization_goal,daily_budget,lifetime_budget,bid_strategy,targeting,start_time,end_time",
    },
  });
}
