/**
 * Next.js middleware for global security and performance enhancements
 * Runs on every request at the edge
 * 
 * IMPORTANT: This file cannot import anything that depends on Prisma or database libraries
 * because middleware runs in the edge runtime which doesn't support these libraries.
 * Keep all imports and code here completely edge-safe.
 */

import { NextRequest, NextResponse } from 'next/server';

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

  // Simple token presence check (full validation happens server-side in API routes)
  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Apply security headers to all routes except:
    // - API routes (they have their own auth)
    // - Static assets
    // - Images and favicons
    // - Public folder
    // - _next folder
    '/((?!api|_next|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
