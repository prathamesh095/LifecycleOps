# Prisma Architecture & Setup Flow

This document explains how Prisma is integrated into this Next.js project, with clear diagrams and explanations.

## What is Prisma in This Project?

Prisma is the bridge between your Next.js application and your PostgreSQL database. It:

1. **Defines your database schema** - What tables and fields exist
2. **Generates TypeScript types** - Safe, typed database queries
3. **Provides query utilities** - Easy database operations without SQL
4. **Handles migrations** - Safe schema changes over time

## Project Structure

```
project/
├── prisma/
│   ├── schema.prisma          ← Your database blueprint
│   └── migrations/            ← Record of schema changes
│
├── lib/
│   ├── db.ts                  ← Prisma client setup
│   └── db-queries.ts          ← Optimized query helpers
│
├── app/
│   ├── api/
│   │   ├── auth/              ← Authentication endpoints
│   │   ├── applications/      ← App CRUD endpoints
│   │   ├── activities/        ← Activity CRUD endpoints
│   │   └── ...                ← Other API routes
│   │
│   └── layout.tsx             ← Root layout
│
├── .env.example               ← Template for env variables
├── .env.local                 ← Your local variables (not committed)
└── package.json               ← Scripts & dependencies
```

## How It Works: The Complete Flow

### 1. Installation Phase

```
npm install
    ↓
npm runs postinstall hook
    ↓
postinstall: "prisma generate || true"
    ↓
Prisma reads prisma/schema.prisma
    ↓
Generates TypeScript types and client code
    ↓
Saves to: node_modules/.prisma/client/
    ↓
✓ Project ready for development
```

**What happens:** When you first clone and run `npm install`, Prisma automatically generates the client code needed to query your database.

**Why it matters:** This prevents the "Prisma did not initialize" error before you even start developing.

---

### 2. Development Phase

```
npm run dev
    ↓
Next.js starts dev server on port 3000
    ↓
Loads environment variables from .env.local
    ↓
Routes can now use Prisma:
    
    import { prisma } from '@/lib/db';
    
    const users = await prisma.user.findMany();
    ↓
✓ Application running with database access
```

**File: `lib/db.ts`**
```typescript
// This file creates a singleton Prisma client
// Singleton = only one instance across the whole app
// (prevents too many database connections)

let prisma = null;
if (typeof window === "undefined") {  // Only server-side
  const { PrismaClient } = require("@prisma/client");
  prisma = globalThis.prisma || new PrismaClient();
}
export { prisma };
```

**Why it works:** By creating a singleton, the same Prisma client is reused across all requests, which is efficient and prevents connection exhaustion.

---

### 3. API Route Phase

```
User makes request → GET /api/applications
    ↓
Authentication middleware checks session
    ↓
Handler function runs:
    
    import { prisma } from '@/lib/db';
    
    const apps = await prisma.application.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    ↓
Database returns data
    ↓
Response sent to user with JSON
    ↓
✓ Data delivered
```

**What's happening:** Each API route can import Prisma and make database queries. Prisma automatically:
- Validates your query
- Prevents SQL injection
- Returns typed results
- Handles database errors

---

### 4. Schema Change Phase

When you update the database schema:

```
Edit prisma/schema.prisma
    ↓
npm run db:migrate  (creates migration)
or
npm run db:push  (for development)
    ↓
Prisma compares schema to database
    ↓
Generates migration file (if needed)
    ↓
Applies changes to database
    ↓
Regenerates TypeScript types
    ↓
npm run dev
    ↓
✓ New fields are available to query
```

**Example Schema Change:**
```prisma
// Before:
model User {
  id String @id
  email String
}

// After (adding a phone field):
model User {
  id String @id
  email String
  phone String?  // New field
}
```

Then:
```bash
npm run db:migrate
# Creates: prisma/migrations/20240101000000_add_phone/migration.sql
```

---

### 5. Build Phase

```
npm run build
    ↓
Runs: prisma generate
    ↓
Regenerates Prisma client
    ↓
Runs: next build
    ↓
Compiles TypeScript & optimizes assets
    ↓
Creates .next/ folder
    ↓
✓ Ready to deploy
```

**Why separate generate and build?** 
- Ensures Prisma types are fresh before compilation
- Catches schema errors early
- Prevents type mismatches

---

### 6. Deployment Phase

```
Push code to git
    ↓
Vercel detects push
    ↓
Clones repository
    ↓
Runs: npm install
    ├─ Executes postinstall hook
    └─ Generates Prisma client
    ↓
Runs: npm run build
    ├─ Regenerates Prisma
    └─ Builds Next.js
    ↓
Runs: npm start
    ├─ Loads environment variables
    └─ Starts production server
    ↓
Sets DATABASE_URL & DIRECT_URL
    ├─ Prisma connects to production database
    └─ Queries work immediately
    ↓
✓ Application live
```

## Environment Variables & Configuration

### Local Development (.env.local)

```bash
# DATABASE_URL: Used by your application
# Format: postgresql://username:password@host:port/database
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"

# DIRECT_URL: Used for migrations (must be direct, not pooled)
DIRECT_URL="postgresql://user:pass@localhost:5432/mydb"

# Other variables
GEMINI_API_KEY="..."
APP_URL="http://localhost:3000"
```

### Production (Environment Variables in Hosting)

Set in your hosting platform (e.g., Vercel):

