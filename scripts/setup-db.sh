#!/bin/bash

# Database setup script for LifecycleOps with Neon PostgreSQL
# This script initializes the database schema using Prisma

set -e

echo "🗄️  Setting up LifecycleOps database with Neon PostgreSQL..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo ""
  echo "To set up your database:"
  echo "1. Create a Neon project at https://console.neon.tech"
  echo "2. Copy your pooled connection string from the dashboard"
  echo "3. Add it to your .env.local file:"
  echo "   DATABASE_URL=\"your-pooled-connection-string\""
  echo "   DIRECT_URL=\"your-direct-connection-string\""
  echo ""
  exit 1
fi

# Check if DIRECT_URL is set
if [ -z "$DIRECT_URL" ]; then
  echo "❌ Error: DIRECT_URL environment variable is not set"
  echo ""
  echo "To set up your database:"
  echo "1. Get your direct connection string from Neon"
  echo "2. Add it to your .env.local file:"
  echo "   DIRECT_URL=\"your-direct-connection-string\""
  echo ""
  exit 1
fi

echo "✓ Environment variables found"
echo ""

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate
echo "✓ Prisma client generated"
echo ""

# Push schema to database
echo "🚀 Pushing schema to database..."
npx prisma db push
echo "✓ Database schema created"
echo ""

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your frontend components to use the new API client from lib/api-client.ts"
echo "2. Ensure each API request includes a valid user ID in the x-user-id header"
echo "3. Run 'npm run dev' to start the development server"
echo ""
