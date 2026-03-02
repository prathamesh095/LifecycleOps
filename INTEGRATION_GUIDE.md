# Frontend Integration Guide: Connecting to Backend API

This guide explains how to integrate the existing frontend components with the new Neon PostgreSQL backend API.

## Quick Start

### 1. Setup Authentication (Already Done)
When the app loads, `AuthInitializer` component automatically:
- Creates a demo user ID stored in `localStorage` under `lifecycleops_user_id`
- Passes this ID to all API requests via the `x-user-id` header

In production, replace this with your auth provider (Supabase, Clerk, Auth.js, etc).

### 2. Available API Hooks

Two main hooks are available in `lib/hooks/useApi.ts`:

#### useApi<T>
For single API calls with loading and error handling:

```typescript
import { useApi } from '@/lib/hooks/useApi';
import { applicationsAPI } from '@/lib/api-client';

export function MyComponent() {
  const { data, loading, error, execute } = useApi<Application>();

  const handleCreate = async () => {
    try {
      const newApp = await execute(
        applicationsAPI.create({
          name: 'Google',
          description: 'SWE Role',
        })
      );
      console.log('Created:', newApp);
    } catch (err) {
      console.error('Failed to create:', err);
    }
  };

  return <button onClick={handleCreate} disabled={loading}>Create</button>;
}
```

#### usePaginatedApi<T>
For fetching lists with pagination:

```typescript
import { usePaginatedApi } from '@/lib/hooks/useApi';
import { applicationsAPI } from '@/lib/api-client';

export function ApplicationsList() {
  const { items, loading, hasMore, loadMore, refresh } = usePaginatedApi(
    (cursor) => applicationsAPI.list(cursor)
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div>
      {items.map(app => <div key={app.id}>{app.name}</div>)}
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </div>
  );
}
```

## Integration Patterns

### Pattern 1: Replace Direct Store Usage with API Calls

**Before (using IndexedDB):**
```typescript
import { useApplicationStore } from '@/lib/store';

export function ApplicationsList() {
  const { applications } = useApplicationStore();
  
  return applications.map(app => <AppCard key={app.id} app={app} />);
}
```

**After (using backend API):**
```typescript
import { usePaginatedApi } from '@/lib/hooks/useApi';
import { applicationsAPI } from '@/lib/api-client';

export function ApplicationsList() {
  const { items: applications, loading, refresh } = usePaginatedApi(
    (cursor) => applicationsAPI.list(cursor)
  );

  useEffect(() => {
    refresh();
  }, [refresh]);
  
  return (
    <>
      {loading && <LoadingSpinner />}
      {applications.map(app => <AppCard key={app.id} app={app} />)}
    </>
  );
}
```

### Pattern 2: Create Operations

**Before:**
```typescript
const { addApplication } = useApplicationStore();

const handleCreate = (formData) => {
  const newApp = { ...formData, id: generateId() };
  addApplication(newApp);
};
```

**After:**
```typescript
import { useApi } from '@/lib/hooks/useApi';
import { applicationsAPI } from '@/lib/api-client';

const { execute, loading } = useApi({
  showSuccessToast: true,
  successMessage: 'Application created',
});

const handleCreate = async (formData) => {
  try {
    const newApp = await execute(
      applicationsAPI.create(formData)
    );
    // Component updates will automatically trigger via hooks
  } catch (error) {
    // Error is automatically toasted
  }
};
```

### Pattern 3: Update Operations

**Before:**
```typescript
const { updateApplication } = useApplicationStore();

const handleUpdate = (id, updates) => {
  const updated = { ...app, ...updates };
  updateApplication(updated);
};
```

**After:**
```typescript
import { useApi } from '@/lib/hooks/useApi';
import { applicationsAPI } from '@/lib/api-client';

const { execute, loading } = useApi({
  showSuccessToast: true,
  successMessage: 'Application updated',
});

const handleUpdate = async (id, updates) => {
  try {
    const updated = await execute(
      applicationsAPI.update(id, updates)
    );
    // Re-fetch list to show updated data
    await refresh();
  } catch (error) {
    // Error is automatically toasted
  }
};
```

### Pattern 4: Delete Operations

**Before:**
```typescript
const { deleteApplication } = useApplicationStore();

const handleDelete = (id) => {
  deleteApplication(id);
};
```

**After:**
```typescript
import { useApi } from '@/lib/hooks/useApi';
import { applicationsAPI } from '@/lib/api-client';

const { execute, loading } = useApi({
  showSuccessToast: true,
  successMessage: 'Application deleted',
});

const handleDelete = async (id) => {
  try {
    await execute(applicationsAPI.delete(id));
    // Re-fetch list to remove deleted item
    await refresh();
  } catch (error) {
    // Error is automatically toasted
  }
};
```

### Pattern 5: Related Data (Activities, Contacts, Reminders)

The same pattern applies to activities, contacts, and reminders:

```typescript
// Get activities for an application
import { activitiesAPI } from '@/lib/api-client';

const { items: activities, refresh } = usePaginatedApi(
  (cursor) => activitiesAPI.list(cursor, 20, applicationId)
);

// Create activity
await applicationsAPI.create({ applicationId, title, type });

// Update activity
await activitiesAPI.update(activityId, { notes: 'Updated' });

// Delete activity
await activitiesAPI.delete(activityId);
```

## Component-by-Component Integration

### 1. ApplicationsClient

**File:** `components/applications/ApplicationsClient.tsx`

Current implementation uses mock data and Zustand store. Update to:

