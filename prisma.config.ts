import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js auto-loads .env.local for the app, but the Prisma CLI (this file)
// only reads .env by default — load .env.local explicitly so `prisma
// generate`/`migrate` see the same Neon connection strings.
loadEnv({ path: ".env.local" });

// Prisma 7: connection info lives here, not in schema.prisma. The CLI
// (migrate/studio) uses Neon's direct (non-pooled) connection; the app's
// PrismaClient uses the pooled DATABASE_URL via the adapter in src/lib/prisma.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
