import "server-only";

import type { MetaErrorResponse } from "@/lib/meta/types";

export const META_GRAPH_BASE = "https://graph.facebook.com/v21.0";

export class MetaApiError extends Error {
  code: number;
  type: string;
  userMessage?: string;
  fbtraceId?: string;

  constructor(raw: MetaErrorResponse["error"]) {
    super(raw.message);
    this.code = raw.code;
    this.type = raw.type;
    this.userMessage = raw.error_user_msg;
    this.fbtraceId = raw.fbtrace_id;
    this.name = "MetaApiError";
  }
}

interface RequestOptions {
  token: string;
  method?: "GET" | "POST" | "DELETE";
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: object;
  timeoutMs?: number;
  retries?: number;
}

export interface MetaRateLimitInfo {
  callCount?: number;
  totalCpuTime?: number;
  estimatedTimeToRegainAccess?: number;
}

const RATE_LIMIT_HEADER = "x-business-use-case-usage";

function parseRateLimit(headers: Headers, accountId: string | null): MetaRateLimitInfo | null {
  if (!accountId) return null;
  const raw = headers.get(RATE_LIMIT_HEADER) ?? headers.get("x-app-usage");
  if (!raw) return null;
  try {
    const json = JSON.parse(raw) as Record<string, Array<Record<string, number>>>;
    const bucket = json[accountId]?.[0];
    if (!bucket) return null;
    return {
      callCount: bucket.call_count,
      totalCpuTime: bucket.total_cputime,
      estimatedTimeToRegainAccess: bucket.estimated_time_to_regain_access,
    };
  } catch {
    return null;
  }
}

async function doRequest<T>(opts: RequestOptions & { attempt: number }): Promise<T> {
  const url = new URL(`${META_GRAPH_BASE}/${opts.path.replace(/^\//, "")}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }
  }
  url.searchParams.set("access_token", opts.token);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30_000);

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: opts.method ?? "GET",
      headers: opts.body ? { "content-type": "application/json" } : {},
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  const json = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const err = (json as MetaErrorResponse | null)?.error;
    if (err) {
      const retryable = err.code === 1 || err.code === 2 || err.code === 4 || err.code === 17 || err.code === 613 || err.code === 32;
      if (retryable && opts.attempt < (opts.retries ?? 3)) {
        const wait = 500 * 2 ** opts.attempt + Math.random() * 300;
        await new Promise((r) => setTimeout(r, wait));
        return doRequest<T>({ ...opts, attempt: opts.attempt + 1 });
      }
      throw new MetaApiError(err);
    }
    throw new Error(`Meta API ${response.status}: ${text.slice(0, 200)}`);
  }

  return json as T;
}

export async function metaFetch<T>(opts: RequestOptions): Promise<T> {
  return doRequest<T>({ ...opts, attempt: 0 });
}

export { parseRateLimit };
