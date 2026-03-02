'use client';

import { useEffect } from 'react';
import { initializeUserId } from '@/lib/auth-setup';

/**
 * Component that initializes authentication on app load
 * This sets up the user ID in localStorage for development
 * 
 * In production, replace this with:
 * - Supabase Auth provider
 * - NextAuth session provider
 * - Clerk provider
 * - Firebase Auth
 * etc.
 */
export function AuthInitializer() {
  useEffect(() => {
    // Initialize user ID when app loads
    initializeUserId();
  }, []);

  return null;
}
