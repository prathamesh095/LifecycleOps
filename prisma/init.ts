import { execSync } from 'child_process';
import path from 'path';

console.log('Initializing Prisma client...');

try {
  const prismaDir = path.dirname(__filename);
  execSync('prisma generate', {
    cwd: path.join(prismaDir, '..'),
    stdio: 'inherit',
  });
  console.log('✓ Prisma client generated successfully');
} catch (error) {
  console.error('✗ Failed to generate Prisma client:', error);
  process.exit(1);
}
