// One-off: deactivates every pack Product (packCount > 1 — 6-packs,
// 24-cases, the Prime 12-packs) rather than deleting them, so existing
// OrderItem/StockMovement/Invoice rows that reference them stay intact.
// Run once: node scripts/deactivate-pack-products.js
// See prisma/seed.js, which now seeds these rows as isActive: false too, so
// re-running the seed won't resurrect them.
require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.product.updateMany({
    where: { packCount: { gt: 1 }, isActive: true },
    data: { isActive: false },
  });
  console.log(`Deactivated ${result.count} pack product(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
