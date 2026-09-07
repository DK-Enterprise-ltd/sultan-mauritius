import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js auto-loads .env.local for the app, but the Prisma CLI (this file)
// only reads .env by default — load .env.local explicitly so `prisma
// generate`/`migrate` see the same Neon connection strings.
loadEnv({ path: ".env.local" });

// Prisma 7: connection info lives here, not in schema.prisma. The CLI
// (migrate/studio) uses Neon's direct (non-pooled) connection, kept current
// by `neon env pull` locally; the app's PrismaClient uses the pooled
// DATABASE_URL via the adapter in src/lib/prisma.ts.
//
// Fall back to DATABASE_URL when DATABASE_URL_UNPOOLED isn't set (e.g. on
// Vercel, which only runs `prisma generate` via postinstall and never a real
// migrate/studio against this datasource) — plain process.env, not the
// strict `env()` helper, so a missing var here degrades instead of failing
// the whole install/build.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  },
});
