declare global {
  var prisma: any | undefined;
}

// Initialize Prisma client only when actually needed on the server
// Use dynamic require with error handling for build-time safety
let prisma: any = null;

try {
  // Only import if on server side and not in edge runtime
  if (typeof window === "undefined" && !process.env.EDGE_RUNTIME) {
    // Use dynamic require to avoid load-time errors
    const { PrismaClient } = require("@prisma/client");
    
    prisma = globalThis.prisma || new PrismaClient();

    if (process.env.NODE_ENV !== "production") {
      globalThis.prisma = prisma;
    }
  }
} catch (error) {
  // Create a helpful error proxy for when Prisma hasn't been generated
  prisma = new Proxy({}, {
    get: () => {
      throw new Error(
        "Prisma client not initialized. Run 'npm run db:generate' to generate the Prisma client."
      );
    },
  });
}

export { prisma };
