# Deployment Checklist for LifecycleOps with Neon PostgreSQL

Complete this checklist before deploying to production.

## Pre-Deployment Setup

### Database Setup
- [ ] Neon project created at https://console.neon.tech
- [ ] Database URL (pooled connection) copied to `.env.local`
- [ ] Direct URL (direct connection) copied to `.env.local`
- [ ] Local database initialized with `npm run db:push`
- [ ] Prisma migrations tested locally
- [ ] Sample data created and verified in database
- [ ] Database backup strategy documented

### Dependencies
- [ ] All dependencies installed: `npm install`
- [ ] Prisma client generated: `npm run db:generate`
- [ ] TypeScript compilation succeeds: `npm run build`
- [ ] No lint errors: `npm run lint`

### Frontend Integration
- [ ] `AuthInitializer` component added to root layout ✓
- [ ] At least 2-3 key components updated to use API client
- [ ] Components tested with real data from API
- [ ] Loading states working properly
- [ ] Error handling implemented
- [ ] Toast notifications working
- [ ] No console errors in dev tools

### API Testing
- [ ] All CRUD endpoints tested locally:
  - [ ] `GET /api/applications` - Lists applications
  - [ ] `POST /api/applications` - Creates application
  - [ ] `GET /api/applications/[id]` - Gets specific application
  - [ ] `PATCH /api/applications/[id]` - Updates application
  - [ ] `DELETE /api/applications/[id]` - Deletes application
  - [ ] Same for activities, contacts, reminders
- [ ] Pagination works correctly
- [ ] Authorization check verified (401 without user ID)
- [ ] Input validation works (400 on invalid data)
- [ ] Error responses are meaningful

### Performance
- [ ] Cursor-based pagination implemented
- [ ] Database queries use appropriate indexes
- [ ] No N+1 query problems
- [ ] API response times under 200ms
- [ ] Frontend renders smoothly with paginated data
- [ ] No memory leaks in React components

## Vercel Deployment

### 1. Connect to GitHub
- [ ] Repository is connected to GitHub
- [ ] v0 changes are committed to a branch
- [ ] Branch is pushed to GitHub
- [ ] Create a Pull Request or prepare to merge to main

### 2. Vercel Project Setup
- [ ] Vercel project is created
- [ ] GitHub repository is connected to Vercel
- [ ] Project settings are correct:
  - [ ] Framework preset: Next.js
  - [ ] Root directory: ./
  - [ ] Build command: `npm run build`
  - [ ] Output directory: .next

### 3. Environment Variables in Vercel
In Vercel Dashboard → Settings → Environment Variables:

- [ ] Add `DATABASE_URL` (pooled connection from Neon)
- [ ] Add `DIRECT_URL` (direct connection from Neon)
- [ ] Add any other required env vars (Google API key, etc.)
- [ ] Verify variables are available to all environments (Preview, Production, Development)

### 4. Pre-Deployment Tests
- [ ] Run locally with production env vars:
  ```bash
  # Create .env.production.local with real Neon URLs
  npm run build
  npm run start
  ```
- [ ] Test CRUD operations with production database
- [ ] Verify migrations run on deployment
- [ ] Check build output for warnings

### 5. Deploy to Vercel
```bash
git push origin main  # or create PR
```

Vercel will automatically:
1. Build the application
2. Run migrations (if configured)
3. Deploy to production URL
4. Make environment variables available

### 6. Post-Deployment Verification
- [ ] Visit production URL
- [ ] Verify page loads without errors
- [ ] Check browser console for errors
- [ ] Test creating an application
- [ ] Test updating an application
- [ ] Test deleting an application
- [ ] Verify API calls in Network tab include x-user-id header
- [ ] Check Vercel logs for any errors:
  ```
  Vercel Dashboard → Deployments → Click deployment → Logs
  ```

## Production Checklist

### Monitoring
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Set up uptime monitoring (e.g., Uptime Robot)
- [ ] Set up performance monitoring (e.g., Vercel Analytics)
- [ ] Create alerts for:
  - [ ] High error rate (>5%)
  - [ ] High response time (>500ms average)
  - [ ] Database connection failures
  - [ ] Out of storage space

