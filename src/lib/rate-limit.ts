// ponytail: in-memory fixed-window counter, one Map per Next.js server
// instance. Fine for a single deployment; swap for Upstash/Redis if this
// ever runs across multiple instances/regions and limits need to be shared.
const hits = new Map<string, { count: number; resetAt: number }>();

// Sweep expired entries occasionally so the Map doesn't grow forever.
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  hits.forEach((entry, key) => {
    if (entry.resetAt <= now) hits.delete(key);
  });
}

export type RateLimitResult = { success: boolean; remaining: number; resetAt: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count += 1;
  return { success: entry.count <= limit, remaining: Math.max(0, limit - entry.count), resetAt: entry.resetAt };
}
