import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString?.trim()) {
    throw new Error(
      "DATABASE_URL is not set. Add it in Vercel: Project → Settings → Environment Variables."
    );
  }
  
  // Log connection string format (masked) for debugging
  if (process.env.NODE_ENV === "development" || process.env.EXPOSE_SERVER_ERRORS === "1") {
    const masked = connectionString
      .replace(/:\/\/[^:]+:[^@]+@/, "://***:***@")
      .replace(/@([^/]+)/, "@***");
    console.log("[prisma] DATABASE_URL format:", masked.substring(0, 80) + "...");
  }
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000, // Increased from 10s to 15s for serverless cold starts
    idle_in_transaction_session_timeout: 30000,
    max: 1, // Limit connections per serverless function instance
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache Prisma client globally to avoid creating multiple connections in serverless
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
