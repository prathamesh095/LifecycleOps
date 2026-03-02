# Quick Reference Card

## Setup (First Time)

```bash
# 1. Create Neon account: https://console.neon.tech
# 2. Copy connection strings to .env.local:
echo 'DATABASE_URL="postgresql://..."' > .env.local
echo 'DIRECT_URL="postgresql://..."' >> .env.local

# 3. Install & initialize
npm install
npm run db:push
npm run dev
```

## API Client Usage

```typescript
import { applicationsAPI, activitiesAPI, contactsAPI, remindersAPI } from '@/lib/api-client';

// LIST (with pagination)
const { items, nextCursor, hasMore } = await applicationsAPI.list();
const { items, nextCursor, hasMore } = await applicationsAPI.list(cursor);
const { items, nextCursor, hasMore } = await applicationsAPI.list(cursor, 20, 'active');

// CREATE
const app = await applicationsAPI.create({
  name: 'Company Name',
  description: 'Job title',
  status: 'active'
});

// GET
const app = await applicationsAPI.get(id);

// UPDATE
const updated = await applicationsAPI.update(id, {
  status: 'archived'
});

// DELETE
await applicationsAPI.delete(id);
```

## React Hooks

### useApi<T>
```typescript
import { useApi } from '@/lib/hooks/useApi';

const { data, loading, error, execute } = useApi({
  showSuccessToast: true,
  successMessage: 'Operation successful'
});

// Use it
const result = await execute(apiCall);
```

### usePaginatedApi<T>
```typescript
import { usePaginatedApi } from '@/lib/hooks/useApi';

const { items, loading, hasMore, loadMore, refresh } = usePaginatedApi(
  (cursor) => applicationsAPI.list(cursor)
);

// Refresh on mount
useEffect(() => { refresh(); }, [refresh]);
```

## Component Integration Pattern

```typescript
'use client';

import { usePaginatedApi } from '@/lib/hooks/useApi';
import { applicationsAPI } from '@/lib/api-client';
import { useEffect } from 'react';

export function MyComponent() {
  // Fetch data
  const { items, loading, refresh } = usePaginatedApi(
    (cursor) => applicationsAPI.list(cursor)
  );

  // Refresh on mount
  useEffect(() => { refresh(); }, [refresh]);

  // Render
  if (loading) return <Spinner />;
  return items.map(item => <Item key={item.id} {...item} />);
}
```

## API Endpoints Reference

```
GET    /api/applications              List all
POST   /api/applications              Create
GET    /api/applications/[id]         Get one
PATCH  /api/applications/[id]         Update
DELETE /api/applications/[id]         Delete

GET    /api/activities                List all (with applicationId filter)
POST   /api/activities                Create
GET    /api/activities/[id]           Get one
PATCH  /api/activities/[id]           Update
DELETE /api/activities/[id]           Delete

GET    /api/contacts                  List all (with applicationId filter)
POST   /api/contacts                  Create
GET    /api/contacts/[id]             Get one
PATCH  /api/contacts/[id]             Update
DELETE /api/contacts/[id]             Delete

GET    /api/reminders                 List all (with applicationId & completed filters)
POST   /api/reminders                 Create
GET    /api/reminders/[id]            Get one
PATCH  /api/reminders/[id]            Update
DELETE /api/reminders/[id]            Delete
```

## Authentication

```typescript
import { initializeUserId, getUserId, setUserId, clearUserId } from '@/lib/auth-setup';

// Auto-initialized by AuthInitializer component
const userId = getUserId(); // Returns current user ID

// After login with your auth provider
setUserId(newUserId);

// On logout
clearUserId();
```

## Common Patterns

### Create & Refresh List
```typescript
const { execute, loading } = useApi({ showSuccessToast: true });
const { refresh } = usePaginatedApi(fetcher);

const handleCreate = async (data) => {
  await execute(applicationsAPI.create(data));
  await refresh(); // Reload list
};
```

### Update & Refresh
```typescript
const handleUpdate = async (id, data) => {
  await execute(applicationsAPI.update(id, data));
  await refresh();
};
```