```typescript
'use client';

import { usePaginatedApi } from '@/lib/hooks/useApi';
import { applicationsAPI } from '@/lib/api-client';
import { useEffect } from 'react';

export function ApplicationsClient() {
  const { items: applications, loading, refresh } = usePaginatedApi(
    (cursor) => applicationsAPI.list(cursor)
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) return <LoadingSpinner />;

  return (
    <PageContainer>
      <ApplicationsTable applications={applications} />
    </PageContainer>
  );
}
```

### 2. AddApplicationModal

**File:** `components/applications/AddApplicationModal.tsx`

Current implementation adds to store. Update to:

```typescript
import { useApi } from '@/lib/hooks/useApi';
import { applicationsAPI } from '@/lib/api-client';

export function AddApplicationModal({ onSuccess, onClose }) {
  const { execute, loading } = useApi({
    showSuccessToast: true,
    successMessage: 'Application added',
  });

  const handleSubmit = async (formData) => {
    try {
      await execute(applicationsAPI.create(formData));
      onSuccess();
      onClose();
    } catch (error) {
      // Error is automatically toasted
    }
  };

  return (
    <Modal>
      <ApplicationForm onSubmit={handleSubmit} loading={loading} />
    </Modal>
  );
}
```

### 3. ApplicationDetailClient

**File:** `components/application-detail/ApplicationDetailClient.tsx`

Current implementation loads from store. Update to:

```typescript
import { useApi } from '@/lib/hooks/useApi';
import { usePaginatedApi } from '@/lib/hooks/useApi';
import { applicationsAPI, activitiesAPI, contactsAPI, remindersAPI } from '@/lib/api-client';

export function ApplicationDetailClient({ applicationId }) {
  const { data: application, execute: executeGetApp } = useApi();
  const { items: activities, refresh: refreshActivities } = usePaginatedApi(
    (cursor) => activitiesAPI.list(cursor, 20, applicationId)
  );
  const { items: contacts, refresh: refreshContacts } = usePaginatedApi(
    (cursor) => contactsAPI.list(cursor, 20, applicationId)
  );
  const { items: reminders, refresh: refreshReminders } = usePaginatedApi(
    (cursor) => remindersAPI.list(cursor, 20, applicationId)
  );

  useEffect(() => {
    executeGetApp(applicationsAPI.get(applicationId));
    refreshActivities();
    refreshContacts();
    refreshReminders();
  }, [applicationId, executeGetApp, refreshActivities, refreshContacts, refreshReminders]);

  // Rest of component...
}
```

### 4. Contacts, Reminders, Dashboard

Apply the same pattern to:
- `components/contacts/ContactsClient.tsx` → use `contactsAPI`
- `components/reminders/RemindersClient.tsx` → use `remindersAPI`
- `components/dashboard/DashboardClient.tsx` → fetch all data in parallel

## Testing Your Integration

### 1. Start Local Dev Server
```bash
npm run dev
```

### 2. Open DevTools
- Application tab → LocalStorage
- Verify `lifecycleops_user_id` is set

### 3. Test API Calls
```bash
# In DevTools Console

// Import the API client
import { applicationsAPI } from '@/lib/api-client';

// Create an application
await applicationsAPI.create({
  name: 'Test Company',
  description: 'Test Role',
  status: 'active'
});

// List applications
const { items } = await applicationsAPI.list();
console.log(items);

// Update an application
await applicationsAPI.update(itemId, { status: 'archived' });

// Delete an application
await applicationsAPI.delete(itemId);
```

### 4. Check Network Tab
In DevTools → Network tab, you should see:
- Requests to `/api/applications`
- Requests to `/api/activities`
- Requests to `/api/contacts`
- Requests to `/api/reminders`

All requests should include the `x-user-id` header.

## Data Type Mapping

The frontend receives responses from the API with these types:

```typescript
// Application
interface ApplicationResponse {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'closed';
  category?: string;
  appliedDate?: string;
  createdAt: string;
  updatedAt: string;
  activities?: any[];
  contacts?: any[];
  reminders?: any[];
}

// Activity
interface ActivityResponse {
  id: string;
  userId: string;
  applicationId?: string;
  type: string;
  title: string;
  description?: string;
  date?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  application?: any;
}

// Contact
interface ContactResponse {
  id: string;
  userId: string;
  applicationId?: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  application?: any;
}

// Reminder
interface ReminderResponse {
  id: string;
  userId: string;
  applicationId?: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  application?: any;
}
```

Map these to your existing UI schemas as needed.

## Troubleshooting

### "User ID is required" Error
- Check that `AuthInitializer` is in root layout
- Verify localStorage has `lifecycleops_user_id` key
- Check DevTools Console for any errors

### "Failed to fetch applications" Error
- Make sure Neon database is set up with proper environment variables
- Check server logs for database connection errors
- Verify API routes are created in `app/api/`

### Data Not Showing
- Add debug logs to your components
- Check Network tab in DevTools for API responses
- Verify `refresh()` is called on component mount

### Slow Performance
- Use pagination with `loadMore()` instead of loading all data at once
- Implement caching in your components
- Check database indexes in Neon dashboard

## Next Steps

1. **Audit Components**: List all components that use `useApplicationStore`
2. **Prioritize**: Start with high-traffic components (Dashboard, ApplicationsList)
3. **Migrate One by One**: Test each component thoroughly before moving to the next
4. **Test Flows**: Test create, read, update, delete flows for each resource
5. **Performance**: Monitor API call frequency and optimize as needed
6. **Auth**: Replace demo auth with production auth provider
7. **Deployment**: Deploy to Vercel with Neon environment variables

## Support

- API Client: `lib/api-client.ts`
- Hooks: `lib/hooks/useApi.ts`
- Auth Setup: `lib/auth-setup.ts`
- API Routes: `app/api/`
- Documentation: `NEON_SETUP.md`
