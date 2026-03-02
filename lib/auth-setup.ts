/**
 * Authentication setup utilities for the backend integration
 * This file manages user ID storage and retrieval
 * 
 * In a production app, replace this with:
 * - Auth.js (NextAuth)
 * - Supabase Auth
 * - Clerk
 * - Firebase Auth
 * etc.
 */

const USER_ID_KEY = "lifecycleops_user_id";

/**
 * Initialize a user ID in localStorage if not already present
 * This is for development/demo purposes only
 * 
 * In production, this would be set by your auth provider after successful login
 */
export function initializeUserId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    // Generate a simple demo user ID
    // In production, this would be provided by your auth system
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

/**
 * Get the current user ID
 */
export function getUserId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  
  return localStorage.getItem(USER_ID_KEY) || "";
}

/**
 * Set the user ID (called after successful authentication)
 */
export function setUserId(userId: string): void {
  if (typeof window === "undefined") {
    return;
  }
  
  localStorage.setItem(USER_ID_KEY, userId);
}

/**
 * Clear the user ID (called on logout)
 */
export function clearUserId(): void {
  if (typeof window === "undefined") {
    return;
  }
  
  localStorage.removeItem(USER_ID_KEY);
}

/**
 * Check if a user is authenticated
 */
export function isAuthenticated(): boolean {
  return Boolean(getUserId());
}
