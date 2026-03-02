/**
 * Authentication middleware for protecting API routes
 * Validates session and ensures user is authenticated
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from './session';

/**
 * Verify the request has a valid session
 * Returns the authenticated user or null
 */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;

    if (!sessionToken) {
      return null;
    }

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
