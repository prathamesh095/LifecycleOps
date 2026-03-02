/**
 * Rate limiting middleware for API endpoints
 * Implements token bucket algorithm
 * 
 * For production, integrate with Upstash Redis or Edge Config
 * This is a simple in-memory implementation for development
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

// In-memory store for rate limiting (development only)
// For production, use Redis via Upstash
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const LIMITS: Record<string, RateLimitConfig> = {
  default: { interval: 60 * 1000, maxRequests: 100 }, // 100 req/min
  auth: { interval: 60 * 1000, maxRequests: 5 }, // 5 auth attempts/min per user
  api: { interval: 60 * 1000, maxRequests: 150 }, // 150 req/min for authenticated
};

/**
 * Get rate limit key from request
 * Uses IP for unauthenticated, user ID for authenticated
 */
function getRateLimitKey(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Use IP address for unauthenticated requests
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  return `ip:${ip}`;
}

/**
 * Check if request is rate limited
 */
export function isRateLimited(
  key: string,
  config: RateLimitConfig = LIMITS.default
): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetTime < now) {
    // New window or reset
    rateLimitStore.set(key, { count: 1, resetTime: now + config.interval });
    return false;
  }

  current.count++;
  return current.count > config.maxRequests;
}

/**
 * Middleware to enforce rate limiting on API routes
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  userId?: string,
  limitType: keyof typeof LIMITS = 'default'
) {
  const key = getRateLimitKey(request, userId);
  const config = LIMITS[limitType];

  if (isRateLimited(key, config)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil(config.interval / 1000).toString(),
        },
      }
    );
  }

  return null; // No rate limit violation
}

/**
 * Clean up expired rate limit entries (run periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

// Cleanup every 5 minutes
if (typeof global !== 'undefined') {
  if (!(global as any).__rateLimitCleanupInterval) {
    (global as any).__rateLimitCleanupInterval = setInterval(
      cleanupRateLimitStore,
      5 * 60 * 1000
    );
  }
}
