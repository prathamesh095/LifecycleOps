/**
 * Comprehensive logging and monitoring utilities
 * Tracks API performance, errors, and security events
 */

import { NextRequest, NextResponse } from 'next/server';

export interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number; // ms
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  error?: string;
  errorStack?: string;
  queryParams?: Record<string, any>;
}

interface MetricsData {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  slowestRoute: string;
  slowestTime: number;
  requests: RequestLog[];
}

// In-memory metrics store (for development/small scale)
// For production, use external service like Sentry, DataDog, or New Relic
const metricsStore: MetricsData = {
  requestCount: 0,
  errorCount: 0,
  averageResponseTime: 0,
  slowestRoute: '',
  slowestTime: 0,
  requests: [],
};

const MAX_STORED_LOGS = 1000; // Keep last 1000 requests for debugging

/**
 * Extract IP address from request headers
 */
function getIpAddress(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Log an API request
 */
export function logRequest(
  request: NextRequest,
  statusCode: number,
  duration: number,
  userId?: string,
  error?: Error
): void {
  const log: RequestLog = {
    timestamp: new Date().toISOString(),
    method: request.method,
    path: request.nextUrl.pathname,
    statusCode,
    duration,
    userId,
    ipAddress: getIpAddress(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    queryParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
  };

  if (error) {
    log.error = error.message;
    log.errorStack = error.stack;
    metricsStore.errorCount++;
  }

  // Update metrics
  metricsStore.requestCount++;
  metricsStore.averageResponseTime =
    (metricsStore.averageResponseTime * (metricsStore.requestCount - 1) + duration) /
    metricsStore.requestCount;

  if (duration > metricsStore.slowestTime) {
    metricsStore.slowestTime = duration;
    metricsStore.slowestRoute = log.path;
  }

  // Store in memory (keep last 1000 for debugging)
  metricsStore.requests.push(log);
  if (metricsStore.requests.length > MAX_STORED_LOGS) {
    metricsStore.requests.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const color = statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, green for success
    const reset = '\x1b[0m';
    console.log(
      `${color}[${log.timestamp}] ${log.method} ${log.path} ${log.statusCode} ${log.duration}ms${reset}`,
      error ? `Error: ${error.message}` : ''
    );
  }

  // Log to external service in production
  if (process.env.NODE_ENV === 'production' && statusCode >= 400) {
    // TODO: Send to Sentry, DataDog, etc
    // sentryClient.captureException(error);
  }
}

/**
 * Timing middleware - wraps API handler to measure response time
 */
export async function withTiming(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  userId?: string
): Promise<NextResponse> {
  const startTime = performance.now();

  try {
    const response = await handler();
    const duration = Math.round(performance.now() - startTime);

    logRequest(request, response.status, duration, userId);
    return response;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    logRequest(request, 500, duration, userId, error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get current metrics
 */
export function getMetrics() {
  return {
    totalRequests: metricsStore.requestCount,
    totalErrors: metricsStore.errorCount,
    errorRate: metricsStore.requestCount > 0 ? (metricsStore.errorCount / metricsStore.requestCount) * 100 : 0,
    averageResponseTime: Math.round(metricsStore.averageResponseTime),
    slowestRoute: {
      path: metricsStore.slowestRoute,
      duration: metricsStore.slowestTime,
    },
    recentRequests: metricsStore.requests.slice(-20), // Last 20 requests
  };
}

/**
 * Log security event (failed auth, rate limit, etc)
 */
export function logSecurityEvent(
  eventType: 'auth_failed' | 'rate_limit' | 'csrf_failed' | 'suspicious_activity',
  request: NextRequest,
  details: Record<string, any> = {}
): void {
  const event = {
    timestamp: new Date().toISOString(),
    type: eventType,
    path: request.nextUrl.pathname,
    method: request.method,
    ipAddress: getIpAddress(request),
    userAgent: request.headers.get('user-agent') || 'unknown',
    details,
  };

  if (process.env.NODE_ENV === 'development') {
    console.warn('[SECURITY]', event);
  }

  // Log to external service in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to security monitoring service
    // securityMonitor.log(event);
  }
}

/**
 * Reset metrics (for testing)
 */
export function resetMetrics(): void {
  metricsStore.requestCount = 0;
  metricsStore.errorCount = 0;
  metricsStore.averageResponseTime = 0;
  metricsStore.slowestRoute = '';
  metricsStore.slowestTime = 0;
  metricsStore.requests = [];
}

/**
 * Express-style logging middleware pattern
 * Can be used to wrap route handlers
 */
export function createLoggingWrapper(userId?: string) {
  return async (handler: () => Promise<NextResponse>, request: NextRequest) => {
    return withTiming(request, handler, userId);
  };
}
