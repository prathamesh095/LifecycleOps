/**
 * Simple in-memory caching layer for API responses
 * For production, integrate with Redis via Upstash
 * 
 * This provides:
 * - ETag support for conditional requests
 * - TTL-based cache invalidation
 * - Cache warmup and refresh patterns
 */

import crypto from 'crypto';

interface CacheEntry<T> {
  data: T;
  etag: string;
  expiresAt: number;
  createdAt: number;
}

// In-memory cache store (development only)
const cacheStore = new Map<string, CacheEntry<any>>();

/**
 * Generate ETag for response data
 */
function generateETag(data: any): string {
  const json = JSON.stringify(data);
  return `"${crypto.createHash('md5').update(json).digest('hex')}"`;
}

/**
 * Get cache key for a query
 */
function getCacheKey(userId: string, resource: string, params?: Record<string, any>): string {
  const paramString = params ? JSON.stringify(params) : '';
  return `${userId}:${resource}:${paramString}`;
}

/**
 * Cache a response
 */
export function setCacheEntry<T>(
  userId: string,
  resource: string,
  data: T,
  ttlSeconds: number = 300,
  params?: Record<string, any>
): string {
  const key = getCacheKey(userId, resource, params);
  const etag = generateETag(data);

  cacheStore.set(key, {
    data,
    etag,
    expiresAt: Date.now() + ttlSeconds * 1000,
    createdAt: Date.now(),
  });

  return etag;
}

/**
 * Get cached response
 * Returns null if expired or not found
 */
export function getCacheEntry<T>(
  userId: string,
  resource: string,
  params?: Record<string, any>
): T | null {
  const key = getCacheKey(userId, resource, params);
  const entry = cacheStore.get(key);

  if (!entry) return null;

  // Check if expired
  if (entry.expiresAt < Date.now()) {
    cacheStore.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Get ETag for cached response
 */
export function getCacheETag(
  userId: string,
  resource: string,
  params?: Record<string, any>
): string | null {
  const key = getCacheKey(userId, resource, params);
  const entry = cacheStore.get(key);
  return entry?.etag || null;
}

/**
 * Check if ETag matches (for 304 Not Modified responses)
 */
export function etagMatches(currentETag: string | null, requestETag: string | null): boolean {
  if (!currentETag || !requestETag) return false;
  return currentETag === requestETag;
}

/**
 * Invalidate cache for a user's resource
 */
export function invalidateCache(userId: string, resource?: string, params?: Record<string, any>): void {
  if (!resource) {
    // Invalidate all for user
    for (const key of cacheStore.keys()) {
      if (key.startsWith(`${userId}:`)) {
        cacheStore.delete(key);
      }
    }
  } else {
    const key = getCacheKey(userId, resource, params);
    cacheStore.delete(key);
  }
}

/**
 * Clear all expired cache entries (run periodically)
 */
export function cleanupExpiredCache(): number {
  const now = Date.now();
  let deleted = 0;

  for (const [key, entry] of cacheStore.entries()) {
    if (entry.expiresAt < now) {
      cacheStore.delete(key);
      deleted++;
    }
  }

  return deleted;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  let totalSize = 0;
  let expiredCount = 0;
  const now = Date.now();

  for (const entry of cacheStore.values()) {
    totalSize += JSON.stringify(entry.data).length;
    if (entry.expiresAt < now) {
      expiredCount++;
    }
  }

  return {
    entries: cacheStore.size,
    estimatedSizeBytes: totalSize,
    expiredCount,
  };
}

/**
 * Cache helper for common list responses
 */
export function getCachedList<T>(
  userId: string,
  resource: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300,
  params?: Record<string, any>
): Promise<{ data: T; etag: string; cached: boolean }> {
  const cached = getCacheEntry<T>(userId, resource, params);

  if (cached) {
    const etag = getCacheETag(userId, resource, params)!;
    return Promise.resolve({ data: cached, etag, cached: true });
  }

  return fetcher().then(data => {
    const etag = setCacheEntry(userId, resource, data, ttlSeconds, params);
    return { data, etag, cached: false };
  });
}

// Cleanup every 10 minutes
if (typeof global !== 'undefined') {
  if (!(global as any).__cacheCleanupInterval) {
    (global as any).__cacheCleanupInterval = setInterval(cleanupExpiredCache, 10 * 60 * 1000);
  }
}