```
DATABASE_URL = postgresql://user:pass@host.neon.tech/db?pgbouncer=true
DIRECT_URL = postgresql://user:pass@host.neon.tech/db?sslmode=require
```

**Key difference for Neon:**
- `DATABASE_URL`: Pooled connection (with `pgbouncer=true`)
- `DIRECT_URL`: Direct connection (no pooling)

## Why These Scripts?

### `postinstall`

```json
"postinstall": "prisma generate || true"
```

- Runs automatically after `npm install`
- Generates Prisma client
- Prevents "client did not initialize" error
- `|| true` means don't fail the entire install if Prisma generation fails

### `db:generate`

```json
"db:generate": "prisma generate"
```

Manual generation (rarely needed):
```bash
npm run db:generate  # Generate Prisma client types
```

### `db:migrate`

```json
"db:migrate": "prisma migrate dev"
```

Create and run a migration:
```bash
# Edit schema.prisma, then:
npm run db:migrate
# Creates prisma/migrations/[timestamp]_description/
# Applies changes to database
# Generates updated Prisma client
```

### `db:push`

```json
"db:push": "prisma db push"
```

Quick schema push (dev only):
```bash
# Edit schema.prisma, then:
npm run db:push
# Applies to database immediately (no migration file)
# For development convenience
```

### `build`

```json
"build": "prisma generate && next build"
```

Pre-deployment build:
```bash
# Ensures Prisma is fresh
# Then builds Next.js
# Catches errors before deployment
```

## Database Tables & Relations

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ passwordHash    │
│ sessionToken    │
│ tokenExpiresAt  │
│ createdAt       │
└─────────────────┘
        │
        ├─ 1 User : N Applications
        ├─ 1 User : N Activities
        ├─ 1 User : N Contacts
        └─ 1 User : N Reminders
        │
┌───────┴──────┬──────────┬──────────┐
│              │          │          │
v              v          v          v
┌─────────────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐
│  Application    │  │ Activity │  │  Contact   │  │ Reminder │
└─────────────────┘  └──────────┘  └────────────┘  └──────────┘
│ id              │  │ id       │  │ id        │  │ id      │
│ userId (FK)     │  │ userId   │  │ userId    │  │ userId  │
│ name            │  │ appId    │  │ appId     │  │ appId   │
│ status          │  │ title    │  │ name      │  │ title   │
│ description     │  │ date     │  │ email     │  │ dueDate │
│ appliedDate     │  │ notes    │  │ phone     │  │ complete│
└─────────────────┘  └──────────┘  └────────────┘  └──────────┘
```

## Error Prevention Built-In

The system prevents errors in several ways:

### 1. Automatic Generation

```json
"postinstall": "prisma generate || true"
```
✅ Automatically generates on install

### 2. Generation Before Build

```json
"build": "prisma generate && next build"
```
✅ Regenerates before each build

### 3. Safe Client Initialization

```typescript
// lib/db.ts
let prisma = null;
try {
  if (typeof window === "undefined" && !process.env.EDGE_RUNTIME) {
    const { PrismaClient } = require("@prisma/client");
    prisma = globalThis.prisma || new PrismaClient();
  }
} catch (error) {
  // Creates helpful error message if generation failed
  prisma = new Proxy({}, {
    get: () => {
      throw new Error("Prisma client not initialized. Run 'npm run db:generate'.");
    },
  });
}
```
✅ Handles failures gracefully

### 4. Edge Runtime Safety

Middleware (which runs in edge runtime) doesn't use Prisma:

```typescript
// middleware.ts - NO Prisma imports here
// Only security headers and basic routing
```
✅ Prevents edge runtime errors

## Typical Workflow

### Day 1: Initial Setup
```bash
git clone <repo>
npm install                    # Prisma auto-generates
cp .env.example .env.local     # Set up env vars
npm run db:push               # Create tables
npm run dev                   # Start developing
```

### Day 2-10: Development
```bash
# Make API routes using Prisma
# Query database safely with types

npm run dev
# Changes auto-reload
```

### Day 11: Schema Change
```bash
# Edit prisma/schema.prisma
npm run db:migrate            # Create migration
# Or: npm run db:push         # Quick push
npm run dev                   # Continue developing
```

### Day 20: Prepare for Deployment
```bash
npm run build                 # Test build locally
# Verify no errors
git add -A
git commit -m "Ready for production"
git push                      # Triggers deployment
```

### Day 21: Deploy
```
Vercel automatically:
  npm install     → (Prisma generates)
  npm run build   → (Prisma regenerates)
  npm start       → (App runs)
```

## Key Takeaways

1. **Prisma generates on `npm install`** - You get client code automatically
2. **Regenerates before build** - Ensures types are current
3. **Database URL required at runtime** - Tells Prisma where database is
4. **Migrations track schema history** - Safe collaboration and deployments
5. **TypeScript types guaranteed** - All queries are type-safe
6. **Edge runtime excluded** - Middleware doesn't access database

## Next Steps

1. Read `PRISMA_SETUP_GUIDE.md` for detailed setup instructions
2. Read `INITIALIZATION_CHECKLIST.md` for step-by-step guide
3. Read `DEPLOYMENT_CONFIGURATION.md` for deployment details
4. Read `PRISMA_TROUBLESHOOTING.md` if you run into issues

For more information, visit [Prisma Documentation](https://www.prisma.io/docs).
