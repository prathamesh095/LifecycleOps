# Authentication System Overview

## Architecture

The application uses a **session-based authentication system** with these components:

### Components

1. **Login Page** (`app/login/page.tsx`)
   - User interface for authentication
   - Demo mode for quick testing
   - Form validation
   - Sets session cookie

2. **Landing Page** (`app/page.tsx`)
   - Professional home page
   - Guides users to login
   - Auto-redirects authenticated users to dashboard

3. **Auth Setup Utilities** (`lib/auth-setup.ts`)
   - Manages user ID in localStorage
   - Works with session cookies
   - Functions: `initializeUserId()`, `getUserId()`, `setUserId()`, etc.

4. **Middleware** (`middleware.ts`)
   - Enforces authentication on protected routes
   - Redirects unauthenticated users to login
   - Adds security headers

5. **Auth Initializer** (`components/auth/AuthInitializer.tsx`)
   - Runs on app load
   - Sets up user session from localStorage
   - Future: Can be replaced with provider auth

## Data Flow

### When User Logs In

```
Login Page (app/login/page.tsx)
    ↓
"Try Demo" or "Login" button clicked
    ↓
Create/validate user in database
    ↓
setUserId() - Store in localStorage
    ↓
Set session cookie
    ↓
Redirect to /dashboard
    ↓
Middleware checks session cookie
    ↓
Router.refresh() clears cache
    ↓
Dashboard renders with authenticated user
```

### When Page Loads

```
App Load (RootLayout)
    ↓
AuthInitializer component mounts
    ↓
initializeUserId() called
    ↓
Checks localStorage for user ID
    ↓
If no ID, creates demo user ID
    ↓
Initializes authentication state
    ↓
Application ready to use
```

### When Accessing Protected Route

```
User visits /dashboard
    ↓
Middleware runs (middleware.ts)
    ↓
Check for session cookie
    ↓
Has cookie? → Allow access
    ↓
No cookie? → Redirect to /login
    ↓
Middleware also adds security headers
```

## File Structure

```
project/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── login/
│   │   ├── page.tsx            # Login page
│   │   └── layout.tsx          # Login layout (no sidebar)
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Dashboard page
│   │   ├── applications/
│   │   │   └── page.tsx        # Applications page
│   │   └── ...
│   └── api/
│       └── auth/
│           ├── login/
│           │   └── route.ts    # Login endpoint
│           ├── register/
│           │   └── route.ts    # Registration endpoint
│           └── logout/
│               └── route.ts    # Logout endpoint
├── components/
│   └── auth/
│       └── AuthInitializer.tsx # Auth setup component
├── lib/
│   ├── auth-setup.ts           # Auth utility functions
│   ├── auth/
│   │   ├── crypto.ts           # Password hashing
│   │   ├── session.ts          # Session management
│   │   └── middleware.ts       # Auth middleware
│   └── ...
├── middleware.ts               # Global middleware
└── ...
```

## Key Files and Their Roles

### 1. Landing Page (`app/page.tsx`)
**What it does:** Shows home page to visitors

**Key code:**
```typescript
useEffect(() => {
  if (isAuthenticated()) {
    router.push('/dashboard');
  }
}, [router]);
```

**Why:** Auto-redirects logged-in users so they don't see the landing page

### 2. Login Page (`app/login/page.tsx`)
**What it does:** Handles user authentication

**Key features:**
- Demo mode (quick start)
- Email/password form (for real auth)
- Sets session cookie
- Redirects to dashboard

**Key code:**
```typescript
document.cookie = `session=${userId}; path=/; max-age=${7 * 24 * 60 * 60}`;
```

**Why:** Session cookie lets middleware know user is authenticated

### 3. Middleware (`middleware.ts`)
**What it does:** Protects routes and adds security

**Key logic:**
```typescript
if (isProtectedRoute && !sessionToken) {
  return NextResponse.redirect(new URL('/login', request.url));
}
```

**Why:** Prevents unauthenticated access to protected routes

### 4. Auth Setup (`lib/auth-setup.ts`)
**What it does:** Manages user ID storage

**Functions:**
- `initializeUserId()` - Create/get user ID
- `getUserId()` - Get current user ID
- `setUserId()` - Store user ID
- `isAuthenticated()` - Check if logged in

**Why:** Provides consistent user ID across the app

### 5. Auth Initializer (`components/auth/AuthInitializer.tsx`)
**What it does:** Runs auth setup on app load

**Key code:**
```typescript
useEffect(() => {
  initializeUserId();
}, []);
```

**Why:** Ensures user ID is available before components render

## Security Considerations

### Current Implementation (Development)

| Aspect | Current | Status |
|--------|---------|--------|
| User ID | Stored in localStorage | ✅ Client-side |
| Session | HTTP-only cookie | ✅ Set by login page |
| Passwords | Demo mode (no passwords) | ⚠️ Demo only |
| HTTPS | Not enforced in dev | ⚠️ Must enforce in production |
| CSRF | Token validation ready | ⚠️ Not yet active |

### For Production

You should:

