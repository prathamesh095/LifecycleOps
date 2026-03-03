# Prisma Troubleshooting Reference

Quick solutions for common Prisma and database issues.

## Common Errors and Solutions

### Error: "Prisma client did not initialize yet"

**Where you see it:**
```
Error: @prisma/client did not initialize yet. 
Please run "prisma generate" and try to import it again.
```

**Causes:**
- Prisma client code hasn't been generated
- Interrupted npm install
- Corrupted node_modules

**Solutions:**

1. **Quick fix (usually works):**
   ```bash
   npm run db:generate
   npm run dev
   ```

2. **If that doesn't work:**
   ```bash
   # Reinstall everything
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **If still failing:**
   ```bash
   # Check what's wrong
   npx prisma validate
   
   # Try to regenerate with details
   npx prisma generate --verbose
   ```

---

### Error: "Error in postinstall script"

**Where you see it:**
```
npm ERR! code ELIFECYCLE
npm ERR! ./node_modules/@prisma: postinstall failed with exit code 1
```

**Causes:**
- Missing `@prisma/client` package
- Corrupted Prisma files
- Node version mismatch

**Solutions:**

1. **Check Node version:**
   ```bash
   node --version
   # Should be v18 or higher
   ```

2. **Clean and reinstall:**
   ```bash
   rm -rf node_modules .next
   npm cache clean --force
   npm install
   ```

3. **Force Prisma regeneration:**
   ```bash
   npm install --force
   npm run db:generate
   ```

---

### Error: "Cannot find module '@prisma/client'"

**Where you see it:**
```
Error: Cannot find module '@prisma/client'
Require stack: [.../lib/db.ts]
```

**Causes:**
- Incomplete npm install
- node_modules deleted
- Symbolic link broken

**Solutions:**

1. **Reinstall dependencies:**
   ```bash
   npm install
   ```

2. **Verify Prisma was installed:**
   ```bash
   ls node_modules/@prisma
   # Should show: client, engines, internals, etc.
   ```

3. **If that doesn't show Prisma:**
   ```bash
   npm install @prisma/client
   npm run db:generate
   ```

---

### Error: "Unable to connect to database"

**Where you see it:**
```
Error: P1000: Authentication failed
Error: P1001: Can't reach database server
Error: ENOTFOUND (host not found)
```

**Causes:**
- DATABASE_URL is missing or wrong
- Database server is down
- Network connection blocked

**Solutions:**

1. **Verify environment variable is set:**
   ```bash
   # On Mac/Linux:
   echo $DATABASE_URL
   
   # On Windows PowerShell:
   $Env:DATABASE_URL
   
   # In .env file:
   cat .env.local | grep DATABASE_URL
   ```

2. **Check .env.local exists:**
   ```bash
   ls -la .env.local
   # Should exist in project root
   ```

3. **Test the connection manually:**
   ```bash
   npm install psql  # PostgreSQL client
   psql $DATABASE_URL
   # Should connect to database
   ```

4. **Check if database is running:**
   - For Neon: Check status at neon.tech dashboard
   - For local PostgreSQL: `sudo systemctl status postgresql`
   - For Docker: `docker ps | grep postgres`

---

### Error: "DIRECT_URL is not set"

**Where you see it:**
During `prisma migrate` or deployment:
```
Error: Error parsing error.message: 
Prisma schema validation error when validating migration lock
```

**Causes:**
- DIRECT_URL environment variable missing
- Typo in .env file
- Environment not loaded

**Solutions:**

1. **Add DIRECT_URL to .env.local:**
   ```bash
   # Edit .env.local
   DATABASE_URL=postgresql://...
   DIRECT_URL=postgresql://...  # Add this line
   ```

2. **Restart development server:**
   ```bash
   # Stop with Ctrl+C
   npm run dev
   # Server reloads environment variables
   ```

3. **Verify it's set:**
   ```bash
   echo $DIRECT_URL
   # Should show your direct connection string
   ```

4. **In production:** Set both in your hosting platform's dashboard

---

### Error: "Schema validation error"

**Where you see it:**
```
Error: Schema parsing
error: This is a migration file, it cannot be edited directly
```

**Causes:**
- Edited migration file manually
- Schema syntax error
- Invalid field type

**Solutions:**

1. **Validate schema syntax:**
   ```bash
   npx prisma validate
   # Shows exactly what's wrong
   ```

2. **Don't edit migration files**
   - If you did: Delete the migration folder and run `npm run db:migrate` again

3. **Check schema format:**
   ```prisma
   // ✓ Correct
   model User {
     id String @id @default(cuid())
   }
   
   // ✗ Wrong (missing type)
   model User {
     id @id @default(cuid())
   }
   ```

---

### Error: "Table already exists"

**Where you see it:**
```
Error: P3011: Introspection operation failed to generate the schema
Prisma schema validation error when validating migration lock
```

**Causes:**
- Ran migrations twice
- Database already has schema
- Migration files out of sync

**Solutions:**

1. **Check which migrations ran:**
   ```bash
   # List migration history
   ls prisma/migrations/
   ```

2. **Reset database (development only):**
   ```bash
   # WARNING: Deletes all data
   npx prisma db push --force-skip-engine-check --skip-generate
   ```

3. **For production:** Don't reset. Contact database team, restore from backup if needed.

---

## Build and Deployment Issues

### Build fails: "Error running prisma generate"

**Solutions:**

1. **Try locally first:**
   ```bash
   npm run db:generate
   # Should complete without errors
   ```

2. **If local fails, check:**
   - DATABASE_URL is valid
   - Prisma schema is valid: `npx prisma validate`
   - Node modules are intact: `npm install`

3. **For deployment:**
   - Add DATABASE_URL to your hosting environment variables
   - Redeploy

---

### Build succeeds but runtime fails: "Cannot query database"

**Causes:**
- DATABASE_URL not set at runtime
- Database unreachable from server
- Wrong credentials

**Solutions:**

1. **Check environment variables in production:**
   - Vercel: Settings → Environment Variables
   - Other platforms: Check your hosting dashboard

2. **Verify credentials match:**
   - Same username/password as database
   - Same host/port
   - Same database name

3. **Test from production:**
   ```bash
   # Add temporary debug endpoint
   app/api/test/route.ts:
   
   import { prisma } from '@/lib/db';
   
   export async function GET() {
     try {
       const count = await prisma.user.count();
       return Response.json({ success: true, count });
     } catch (error) {
       return Response.json({ error: error.message }, { status: 500 });
     }
   }
   ```
   Visit: `https://yoursite.com/api/test`

