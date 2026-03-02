/**
 * Next.js middleware for global security and performance enhancements
 * Runs on every request at the edge
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from './lib/auth/session';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers globally
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  // HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Redirect unauthenticated users trying to access protected routes
  const sessionToken = request.cookies.get('session')?.value;
  const pathname = request.nextUrl.pathname;

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/applications', '/activities', '/contacts', '/reminders'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !sessionToken) {
    // Check if session is still valid
    const user = await validateSession(sessionToken || '');
    
    if (!user) {
      // Redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