### Delete with Confirmation
```typescript
const handleDelete = async (id) => {
  if (!confirm('Delete this item?')) return;
  try {
    await execute(applicationsAPI.delete(id));
    await refresh();
  } catch (error) {
    console.error(error);
  }
};
```

### Paginated List
```typescript
const { items, hasMore, loadMore } = usePaginatedApi(fetcher);

// In JSX
<button onClick={loadMore} disabled={!hasMore}>
  Load More
</button>
```

## Error Handling

Errors are automatically caught and toasted. To handle manually:

```typescript
const { execute } = useApi({ showErrorToast: false });

try {
  const result = await execute(apiCall);
} catch (error) {
  console.error(error.message);
  // Show custom error UI
}
```

## Query Parameters

```typescript
// List with filters
applicationsAPI.list(cursor, limit, status);
activitiesAPI.list(cursor, limit, applicationId);
contactsAPI.list(cursor, limit, applicationId);
remindersAPI.list(cursor, limit, applicationId, completed);
```

## Database Schema Quick View

```
User
├── email (unique)
├── name
├── createdAt

Application
├── userId (fk)
├── name
├── status: active|archived|closed
├── description
├── category
├── appliedDate

Activity
├── userId (fk)
├── applicationId (fk, optional)
├── type
├── title, description
├── date, notes

Contact
├── userId (fk)
├── applicationId (fk, optional)
├── name, role, email, phone, company

Reminder
├── userId (fk)
├── applicationId (fk, optional)
├── title, description
├── dueDate
├── completed: boolean
├── priority: low|medium|high
```

## Development Commands

```bash
npm run dev              # Start dev server
npm run build           # Build production
npm run start           # Run production build
npm run lint            # Check linting

npm run db:generate    # Regenerate Prisma client
npm run db:push        # Push schema changes
npx prisma studio     # Open database GUI
```

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
DIRECT_URL=postgresql://user:pass@host/db?sslmode=require

# Optional
NEXT_PUBLIC_GOOGLE_API_KEY=your_key_here
```

## Debugging

```typescript
// In browser console
import { getUserId } from '@/lib/auth-setup';
console.log('User ID:', getUserId());

import { applicationsAPI } from '@/lib/api-client';
const apps = await applicationsAPI.list();
console.log('Applications:', apps);

// Check API calls in DevTools Network tab
// All requests should include x-user-id header
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "User ID is required" | Check localStorage for `lifecycleops_user_id` |
| "Database connection failed" | Verify DATABASE_URL and DIRECT_URL in .env.local |
| "API returns 500" | Check server console for error details |
| "Data not loading" | Verify `refresh()` is called on component mount |
| "Pagination not working" | Use `cursor` and `loadMore()` not offset |
| "Build fails" | Run `npm run db:generate` and try again |

## Documentation Files

- **IMPLEMENTATION_SUMMARY.md** - Overview of what was built
- **NEON_SETUP.md** - Local setup & database guide
- **INTEGRATION_GUIDE.md** - Component migration examples
- **DEPLOYMENT_CHECKLIST.md** - Production readiness
- **BACKEND_IMPLEMENTATION.md** - Architecture & detailed guide
- **QUICK_REFERENCE.md** - This file

## Files You'll Edit Most

1. `components/*/Component.tsx` - Add API hooks, remove store usage
2. `.env.local` - Add connection strings
3. `lib/auth-setup.ts` - Replace with real auth provider
4. `app/layout.tsx` - May need to wrap with auth provider

## Files You Won't Touch

- `app/api/**` - API routes (already complete)
- `lib/api-client.ts` - API client (already complete)
- `prisma/schema.prisma` - Schema (already complete)
- `lib/validators.ts` - Validators (already complete)

## Useful Links

- Neon Console: https://console.neon.tech
- Neon Docs: https://neon.tech/docs
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs

---

**TL;DR**: Add .env vars → `npm install && npm run db:push` → Use `usePaginatedApi` hook in components → `npm run dev`