---

## Performance Issues

### Queries are slow

**Check:**
1. Are indexes created?
   ```bash
   # In your database client
   SELECT * FROM pg_indexes WHERE schemaname = 'public';
   ```

2. Run `npm run db:push` if missing indexes

3. Use Prisma Studio to see data:
   ```bash
   npx prisma studio
   # Opens UI at localhost:5555
   ```

---

### Too many database connections

**Causes:**
- Connection pool exhausted
- Connections not closed properly
- Too many concurrent requests

**Solutions:**

1. **For serverless (Vercel):** Use `pgbouncer=true` in DATABASE_URL
   ```
   postgresql://...?pgbouncer=true
   ```

2. **Restart connections:**
   ```bash
   # Restart your server
   npm run dev
   ```

3. **Check active connections:**
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

---

## Debugging Techniques

### Enable Prisma logging

**Add to .env.local:**
```
DATABASE_LOG=debug
```

**Then in code:**
```typescript
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### Use Prisma Studio

Interactive database explorer:

```bash
npx prisma studio
# Opens at http://localhost:5555
```

### Check database directly

```bash
# Connect to your database
psql $DATABASE_URL

# List all tables
\dt

# Check a specific table
SELECT * FROM "User";

# Count rows
SELECT COUNT(*) FROM "Application";

# Exit
\q
```

### View Prisma config

```bash
npx prisma validate --print
# Shows your Prisma schema as parsed
```

---

## Prevention Tips

### 1. Always commit schema changes
```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "Schema changes"
```

### 2. Test migrations locally first
```bash
npm run db:migrate
# If it works locally, it'll work in production
```

### 3. Keep environment variables safe
- Never commit `.env.local`
- Use `.env.example` as template
- Each environment (dev, prod) has separate variables

### 4. Validate before pushing
```bash
npx prisma validate
npm run build  # Test the build locally
```

### 5. Have a backup plan
- Take database backup before migrations
- Keep previous database URL for rollback
- Document your connection strings (securely)

---

## Where to Get Help

### Official Resources
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma GitHub Issues](https://github.com/prisma/prisma/issues)
- [Prisma Forum](https://github.com/prisma/prisma/discussions)

### For Database-Specific Help
- **Neon:** [Neon Documentation](https://neon.tech/docs)
- **PostgreSQL:** [PostgreSQL Docs](https://www.postgresql.org/docs/)
- **Other:** Check your database provider's documentation

### For Deployment Help
- **Vercel:** [Vercel Documentation](https://vercel.com/docs)
- **Others:** Check your hosting provider's docs

---

## Quick Fix Checklist

When something breaks, try these in order:

- [ ] Restart dev server (`Ctrl+C`, then `npm run dev`)
- [ ] Check DATABASE_URL is set: `echo $DATABASE_URL`
- [ ] Check .env.local exists: `ls .env.local`
- [ ] Regenerate: `npm run db:generate`
- [ ] Validate schema: `npx prisma validate`
- [ ] Reinstall: `rm -rf node_modules && npm install`
- [ ] Test build: `npm run build`
- [ ] Check database connection: `psql $DATABASE_URL`
- [ ] Check hosting env vars (if in production)
- [ ] Redeploy (if in production)

Most issues are fixed by steps 1-3. If not, work through the rest.
