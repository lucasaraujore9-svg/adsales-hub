import "server-only";

import { requireServerEnv } from "@/lib/env";
import type { DidNumber } from "@/lib/telephony/types";

const DID_PROVIDER_BASE =
  process.env.DID_PROVIDER_BASE_URL ?? "https://did-provider.internal/api/public";

async function didFetch<T>(
  method: "GET" | "POST",
  path: string,
  body?: object,
): Promise<T> {
  const url = new URL(`${DID_PROVIDER_BASE}${path.startsWith("/") ? path : `/${path}`}`);
  url.searchParams.set("TOKEN", requireServerEnv("DID_PROVIDER_API_TOKEN"));

  const response = await fetch(url.toString(), {
    method,
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`DID provider ${response.status}: ${text.slice(0, 200)}`);
  }
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export interface DidSearchParams {
  area_code?: string;
  state?: string;
  city?: string;
  limit?: number;
}

export async function searchAvailableDids(params: DidSearchParams = {}): Promise<
  Array<{ number: string; state: string; city: string; price: number }>
> {
  return didFetch("POST", "/dids/search", {
    area_code: params.area_code,
    state: params.state,
    city: params.city,
    limit: params.limit ?? 20,
  });
}

export async function purchaseDid(
  number: string,
  plan: string = "standard",
): Promise<DidNumber> {
  return didFetch("POST", "/dids/purchase", { number, plan });
}

export async function listMyDids(): Promise<DidNumber[]> {
  return didFetch("GET", "/dids/list");
}

export async function cancelDid(number: string): Promise<{ success: boolean }> {
  return didFetch("POST", "/dids/cancel", { number });
}

export async function sendSms(params: {
  from: string;
  to: string;
  message: string;
}): Promise<{ id: string; status: string }> {
  return didFetch("POST", "/sms/send", params);
}