### Database Maintenance
- [ ] Configure backups in Neon dashboard
- [ ] Set up automated backups (daily recommended)
- [ ] Document backup retention policy
- [ ] Test restore procedure
- [ ] Monitor database size:
  - [ ] Alert at 80% of free tier (400 MB)
  - [ ] Plan for upgrade when approaching limit

### Security
- [ ] Environment variables are not logged
- [ ] API validates all inputs with Zod
- [ ] User ID header is properly validated
- [ ] Sensitive data is not exposed in API responses
- [ ] Database credentials are never in client code
- [ ] CORS headers are properly configured (if needed)
- [ ] Rate limiting is considered for future

### Documentation
- [ ] README updated with deployment instructions
- [ ] API documentation is up to date
- [ ] Database schema is documented
- [ ] Troubleshooting guide is available
- [ ] Contact information for support

## Rollback Plan

If production deployment has issues:

### Immediate Rollback
```bash
# In Vercel Dashboard:
# 1. Go to Deployments
# 2. Find the previous stable deployment
# 3. Click "..." → "Redeploy"
```

### Manual Rollback
```bash
# On main branch, revert the commit
git revert <commit-hash>
git push origin main
```

Vercel will automatically redeploy with the previous version.

### Database Issues
If database is corrupted:
1. Contact Neon support
2. Request database restore from backup
3. Verify data integrity before resuming operations

## Post-Deployment Maintenance

### Daily (First Week)
- [ ] Monitor error logs for exceptions
- [ ] Check database storage usage
- [ ] Verify API response times are stable
- [ ] Monitor user feedback for issues

### Weekly
- [ ] Review database query performance
- [ ] Check for unused indexes
- [ ] Monitor cost of Neon plan
- [ ] Update dependencies if security patches available

### Monthly
- [ ] Review and archive old data (if needed for storage)
- [ ] Verify backup integrity
- [ ] Update documentation with any learnings
- [ ] Plan for upcoming features

## Scaling Considerations

### When to Upgrade Neon Plan
- [ ] Database size approaches 500 MB
- [ ] Connection pool frequently exhausted (>90% utilization)
- [ ] Query performance degrading
- [ ] Need for read replicas

### Optimization Before Upgrade
- [ ] Archive closed applications to separate table
- [ ] Implement query caching
- [ ] Add database connection pooling
- [ ] Optimize slow queries identified in logs

## Sign-Off

| Role | Name | Date | Notes |
|------|------|------|-------|
| Developer | | | |
| QA | | | |
| Product | | | |
| Operations | | | |

---

## Quick Reference

### Emergency Contacts
- **Neon Support**: https://neon.tech/docs/introduction/support
- **Vercel Support**: https://vercel.com/help
- **Database Issues**: Check Neon Dashboard Status page

### Useful Commands
```bash
# Local testing
npm run dev              # Start dev server
npm run db:push         # Push schema changes
npx prisma studio      # Open database explorer

# Build & Deploy
npm run build           # Test production build
npm run start           # Run production build locally

# Debugging
npm run db:generate    # Regenerate Prisma client
git log --oneline      # View commit history for rollback
```

### Environment Variables Needed
```
DATABASE_URL=postgresql://...  # Neon pooled connection
DIRECT_URL=postgresql://...    # Neon direct connection
NEXT_PUBLIC_GOOGLE_API_KEY=... # If using Google API
```

### Key Files to Monitor
- `package.json` - Dependencies and scripts
- `prisma/schema.prisma` - Database schema
- `app/api/*/route.ts` - API endpoints
- `lib/api-client.ts` - Frontend API client
- `.env.local` - Local environment (NEVER commit)
- `NEON_SETUP.md` - Setup instructions
- `INTEGRATION_GUIDE.md` - Frontend integration guide

---

**Last Updated**: $(date)
**Next Review**: 30 days post-launch
