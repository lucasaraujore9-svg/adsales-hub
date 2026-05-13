import "server-only";

import { metaFetch } from "@/lib/meta/client";
import type { MetaLeadForm, MetaPagedResponse } from "@/lib/meta/types";

export async function createLeadForm(
  token: string,
  pageId: string,
  payload: MetaLeadForm,
): Promise<{ id: string }> {
  return metaFetch({
    token,
    method: "POST",
    path: `${pageId}/leadgen_forms`,
    body: {
      ...payload,
      locale: payload.locale ?? "pt_BR",
    },
  });
}

export async function listLeadForms(token: string, pageId: string) {
  return metaFetch<MetaPagedResponse<MetaLeadForm & { id: string }>>({
    token,
    path: `${pageId}/leadgen_forms`,
    query: {
      fields: "id,name,questions,thank_you_page,privacy_policy,status",
      limit: 50,
    },
  });
}

export interface MetaLead {
  id: string;
  created_time: string;
  field_data: { name: string; values: string[] }[];
  ad_id?: string;
  ad_name?: string;
  adset_id?: string;
  campaign_id?: string;
  form_id?: string;
}

export async function fetchLeadsForForm(
  token: string,
  formId: string,
  opts: { after?: string; limit?: number } = {},
) {
  return metaFetch<MetaPagedResponse<MetaLead>>({
    token,
    path: `${formId}/leads`,
    query: {
      limit: opts.limit ?? 100,
      after: opts.after,
      fields:
        "id,created_time,field_data,ad_id,ad_name,adset_id,campaign_id,form_id",
    },
  });
}
