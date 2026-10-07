// One-off: fills Product.packPhotos (the shrink-wrap/case shots the shop's
// picker carousel shows after the bottle photo) on the live single-bottle
// rows. Touches only packPhotos, unlike re-running prisma/seed.js, which
// would also reset prices, names and isActive on production rows.
// Same mapping as prisma/seed.js. Safe to re-run.
// Run once: node scripts/set-pack-photos.js
require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SPK = "/Assets/Products/Sparkling";
const STL = "/Assets/Products/Still";

const PACK_PHOTOS = {
  "SUL-SPK-LEM-200": [{ count: 6, url: `${SPK}/Small packs/limon.png` }, { count: 24, url: `${SPK}/Big packs/24\`lü Limon.png` }],
  "SUL-SPK-APP-200": [{ count: 6, url: `${SPK}/Small packs/elma.png` }, { count: 24, url: `${SPK}/Big packs/24\`lü Elma_2.png` }],
  "SUL-SPK-MAN-200": [{ count: 6, url: `${SPK}/Small packs/mandalina.png` }, { count: 24, url: `${SPK}/Big packs/24\`lü Mandalina.png` }],
  "SUL-SPK-SADE-200": [{ count: 24, url: `${SPK}/Big packs/24\`lü Sade.png` }],
  "SUL-SPK-GAZ-200": [{ count: 6, url: `${SPK}/Small packs/gazoz .png` }, { count: 24, url: `${SPK}/Big packs/24\`lü Gazoz.png` }],
  "SUL-SPK-MAP-200": [{ count: 6, url: `${SPK}/Small packs/Mango Ananas.png` }, { count: 24, url: `${SPK}/Big packs/Mango Ananas 24 lü.png` }],
  "SUL-SPK-CEX-200": [{ count: 24, url: `${SPK}/Big packs/24\`lü C-extra.png` }],
  "SUL-SPK-MOJ-200": [{ count: 6, url: `${SPK}/Small packs/Nane limon .png` }, { count: 24, url: `${SPK}/Big packs/24_lü Nane limon .png` }],
  "SUL-SPK-BMC-200": [{ count: 6, url: `${SPK}/Small packs/karadut.png` }, { count: 24, url: `${SPK}/Big packs/24\`lü Karadut.png` }],
  "SUL-SPK-BER-200": [{ count: 6, url: `${SPK}/Small packs/Berry Hibiscus - Shrink Mockup .png` }],
  "SUL-SPK-WMS-200": [{ count: 6, url: `${SPK}/Small packs/karpuz çilek .png` }, { count: 24, url: `${SPK}/Big packs/24\`lü Karpuz Çilek.png` }],
  "SUL-STL-250": [{ count: 12, url: `${STL}/0.25/0,25 Litre.png` }],
  "SUL-STL-500": [{ count: 12, url: `${STL}/0.5/0,5 Litre.png` }],
  "SUL-STL-1500": [{ count: 6, url: `${STL}/1.5/1,5 Litre.png` }],
  "SUL-STL-PRIME-400": [{ count: 12, url: `${STL}/Prime 0.4/12_pack.png` }],
  "SUL-STL-PRIME-800": [{ count: 12, url: `${STL}/Prime 0.8/12_pack_shrink.png` }],
};

async function main() {
  for (const [sku, packPhotos] of Object.entries(PACK_PHOTOS)) {
    const result = await prisma.product.updateMany({ where: { sku }, data: { packPhotos } });
    console.log(`${sku}: ${result.count ? `${packPhotos.length} pack photo(s)` : "no such product, skipped"}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
