import { NextRequest } from "next/server";

// ─── Sliding-window in-memory rate limiter (PRD §39) ──────────────────────────
//
// Keyed by client IP + bucket name. Suitable for a single-instance VPS deploy
// (PRD §7). For multi-instance, swap the Map for Redis.

interface Bucket {
  timestamps: number[];
}

const store = new Map<string, Bucket>();

// Periodic cleanup of stale buckets
let lastSweep = Date.now();
function sweep(windowMs: number) {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of store) {
    bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
    if (bucket.timestamps.length === 0) store.delete(key);
  }
}

export function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfter: number; // seconds until next allowed
}

/**
 * @param key      unique client key (usually IP)
 * @param bucket   logical bucket name (e.g. "analyze")
 * @param limit    max requests per window
 * @param windowMs window size in ms
 */
export function rateLimit(
  key: string,
  bucket: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  sweep(windowMs);
  const now = Date.now();
  const id = `${bucket}:${key}`;
  const b = store.get(id) ?? { timestamps: [] };

  // Drop timestamps outside the window
  b.timestamps = b.timestamps.filter((t) => now - t < windowMs);

  if (b.timestamps.length >= limit) {
    const oldest = b.timestamps[0];
    const retryAfter = Math.ceil((windowMs - (now - oldest)) / 1000);
    store.set(id, b);
    return { allowed: false, remaining: 0, limit, retryAfter };
  }

  b.timestamps.push(now);
  store.set(id, b);
  return { allowed: true, remaining: limit - b.timestamps.length, limit, retryAfter: 0 };
}

// Preset limits (PRD §39)
export const LIMITS = {
  analyze: { limit: 10, windowMs: 60_000 },   // 10 crawls / min / IP
  search: { limit: 60, windowMs: 60_000 },    // 60 autocomplete / min
  compare: { limit: 6, windowMs: 60_000 },    // 6 comparisons / min
  admin: { limit: 30, windowMs: 60_000 },     // 30 admin ops / min
};
