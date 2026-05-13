import "server-only";

import { createHash } from "node:crypto";
import { metaFetch } from "@/lib/meta/client";
import type { MetaAudience, MetaPagedResponse } from "@/lib/meta/types";

export async function createAudience(
  token: string,
  adAccountId: string,
  payload: MetaAudience,
): Promise<{ id: string }> {
  return metaFetch({
    token,
    method: "POST",
    path: `act_${adAccountId}/customaudiences`,
    body: payload,
  });
}

export async function listAudiences(token: string, adAccountId: string) {
  return metaFetch<MetaPagedResponse<MetaAudience & { id: string; approximate_count?: number }>>({
    token,
    path: `act_${adAccountId}/customaudiences`,
    query: {
      fields:
        "id,name,subtype,description,approximate_count,lookalike_spec,customer_file_source",
      limit: 50,
    },
  });
}

/**
 * Meta requires SHA-256 of normalized PII (trim + lowercase) when uploading
 * contacts for matching in custom audiences.
 */
export function hashForMeta(value: string): string {
  return createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

export interface AudienceContactInput {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
}

type AudienceSchema =
  | "EMAIL"
  | "PHONE"
  | "FN"
  | "LN"
  | "CT"
  | "COUNTRY";

const FIELD_TO_SCHEMA: Record<keyof AudienceContactInput, AudienceSchema> = {
  email: "EMAIL",
  phone: "PHONE",
  firstName: "FN",
  lastName: "LN",
  city: "CT",
  country: "COUNTRY",
};

export async function pushAudienceContacts(
  token: string,
  audienceId: string,
  contacts: AudienceContactInput[],
  op: "ADD" | "REMOVE" = "ADD",
): Promise<{ audience_id: string; session_id: string; num_received: number }> {
  const fields = new Set<keyof AudienceContactInput>();
  for (const c of contacts) {
    for (const k of Object.keys(c) as (keyof AudienceContactInput)[]) {
      if (c[k]) fields.add(k);
    }
  }
  const schema = [...fields].map((f) => FIELD_TO_SCHEMA[f]);
  const rows = contacts.map((c) =>
    [...fields].map((f) => (c[f] ? hashForMeta(String(c[f])) : "")),
  );

  const endpointPath = op === "ADD" ? `${audienceId}/users` : `${audienceId}/users`;

  return metaFetch({
    token,
    method: op === "ADD" ? "POST" : "DELETE",
    path: endpointPath,
    body: {
      payload: {
        schema,
        data: rows,
      },
    },
  });
}
