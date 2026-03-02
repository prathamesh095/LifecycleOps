# Neon PostgreSQL Setup Guide for LifecycleOps

This guide walks you through setting up the production-ready Neon PostgreSQL integration for LifecycleOps.

## Overview

The LifecycleOps application has been migrated from client-side storage (IndexedDB) to a production-ready Neon PostgreSQL backend with:

- **Prisma ORM** for type-safe database access
- **Serverless-optimized schema** with indexed tables for fast queries
- **RESTful API routes** for all CRUD operations
- **Cursor-based pagination** for efficient data loading
- **Input validation** using Zod schemas
- **Row-level authorization** via `x-user-id` header

## Architecture

### Database Schema

```
User (stores user information)
├── Application (job applications)
│   ├── Activity (interview, follow-up, etc.)
│   ├── Contact (recruiter/hiring manager info)
│   └── Reminder (task deadlines)
├── Activity (user's activities)
├── Contact (user's contacts)
└── Reminder (user's reminders)
```

### API Routes

All API routes require the `x-user-id` header for authorization:

```
GET    /api/applications           # List applications
POST   /api/applications           # Create application
GET    /api/applications/[id]      # Get application details
PATCH  /api/applications/[id]      # Update application
DELETE /api/applications/[id]      # Delete application

GET    /api/activities             # List activities
POST   /api/activities             # Create activity
GET    /api/activities/[id]        # Get activity details
PATCH  /api/activities/[id]        # Update activity
DELETE /api/activities/[id]        # Delete activity

GET    /api/contacts               # List contacts
POST   /api/contacts               # Create contact
GET    /api/contacts/[id]          # Get contact details
PATCH  /api/contacts/[id]          # Update contact
DELETE /api/contacts/[id]          # Delete contact

GET    /api/reminders              # List reminders
POST   /api/reminders              # Create reminder
GET    /api/reminders/[id]         # Get reminder details
PATCH  /api/reminders/[id]         # Update reminder
DELETE /api/reminders/[id]         # Delete reminder
```

## Local Development Setup

### Step 1: Create a Neon Project

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Sign up or log in to your account
3. Create a new project
4. Select PostgreSQL version (15 or later recommended)
5. Note your database credentials

### Step 2: Configure Environment Variables

1. Create a `.env.local` file in the project root
2. Add your Neon connection strings:

```bash
# Pooled connection (for serverless functions)
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"

# Direct connection (for migrations/schema changes)
DIRECT_URL="postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"
```

**How to get these strings:**
- In Neon Dashboard, go to Connection String
- Copy the "Pooled connection" string for `DATABASE_URL`
- Copy the "Direct connection" string for `DIRECT_URL`

### Step 3: Set Up the Database

Run the setup script to initialize the database:

```bash
chmod +x scripts/setup-db.sh
./scripts/setup-db.sh
```

Or manually run:

```bash
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema to database
```

### Step 4: Verify Setup

Check that tables were created:

```bash
npx prisma studio  # Opens an interactive database explorer
```

You should see 5 tables: User, Application, Activity, Contact, Reminder

## Using the API Client

The application provides a fully typed API client in `lib/api-client.ts`:

```typescript
import { applicationsAPI } from "@/lib/api-client";

// List applications (with pagination)
const { items, nextCursor, hasMore } = await applicationsAPI.list();

// Create application
const app = await applicationsAPI.create({
  name: "Google SWE",
  description: "Senior Software Engineer role",
  status: "active",
});

// Update application
const updated = await applicationsAPI.update(id, {
  status: "closed",
});

// Delete application
await applicationsAPI.delete(id);
```

Similarly for `activitiesAPI`, `contactsAPI`, and `remindersAPI`.

## User Authentication Setup

Currently, the API expects a `userId` from localStorage. For production, you should:

1. **Implement proper authentication** (e.g., Auth.js, Clerk, Supabase Auth)
2. **Store the user ID from your auth provider**
3. **Update `lib/api-client.ts`** to get the user ID from your auth context instead of localStorage:

