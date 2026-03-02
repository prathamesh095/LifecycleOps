#!/usr/bin/env node

/**
 * Setup script to generate Prisma client
 * Run with: node scripts/setup-prisma.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('[v0] Starting Prisma setup...');

try {
  console.log('[v0] Generating Prisma client...');
  execSync('npx prisma generate', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  });

  console.log('[v0] Prisma client generated successfully!');
  console.log('[v0] Next steps:');
  console.log('[v0] 1. Set DATABASE_URL in your .env file');
  console.log('[v0] 2. Run: npm run db:push');
  console.log('[v0] 3. Start development: npm run dev');
} catch (error) {
  console.error('[v0] Error generating Prisma client:', error.message);
  process.exit(1);
}
