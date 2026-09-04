// ponytail: one-off backfill for content authored in Sanity before the
// webhook existed (or after a webhook outage). Not run automatically —
// run by hand: node scripts/sanity-backfill.js
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@sanity/client");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2026-01-01",
  token: process.env.SANITY_API_KEY,
  useCdn: false,
});

const stripDraftPrefix = (id) => id.replace(/^drafts\./, "");
const SANITY_META_KEYS = ["_id", "_type", "_rev", "_createdAt", "_updatedAt"];

async function backfillStockists() {
  const docs = await sanity.fetch(`*[_type == "stockist" && !(_id in path("drafts.**"))]`);
  for (const doc of docs) {
    if (!doc.name) continue;
    const sanityId = stripDraftPrefix(doc._id);
    await prisma.stockist.upsert({
      where: { sanityId },
      create: {
        sanityId,
        name: doc.name,
        region: doc.region ?? "",
        town: doc.town ?? "",
        address: doc.address,
        phone: doc.phone,
        mapUrl: doc.mapUrl,
        isActive: doc.isActive ?? true,
      },
      update: {
        name: doc.name,
        region: doc.region ?? "",
        town: doc.town ?? "",
        address: doc.address,
        phone: doc.phone,
        mapUrl: doc.mapUrl,
        isActive: doc.isActive ?? true,
      },
    });
  }
  console.log(`Synced ${docs.length} stockist(s).`);
}

async function backfillProductCopy() {
  const docs = await sanity.fetch(`*[_type == "productCopy" && !(_id in path("drafts.**"))]`);
  for (const doc of docs) {
    if (!doc.sku) continue;
    const sanityId = stripDraftPrefix(doc._id);
    const fields = {
      sku: doc.sku,
      tasteNote: doc.tasteNote,
      tasteNoteFr: doc.tasteNoteFr,
      bestServedNote: doc.bestServedNote,
      bestServedNoteFr: doc.bestServedNoteFr,
      specNote: doc.specNote,
      specNoteFr: doc.specNoteFr,
    };
    await prisma.productCopy.upsert({
      where: { sanityId },
      create: { sanityId, ...fields },
      update: fields,
    });
  }
  console.log(`Synced ${docs.length} product copy doc(s).`);
}

async function backfillHomeContent() {
  const doc = await sanity.fetch(`*[_type == "homeContent" && !(_id in path("drafts.**"))][0]`);
  if (!doc) {
    console.log("No homeContent document published yet.");
    return;
  }
  const fields = Object.fromEntries(
    Object.entries(doc).filter(([key]) => !SANITY_META_KEYS.includes(key))
  );
  await prisma.siteContent.upsert({
    where: { key: "home" },
    create: { key: "home", data: fields },
    update: { data: fields },
  });
  console.log("Synced homeContent.");
}

async function main() {
  await backfillStockists();
  await backfillProductCopy();
  await backfillHomeContent();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
