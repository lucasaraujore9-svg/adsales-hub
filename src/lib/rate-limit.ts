/**
 * Rate limit em memória (fixed-window simplificado).
 * Adequado para MVP — em ambiente serverless faz reset por cold start.
 * Em produção real migrar para Redis/Upstash.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const DISABLED = process.env.RATE_LIMIT_DISABLED === "1";

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  /** ms até o reset. */
  resetIn: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  if (DISABLED) {
    return { ok: true, remaining: limit, resetIn: windowMs };
  }
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetIn: windowMs };
  }
  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  return {
    ok: entry.count <= limit,
    remaining,
    resetIn: entry.resetAt - now,
  };
}

/** Limpeza periódica para evitar memory leak. */
let cleanupTimer: ReturnType<typeof setInterval> | null = null;
if (typeof setInterval !== "undefined" && !cleanupTimer) {
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) {
      if (v.resetAt < now) buckets.delete(k);
    }
  }, 60_000);
  if (typeof cleanupTimer.unref === "function") cleanupTimer.unref();
}

/** Helper: humaniza tempo de reset. */
export function formatResetIn(ms: number): string {
  const sec = Math.ceil(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.ceil(sec / 60);
  if (min < 60) return `${min} min`;
  const h = Math.ceil(min / 60);
  return `${h}h`;
}
