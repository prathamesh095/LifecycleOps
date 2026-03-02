/**
 * Authentication middleware for protecting API routes
 * Validates session and ensures user is authenticated
 * 
 * NOTE: This is imported in server-side code only (API routes, server components)
 * NOT in middleware.ts which runs on edge runtime
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Verify the request has a valid session
 * Returns the authenticated user or null
 * 
 * This function should only be called from server-side API routes, not from edge middleware
 */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;

    if (!sessionToken) {
      return null;
    }

    // Import validateSession only when needed (lazy load to avoid edge runtime issues)
    const { validateSession } = await import('./session');
    
    const user = await validateSession(sessionToken);
    return user;
  } catch {
    return null;
  }
}

/**
 * Middleware function to protect API routes
 * Returns 401 if user is not authenticated
 */
export async function requireAuth(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Valid session required' },
      { status: 401 }
    );
  }

  return user;
}

/**
 * Verify that a userId in the request matches the authenticated user
 * Prevents users from accessing other users' data
 */
export async function verifyUserOwnership(
  request: NextRequest,
  userId: string
): Promise<boolean> {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return false;
  }

  // User can only access their own data
  return user.id === userId;
}
