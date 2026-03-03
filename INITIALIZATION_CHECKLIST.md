# Next.js + Prisma Initialization Checklist

Use this checklist when setting up the project locally or deploying to production.

## Local Development Setup

### Phase 1: Repository and Dependencies (5-10 minutes)

- [ ] Clone the repository
  ```bash
  git clone <repository-url>
  cd project
  ```

- [ ] Install Node.js (v18 or higher)
  ```bash
  node --version  # Should be v18+
  ```

- [ ] Install dependencies
  ```bash
  npm install
  ```
  **What happens automatically:**
  - npm runs `postinstall` script
  - Prisma client code is generated
  - All packages are installed

- [ ] Verify Prisma was generated
  ```bash
  ls -la node_modules/.prisma/client/
  # Should see index.d.ts and other files
  ```

### Phase 2: Environment Configuration (5 minutes)

- [ ] Copy environment template
  ```bash
  cp .env.example .env.local
  ```

- [ ] Open `.env.local` in your editor and fill in:
  - [ ] `DATABASE_URL` - Your database connection string (with pooling if needed)
  - [ ] `DIRECT_URL` - Direct database connection (for migrations)
  - [ ] `GEMINI_API_KEY` - Your Gemini API key (if using AI features)
  - [ ] `APP_URL` - Set to `http://localhost:3000` for local development

- [ ] Verify environment variables are loaded
  ```bash
  cat .env.local | head -5
  ```

### Phase 3: Database Setup (5-15 minutes)

- [ ] Create a database in your database provider (e.g., Neon)

- [ ] Test database connection
  ```bash
  npm run db:generate
  # Should complete without errors
  ```

- [ ] Push schema to database
  ```bash
  npm run db:push
  ```
  **This will:**
  - Create all tables defined in `prisma/schema.prisma`
  - Create indexes for performance
  - Set up relationships between tables

- [ ] Verify tables were created
  ```bash
  # Using Neon web interface or SQL command
  # Tables should include: User, Application, Activity, Contact, Reminder
  ```

### Phase 4: Start Development (2 minutes)

- [ ] Start the development server
  ```bash
  npm run dev
  ```
  **The server should start at:**
  - `http://localhost:3000` (application)
  - `http://localhost:3000/api/health` (if health check exists)

- [ ] Verify no errors in terminal
  - No "Prisma" errors
  - No "DATABASE_URL" errors
  - Server showing "ready - started server on"

- [ ] Open browser and test
  - [ ] Navigate to `http://localhost:3000`
  - [ ] Check that page loads
  - [ ] Check browser console for errors

### Phase 5: Test Database Connection (5 minutes)

- [ ] Test authentication endpoints
  ```bash
  # Register test user
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Test123!@"}'
  ```

- [ ] Check if user was created in database
  - [ ] Use Neon web interface
  - [ ] Or query: `SELECT * FROM "User";`

- [ ] Test API endpoint with authentication
  ```bash
  # Login and get session cookie
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Test123!@"}'
  ```

**Development is now ready!**

---

## Production Deployment Setup

### Phase 1: Pre-Deployment (5-10 minutes)

- [ ] Test build locally
  ```bash
  npm run build
  ```
  **This will:**
  - Run `prisma generate` automatically
  - Build the Next.js app
  - Should complete without errors

- [ ] Fix any build errors before deploying

- [ ] Commit all changes to git
  ```bash
  git add -A
  git commit -m "Ready for deployment"
  git push origin main
  ```

### Phase 2: Vercel/Hosting Setup (10-15 minutes)

- [ ] Create project on hosting platform (e.g., Vercel)

- [ ] Connect Git repository

- [ ] Set environment variables in hosting dashboard:
  - [ ] `DATABASE_URL` - Production database connection
  - [ ] `DIRECT_URL` - Direct database connection for migrations
  - [ ] `GEMINI_API_KEY` - Production API key
  - [ ] `APP_URL` - Your production domain

- [ ] Verify environment variables are set
  ```bash
  # In Vercel dashboard: Settings > Environment Variables
  ```

### Phase 3: Database Setup (5 minutes)

