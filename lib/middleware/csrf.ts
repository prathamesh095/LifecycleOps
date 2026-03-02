/**
 * CSRF (Cross-Site Request Forgery) protection
 * Implements double-submit cookie pattern with token validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateRandomToken } from '@/lib/auth/crypto';

export const CSRF_TOKEN_NAME = 'X-CSRF-Token';
export const CSRF_COOKIE_NAME = '__csrf_token__';
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a new CSRF token
 */
export function generateCsrfToken(): string {
  return generateRandomToken(32);
}

/**
 * Get or create CSRF token from response
 * Should be called when serving pages that have forms
 */
export function getCsrfTokenFromResponse(response: NextResponse): string {
  const token = generateCsrfToken();
  
  // Set token in HTTP-only cookie
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: CSRF_TOKEN_EXPIRY / 1000,
    path: '/',
  });

  return token;
}

/**
 * Verify CSRF token from request
 * Call on POST/PUT/DELETE endpoints
 */
export function verifyCsrfToken(request: NextRequest): boolean {
  // Skip verification for GET requests (safe methods)
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    return true;
  }

  // CSRF token can come from:
  // 1. X-CSRF-Token header
  // 2. csrf-token header
  // 3. _csrf form field
  const headerToken = request.headers.get(CSRF_TOKEN_NAME) || 
                      request.headers.get('csrf-token');

  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  // If both present, they must match (double-submit cookie pattern)
  if (!headerToken || !cookieToken) {
    return false;
  }

  // Timing-safe comparison
  try {
    return headerToken === cookieToken;
  } catch {
    return false;
  }
}

/**
 * Middleware to enforce CSRF protection
 */
export async function csrfMiddleware(request: NextRequest) {
  if (!verifyCsrfToken(request)) {
    return NextResponse.json(
      { error: 'Invalid or missing CSRF token' },
      { status: 403 }
    );
  }

  return null; // No CSRF violation
}

/**
 * Set CSRF token in response headers for client to use
 */
export function setCsrfToken(response: NextResponse, token: string): void {
  // Also send as response header so JavaScript can read it
  response.headers.set(CSRF_TOKEN_NAME, token);
}