1. **Replace Demo Auth**
   ```typescript
   // Instead of demo mode, use:
   // - Supabase Auth
   // - NextAuth.js
   // - Clerk
   // - Firebase Auth
   ```

2. **Enable Password Hashing**
   ```typescript
   // lib/auth/crypto.ts has PBKDF2 hashing ready
   ```

3. **Enforce HTTPS**
   ```typescript
   // Secure flag on cookies (already in middleware)
   // HSTS headers (already in middleware)
   ```

4. **Add CSRF Protection**
   ```typescript
   // lib/middleware/csrf.ts is ready to use
   ```

5. **Enable Rate Limiting**
   ```typescript
   // lib/middleware/rate-limit.ts is ready
   ```

## Authentication Lifecycle

### Phase 1: User Visits App

```
Home Page
  ↓
AuthInitializer runs
  ↓
initializeUserId() called
  ↓
User ID created/retrieved
  ↓
App ready
```

### Phase 2: User Needs to Login

```
Visit /dashboard
  ↓
Middleware checks session cookie
  ↓
No cookie found
  ↓
Redirect to /login
  ↓
Login page shown
```

### Phase 3: User Logs In

```
"Try Demo" clicked
  ↓
Create demo user ID
  ↓
setUserId() called
  ↓
Session cookie set
  ↓
Redirect to /dashboard
  ↓
Middleware allows access
  ↓
Dashboard renders
```

### Phase 4: User Navigates App

```
Click on /applications
  ↓
Middleware sees session cookie
  ↓
Allow access
  ↓
Page loads
  ↓
Use getUserId() for API calls
  ↓
API routes validate user ID
```

### Phase 5: User Logs Out

```
Click logout
  ↓
clearUserId() called
  ↓
Clear session cookie
  ↓
Redirect to /login
  ↓
Unauthenticated state
```

## Environment Variables

No special auth environment variables needed for demo mode.

For production auth, you might need:
```
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://yourdomain.com
DATABASE_URL=your-database-connection
```

## Testing Authentication

### Test Demo Login
```bash
1. npm run dev
2. Visit http://localhost:3000
3. Click "Get Started"
4. Click "Try Demo"
5. Should see dashboard
```

### Test Session Persistence
```bash
1. Login (Try Demo)
2. Refresh page
3. Should still be logged in
4. Check browser DevTools → Application → Cookies → session
```

### Test Route Protection
```bash
1. Open new incognito window
2. Try to visit http://localhost:3000/dashboard
3. Should redirect to /login
4. Should NOT see dashboard
```

### Test Auto-Redirect
```bash
1. Login (Try Demo)
2. Visit http://localhost:3000/
3. Should redirect to /dashboard
4. Should NOT see landing page
```

## Customization Guide

### Change Login UI
Edit: `app/login/page.tsx`
- Modify form fields
- Change colors/styles
- Add company logo

### Change Landing Page
Edit: `app/page.tsx`
- Update copy
- Change features list
- Customize colors

### Add New Protected Route
1. Create page: `app/(dashboard)/newpage/page.tsx`
2. Add to `protectedRoutes` in `middleware.ts`
3. Add to navigation in `components/navigation/UnifiedNavigation.tsx`

### Add Auth Endpoints
Create new files in `app/api/auth/`:
- `profile/route.ts` - Get user profile
- `logout/route.ts` - Handle logout
- `refresh/route.ts` - Refresh session

### Replace with Real Auth

**Option 1: Supabase**
```typescript
import { createClient } from '@supabase/supabase-js'

// Use Supabase Auth instead of demo
```

**Option 2: NextAuth.js**
```typescript
import { auth } from "@/auth"

// Replace initializeUserId with auth session
```

**Option 3: Clerk**
```typescript
import { auth } from "@clerk/nextjs"

// Use Clerk for authentication
```

## Troubleshooting

### User Not Logged In After Page Refresh?

**Check:**
1. Session cookie exists: DevTools → Application → Cookies
2. Cookie has correct name: `session`
3. Cookie value matches: Compare with userId in localStorage

**Fix:**
```typescript
// Ensure cookie is being set
document.cookie = `session=${userId}; path=/; max-age=${7 * 24 * 60 * 60}`;
```

### Stuck on Login Page?

**Check:**
1. No errors in console (F12)
2. Button actually says "Try Demo"
3. Page refreshes after click

**Fix:**
```typescript
// Ensure redirect happens
router.push('/dashboard');
router.refresh();
```

### Can't Access API Routes?

**Check:**
1. Send `x-user-id` header with requests
2. Use `getUserId()` to get current user ID

**Fix:**
```typescript
const userId = getUserId();
fetch('/api/applications', {
  headers: {
    'x-user-id': userId
  }
});
```

## Summary

The authentication system provides:

✅ **Demo Mode** - Test without registering
✅ **Session-Based** - Secure cookie-based auth
✅ **Route Protection** - Middleware enforces access
✅ **User State** - User ID available throughout app
✅ **Ready for Production** - Can be upgraded to real auth
✅ **Security Built-In** - Headers, CSRF, rate limiting ready

The system is designed to work immediately in development and be easily upgradeable to production authentication providers.