- [ ] Create production database
  - On Neon: Create new project/database
  - Copy connection strings to environment variables

- [ ] Verify connection strings
  - `DATABASE_URL` should be pooled connection
  - `DIRECT_URL` should be direct connection

### Phase 4: Deploy Application (5 minutes)

- [ ] Trigger deployment
  - Push to main branch, or
  - Click "Deploy" in hosting dashboard

- [ ] Monitor deployment logs
  - Should see: `prisma generate` running
  - Should see: `next build` running
  - Should see: Build completion

- [ ] Verify deployment succeeded
  - Check "Production" URL works
  - Check console for errors

### Phase 5: Post-Deployment Verification (5-10 minutes)

- [ ] Test production endpoints
  ```bash
  curl https://yourdomain.com/api/health
  ```

- [ ] Test authentication flow
  - Register new user
  - Check user appears in database
  - Login with credentials

- [ ] Monitor error tracking (if configured)
  - Check for any Prisma errors
  - Check for database connection errors

- [ ] Set up automated backups
  - If using Neon: Enable backups in dashboard
  - Document backup retention policy

**Deployment is now complete!**

---

## Troubleshooting Checklist

### If You See "Prisma client did not initialize"

- [ ] Run `npm run db:generate`
- [ ] Check that `node_modules/.prisma/client/index.d.ts` exists
- [ ] Reinstall node_modules: `rm -rf node_modules && npm install`
- [ ] Check `.env.local` has valid `DATABASE_URL`

### If Build Fails

- [ ] Check `DATABASE_URL` is set and valid
- [ ] Run `npm run db:push` locally first
- [ ] Check Prisma schema syntax: `npx prisma validate`
- [ ] Check build logs for specific errors

### If Database Connection Fails at Runtime

- [ ] Verify `DATABASE_URL` environment variable is set
- [ ] Test connection: `npx prisma db execute --stdin`
- [ ] Check firewall/network access to database
- [ ] Check database credentials are correct
- [ ] For Neon: Ensure IP is whitelisted

### If Schema Changes Don't Apply

- [ ] After updating `prisma/schema.prisma`:
  ```bash
  npm run db:generate
  npm run db:push
  ```
- [ ] For migrations (production):
  ```bash
  npm run db:migrate
  ```

### If Environment Variables Aren't Loaded

- [ ] Check file is named `.env.local` (not `.env`)
- [ ] Make sure file is in project root (same level as `package.json`)
- [ ] Restart dev server after creating/modifying `.env.local`
- [ ] Verify no syntax errors in file

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Generate Prisma client | `npm run db:generate` |
| Push schema to DB | `npm run db:push` |
| Create migration | `npm run db:migrate` |
| Start dev server | `npm run dev` |
| Build for production | `npm run build` |
| Start production server | `npm start` |
| Validate schema | `npx prisma validate` |
| Open Prisma Studio | `npx prisma studio` |
| Reset database (dev only) | `npx prisma db push --skip-generate --force-skip-engine-check` |

---

## Important Notes

### Do NOT Commit These Files

Add to `.gitignore` if not already there:
- `.env.local` (never commit credentials)
- `.env.production.local`
- `node_modules/`
- `.next/`

### Always Commit These Files

- `prisma/schema.prisma` (your database schema)
- `package.json` and `package-lock.json` (dependencies)
- `.env.example` (template, no secrets)

### For Each Developer

1. Each developer needs their own `.env.local`
2. Each can have their own local database
3. Use `.env.example` as a template
4. Never share `.env.local` files

### For Deployments

1. Environment variables must be set in hosting platform
2. Database connection strings are different per environment
3. Always use `DIRECT_URL` for migrations
4. Use connection pooling for regular queries

---

## Success Indicators

You know everything is working when:

✅ `npm install` completes without Prisma errors  
✅ `npm run dev` starts without database errors  
✅ API endpoints respond without "Prisma" errors  
✅ Database queries return data  
✅ Authentication works (users can register/login)  
✅ Build completes: `npm run build` succeeds  

If any of these fail, refer to the Troubleshooting section above.
