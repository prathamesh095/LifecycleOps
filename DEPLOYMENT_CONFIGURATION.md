# Deployment Configuration Guide

This guide explains how to properly configure Prisma for deployment on various hosting platforms.

## Understanding the Build Process

When you deploy to production, the hosting platform automatically:

1. **Installs Dependencies** (`npm install`)
   - Runs the `postinstall` hook
   - Executes: `prisma generate || true`
   - Generates Prisma client code

2. **Builds Application** (`npm run build`)
   - Runs: `prisma generate && next build`
   - Regenerates Prisma client (ensures it's fresh)
   - Compiles Next.js application

3. **Starts Server** (`npm start`)
   - Runs the production server
   - Prisma client is ready to use

## Vercel Deployment

### Automatic Setup

Vercel automatically handles Prisma setup. No special configuration needed!

### Manual Setup (if needed)

1. **Connect Repository**
   - Go to vercel.com
   - Click "Add New → Project"
   - Select your Git repository

2. **Set Environment Variables**
   - In project settings → Environment Variables
   - Add:
     - `DATABASE_URL` = Your pooled connection string
     - `DIRECT_URL` = Your direct connection string
     - Other API keys as needed

   ```
   Key: DATABASE_URL
   Value: postgresql://user:password@neon.tech/dbname?sslmode=require&pgbouncer=true

   Key: DIRECT_URL
   Value: postgresql://user:password@neon.tech/dbname?sslmode=require
   ```

3. **Deploy**
   - Push code to main branch
   - Vercel automatically:
     - Runs `npm install` (Prisma generates)
     - Runs `npm run build` (Prisma regenerates)
     - Starts production server

### Vercel + Neon Setup

If using Neon as your database:

1. Create Neon project at neon.tech
2. Get two connection strings:
   - **Pooled**: Use for application queries
   - **Direct**: Use for migrations
3. Add both to Vercel environment variables

## Other Hosting Platforms

### Docker / Self-Hosted

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (runs postinstall)
RUN npm ci

# Copy source code
COPY . .

# Build application (runs prisma generate)
RUN npm run build

# Start server
CMD ["npm", "start"]
```

Build and deploy:

```bash
docker build -t myapp .
docker run -e DATABASE_URL="..." -e DIRECT_URL="..." myapp
```

### Railway

1. Connect Git repository
2. Add environment variables:
   - `DATABASE_URL`
   - `DIRECT_URL`
3. Platform automatically runs your npm scripts
4. Deployment proceeds as normal

### Render / Heroku / Others

Most platforms follow this pattern:

1. **Install** → `npm install` (auto-runs postinstall)
2. **Build** → `npm run build` (runs prisma generate)
3. **Start** → `npm start`

Just set environment variables and deploy!

## Environment Variables Explained

### Database_URL

Used by your application for database queries.

**Format:**
```
postgresql://username:password@host:port/database?query_params
```

**Example (Neon with pooling):**
```
postgresql://neon_user:neon_password@ep-name.neon.tech/mydb?sslmode=require&pgbouncer=true
```

**Query parameters explained:**
- `sslmode=require` - Encrypt database connection
- `pgbouncer=true` - Use connection pooling (for serverless)

### DIRECT_URL

Used by Prisma migrations only.

**Must be:**
- A direct connection (no pooling)
- Only used during `prisma migrate` or `prisma db push`
- Can be the same as DATABASE_URL if not using pooling

**Example (Neon direct):**
```
postgresql://neon_user:neon_password@ep-name.neon.tech/mydb?sslmode=require
```

**Why both URLs?**
- `DATABASE_URL`: Can use connection pooling for many concurrent connections
- `DIRECT_URL`: Needs direct connection for schema operations

### Other Variables

- `GEMINI_API_KEY` - Google Gemini API key
- `APP_URL` - Your application's public URL
- `NODE_ENV` - Set to `production` in deployment

## Database Migration Strategy

### Development

Use immediate schema pushes:

```bash
# Make schema change in prisma/schema.prisma
npm run db:push
# Database updates immediately, Prisma regenerates
```

### Production

Use proper migrations:

```bash
# 1. Make schema change
# 2. Create migration
npm run db:migrate

# 3. Commit migration files
git add prisma/migrations/
git commit -m "Add new schema"

# 4. Deploy
# Hosting platform automatically runs migrations during build
```

## Handling Database Errors During Deployment

### "Unable to connect to database"

This typically happens when:
- `DATABASE_URL` or `DIRECT_URL` isn't set
- Database isn't accessible from deployment server
- Credentials are wrong

**Solution:**
1. Verify environment variables are set correctly
2. Check IP whitelisting (e.g., allow Vercel IPs)
3. Test connection locally first

### "Prisma client did not initialize"

This is automatically handled by our setup, but if you see it:

**In your hosting platform:**
1. Check build logs for `prisma generate` errors
2. Verify `DATABASE_URL` is set
3. Redeploy after fixing environment variables

## Monitoring and Debugging

### View Deployment Logs

**Vercel:**
- Go to project → Deployments → select deployment → Logs

**Other platforms:** Check your hosting dashboard

### Look for These in Logs

✅ **Good signs:**
```
Installing dependencies...
Running "postinstall" from package.json
Prisma client generated successfully
next build
Build completed successfully
```

❌ **Watch for:**
```
Error: Prisma client did not initialize
Unable to connect to database
@prisma/client is missing
```

### Rollback a Bad Deployment

If your deployment fails:

1. **Find the last working commit:**
   ```bash
   git log --oneline
   ```

2. **Push the previous version:**
   ```bash
   git revert <bad-commit-hash>
   git push
   ```
   Your hosting platform will auto-deploy the previous version

3. **Fix issues locally first:**
   - Don't deploy until it works with `npm run dev`
   - Test `npm run build` locally
   - Verify environment variables

## Post-Deployment Checklist

After deploying:

- [ ] Application loads at your domain
- [ ] No errors in browser console
- [ ] Authentication works (register/login)
- [ ] API endpoints respond
- [ ] Database queries work
- [ ] Check hosting platform logs for errors
- [ ] Monitor first 10 minutes for issues
- [ ] Have rollback plan ready

## Automating With GitHub Actions

Want to run tests before deployment?

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma
        run: npm run db:generate
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/actions/deploy-production@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

This ensures:
- Dependencies install correctly
- Prisma generates
- Build succeeds
- Only then deploy to production

## Troubleshooting Deployment

### Issue: Build fails with Prisma error

**Check:**
1. DATABASE_URL is set ✓
2. Prisma schema is valid: `npx prisma validate`
3. No syntax errors in schema

**Fix:**
1. Fix schema locally
2. Test with `npm run build`
3. Commit and push
4. Redeploy

### Issue: Application starts but database queries fail

**Check:**
1. Is DATABASE_URL correct in production?
2. Can production server reach database?
3. Are IP whitelist rules correct?

**Fix:**
1. Test connection from hosting server
2. Check hosting provider's firewall settings
3. Verify credentials match database setup

### Issue: Schema changes didn't apply in production

**Check:**
1. Did you commit `prisma/migrations/` folder?
2. Did deployment run database migrations?

**Fix:**
1. Create migration: `npm run db:migrate`
2. Commit migration files to git
3. Push and redeploy
4. Check logs show migration ran

## Best Practices

### 1. Test Deployments

Always test locally before deploying:

```bash
# Test the exact build that will run
npm run build
npm start
```

### 2. Keep Secrets Secure

- ✓ Use environment variables for secrets
- ✗ Never commit `.env.local` files
- ✗ Never put passwords in code
- ✗ Never share environment variable values

### 3. Version Your Database

Always commit schema changes:

```bash
git add prisma/schema.prisma
git add prisma/migrations/
git commit -m "Schema: add new feature"
```

### 4. Use Migrations in Production

Don't use `db push` in production:

```bash
# ✓ Production (safe, creates migration history)
npm run db:migrate

# ✗ Don't use in production
npm run db:push
```

### 5. Backup Before Migrations

Before major migrations:

```bash
# Backup your database through your provider's dashboard
# Then run migration
npm run db:migrate
```

## Summary

The deployment process is automatic:

1. **Install** → `npm install` (runs postinstall → `prisma generate`)
2. **Build** → `npm run build` (runs `prisma generate && next build`)
3. **Start** → `npm start` (Prisma client ready to use)

As long as you set `DATABASE_URL` and `DIRECT_URL` environment variables, everything else is handled automatically!
