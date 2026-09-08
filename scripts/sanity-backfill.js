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

// Mirrors sanityImageUrl() in src/lib/sanity-sync.ts — duplicated because
// this is a plain CommonJS script (see the file-level ponytail note),
// can't import that TS module without a build step.
function sanityImageUrl(image) {
  const ref = image && image.asset && image.asset._ref;
  if (!ref || !process.env.SANITY_PROJECT_ID) return undefined;
  const match = /^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/.exec(ref);
  if (!match) return undefined;
  const [, id, dims, format] = match;
  const dataset = process.env.SANITY_DATASET || "production";
  return `https://cdn.sanity.io/images/${process.env.SANITY_PROJECT_ID}/${dataset}/${id}-${dims}.${format}`;
}

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
      imageUrl: sanityImageUrl(doc.image),
    };
    await prisma.productCopy.upsert({
      where: { sanityId },
      create: { sanityId, ...fields },
      update: fields,
    });
  }
  console.log(`Synced ${docs.length} product copy doc(s).`);
}

const SITE_CONTENT_KEY_BY_TYPE = {
  homeContent: "home",
  aboutContent: "about",
  wholesaleContent: "wholesale",
  stockistsContent: "stockists",
  contactContent: "contact",
  productsContent: "products",
};

async function backfillSiteContent(type, key) {
  const doc = await sanity.fetch(`*[_type == "${type}" && !(_id in path("drafts.**"))][0]`);
  if (!doc) {
    console.log(`No ${type} document published yet.`);
    return;
  }
  const fields = Object.fromEntries(
    Object.entries(doc).filter(([k]) => !SANITY_META_KEYS.includes(k))
  );
  await prisma.siteContent.upsert({
    where: { key },
    create: { key, data: fields },
    update: { data: fields },
  });
  console.log(`Synced ${type}.`);
}

async function main() {
  await backfillStockists();
  await backfillProductCopy();
  for (const [type, key] of Object.entries(SITE_CONTENT_KEY_BY_TYPE)) {
    await backfillSiteContent(type, key);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
