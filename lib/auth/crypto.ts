/**
 * Cryptographic utilities for password hashing and token generation
 * Uses Node.js built-in crypto module for security
 */

import crypto from 'crypto';

const HASH_ALGORITHM = 'sha256';
const SALT_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Hash a password using PBKDF2 with random salt
 * Secure against rainbow tables and brute force attacks
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, ITERATIONS, 64, HASH_ALGORITHM, (err, derivedKey) => {
      if (err) reject(err);
      const hash = derivedKey.toString('hex');
      // Store iterations:salt:hash for future-proofing
      resolve(`${ITERATIONS}:${salt}:${hash}`);
    });
  });
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [iterations, salt, storedHash] = hash.split(':');
    const iter = parseInt(iterations, 10);
    
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, iter, 64, HASH_ALGORITHM, (err, derivedKey) => {
        if (err) reject(err);
        const computedHash = derivedKey.toString('hex');
        // Timing-safe comparison to prevent timing attacks
        resolve(crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(storedHash)));
      });
    });
  } catch {
    return false;
  }
}

/**
 * Generate a secure random session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a secure random string for CSRF tokens, API keys, etc.
 */
export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