```typescript
// Before
function getUserId(): string {
  return localStorage.getItem("userId") || "";
}

// After (example with Auth.js)
function getUserId(): string {
  const session = useSession();
  return session?.user?.id || "";
}
```

## Migration from IndexedDB

The app previously stored data in IndexedDB using Zustand. To migrate existing data:

1. **Export data from IndexedDB:**
   - Open browser DevTools → Application → IndexedDB
   - Note the existing applications, activities, contacts, reminders

2. **Create a migration script** that:
   - Reads from IndexedDB
   - Creates users and their associated records via the API
   - Removes IndexedDB stores once data is migrated

3. **Update Zustand stores** to use the backend API instead of localStorage

## Performance Optimization

### Free Tier Limits (Neon)
- **Database size**: 500 MB
- **Backup retention**: 7 days
- **Max connections**: 20

### Storage-Efficient Practices

1. **Archive old records**: Move closed applications to `status: "archived"`
2. **Delete unused data**: Regularly clean up old activities and reminders
3. **Cursor pagination**: Always use pagination to limit data transferred per request

### Query Optimization

All tables have strategic indexes:
```sql
-- User: indexed by email for fast lookups
-- Application: indexed by userId, status, createdAt
-- Activity: indexed by userId, applicationId, date, createdAt
-- Contact: indexed by userId, applicationId, email
-- Reminder: indexed by userId, applicationId, dueDate, completed
```

## Production Deployment

### Vercel Deployment

1. **Add Neon integrations:**
   - In Vercel Dashboard → Settings → Integrations
   - Connect your Neon project

2. **Set environment variables:**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add `DATABASE_URL` and `DIRECT_URL` from your Neon project

3. **Run migrations before deploy:**
   ```bash
   npm run db:push
   ```

4. **Deploy:**
   ```bash
   git push  # Vercel auto-deploys on push to main
   ```

### Monitoring

- **Database usage**: Check Neon Dashboard for storage and connection metrics
- **API errors**: Check Vercel logs for failed API requests
- **Slow queries**: Enable Neon's query insights to identify bottlenecks

## Troubleshooting

### "DATABASE_URL is not set"

Make sure you've created `.env.local` with your connection strings:
```bash
DATABASE_URL="..." 
DIRECT_URL="..."
```

### "Prisma could not connect to database"

1. Verify your connection strings are correct
2. Check that Neon project is active in the dashboard
3. Ensure your IP is whitelisted (Neon allows all IPs by default)
4. Try connecting with `psql` CLI to verify credentials:
   ```bash
   psql "postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require"
   ```

### "User ID is required" error from API

Make sure you're setting the `x-user-id` header in all requests. Check `lib/api-client.ts` and verify `getUserId()` returns a valid user ID.

### "500 Internal Server Error" on API calls

Check the server logs:
- **Local**: Look at terminal output where you ran `npm run dev`
- **Vercel**: Check Vercel Dashboard → Functions logs

### Connection pool exhausted

If you see "sorry, too many clients already", you've hit Neon's connection limit (20 for free tier). Solutions:
1. Implement connection pooling in your app
2. Upgrade to a paid Neon plan
3. Close unused database connections

## Database Scaling

When you outgrow the free tier:

1. **Upgrade Neon plan** for more storage and connections
2. **Archive old records** to keep database lean
3. **Implement caching** to reduce database queries
4. **Use read replicas** for high-traffic read operations

## Next Steps

1. ✅ Set up Neon project and connection strings
2. ✅ Run `./scripts/setup-db.sh` to initialize database
3. ⬜ Update frontend components to use `lib/api-client.ts`
4. ⬜ Implement proper user authentication
5. ⬜ Add user creation endpoint (`POST /api/users`)
6. ⬜ Test all CRUD operations with real data
7. ⬜ Deploy to Vercel and monitor performance
8. ⬜ Set up automated backups for critical data

## Support

For issues or questions:
- **Neon Docs**: https://neon.tech/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
