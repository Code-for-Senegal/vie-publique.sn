import type { H3Event } from 'h3';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Simple in-memory rate limiter for specific endpoints.
 * Returns true if the request is allowed, throws 429 if rate limited.
 */
export const checkRateLimit = (
  event: H3Event,
  opts: { maxRequests: number; windowMs: number } = { maxRequests: 5, windowMs: 60_000 },
): void => {
  const ip =
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getRequestHeader(event, 'x-real-ip') ||
    'unknown';

  const key = `${ip}:${event.path}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs });
    return;
  }

  entry.count++;

  if (entry.count > opts.maxRequests) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
    });
  }
};
