import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Only initialize PrismaClient on the server side
// Edge runtime (middleware) cannot use Prisma
let prisma: PrismaClient | null = null;

if (typeof window === "undefined" && !process.env.EDGE_RUNTIME) {
  prisma = globalThis.prisma || new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = prisma;
  }
}

export { prisma };
