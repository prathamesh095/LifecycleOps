/**
 * GET /api/auth/me
 * Get current authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSession, refreshSessionIfNeeded } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate session
    const user = await validateSession(sessionToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Try to refresh session if needed
    await refreshSessionIfNeeded(sessionToken);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('[Auth] Me endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
