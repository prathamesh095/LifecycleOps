/**
 * Session management utilities
 * Handles secure session creation, validation, and cleanup
 */

import { prisma } from '@/lib/db';
import { generateSessionToken } from './crypto';

export const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
export const ABSOLUTE_TIMEOUT = 30 * 24 * 60 * 60 * 1000; // 30 days max
export const REFRESH_THRESHOLD = 24 * 60 * 60 * 1000; // Refresh if less than 1 day remaining

/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        sessionToken: token,
        tokenExpiresAt: expiresAt,
      },
    });
    return token;
  } catch (error) {
    console.error('[Auth] Failed to create session:', error);
    throw new Error('Failed to create session');
  }
}

/**
 * Validate a session token and get the user
 * Returns user if valid, null if invalid or expired
 */
export async function validateSession(token: string) {
  if (!token) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { sessionToken: token },
    });

    if (!user) return null;
    if (!user.tokenExpiresAt || user.tokenExpiresAt < new Date()) {
      // Session expired, clear it
      await invalidateSession(user.id);
      return null;
    }
    if (!user.isActive) return null;

    return user;
  } catch (error) {
    console.error('[Auth] Session validation failed:', error);
    return null;
  }
}

/**
 * Invalidate a session (logout)
 */
export async function invalidateSession(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        sessionToken: null,
        tokenExpiresAt: null,
      },
    });
  } catch (error) {
    console.error('[Auth] Failed to invalidate session:', error);
  }
}

/**
 * Refresh a session if it's close to expiring
 * Called on each request to extend active sessions
 */
export async function refreshSessionIfNeeded(token: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { sessionToken: token },
    });

    if (!user || !user.tokenExpiresAt) return null;

    const timeRemaining = user.tokenExpiresAt.getTime() - Date.now();
    
    // Only refresh if less than 1 day remaining
    if (timeRemaining < REFRESH_THRESHOLD) {
      const newExpiresAt = new Date(Date.now() + SESSION_DURATION);
      await prisma.user.update({
        where: { id: user.id },
        data: { tokenExpiresAt: newExpiresAt },
      });
      return token; // Same token, just extended expiration
    }

    return token;
  } catch (error) {
    console.error('[Auth] Session refresh failed:', error);
    return null;
  }
}

/**
 * Clean up expired sessions (run periodically via cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.user.updateMany({
      where: {
        AND: [
          { tokenExpiresAt: { not: null } },
          { tokenExpiresAt: { lt: new Date() } },
        ],
      },
      data: {
        sessionToken: null,
        tokenExpiresAt: null,
      },
    });
    return result.count;
  } catch (error) {
    console.error('[Auth] Cleanup failed:', error);
    return 0;
  }
}
