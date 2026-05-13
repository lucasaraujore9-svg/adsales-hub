import "server-only";

import { metaFetch } from "@/lib/meta/client";
import type {
  MetaAd,
  MetaAdCreativeSpec,
  MetaPagedResponse,
  MetaStatus,
} from "@/lib/meta/types";

export async function createAdCreative(
  token: string,
  adAccountId: string,
  payload: MetaAdCreativeSpec,
): Promise<{ id: string }> {
  return metaFetch({
    token,
    method: "POST",
    path: `act_${adAccountId}/adcreatives`,
    body: payload,
  });
}

export async function createAd(
  token: string,
  adAccountId: string,
  payload: MetaAd,
): Promise<{ id: string }> {
  return metaFetch({
    token,
    method: "POST",
    path: `act_${adAccountId}/ads`,
    body: payload,
  });
}

export async function updateAd(
  token: string,
  adId: string,
  updates: Partial<MetaAd>,
): Promise<{ success: boolean }> {
  return metaFetch({
    token,
    method: "POST",
    path: adId,
    body: updates,
  });
}

export async function setAdStatus(token: string, adId: string, status: MetaStatus) {
  return updateAd(token, adId, { status });
}

export async function listAds(
  token: string,
  adSetId: string,
  opts: { limit?: number; after?: string } = {},
): Promise<MetaPagedResponse<MetaAd & { id: string }>> {
  return metaFetch({
    token,
    path: `${adSetId}/ads`,
    query: {
      limit: opts.limit ?? 50,
      after: opts.after,
      fields: "id,name,status,creative,adset_id",
    },
  });
}
