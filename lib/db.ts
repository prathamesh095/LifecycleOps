import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * 
 * Why pooling is required on Vercel:
 * Vercel functions are ephemeral and scale horizontally. Each function instance
 * creates its own database connection. Without a connection pooler (like Neon's),
 * you can quickly exhaust the database's maximum connection limit.
 * 
 * Neon's pooling URL (usually on port 6543) manages these connections efficiently
 * for serverless environments.
 */

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
