// ponytail: plain CommonJS seed script — no ts-node/tsx dependency needed.
// Run with: node prisma/seed.js
require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ponytail: pack pricing is computed off the single-unit price rather than
// hand-typed, so a flavor's 6-pack/24-case price can't drift out of sync
// with its unit price by a typo. 7% off for a 6-pack, 12% off for a
// 24-case — a round, defensible multi-buy discount, not a real quoted rate.
function packPrice(unitPrice, count, discount) {
  const raw = unitPrice * count * (1 - discount);
  return (Math.round(raw / 5) * 5).toFixed(2);
}

const SPARKLING_ASSET_DIR = "/Assets/Products/Sparkling";

// One row per real flavor. sixPack/bigPack are the shrink-wrap/case photo
// filenames where the customer's upload has one (../reference/Customer
// upload/Carbonated/{Small,Big} packs) — several flavors are missing one or
// the other, so those SKUs simply aren't created below.
const SPARKLING_FLAVORS = [
  { code: "LEM", flavor: "Lemon", retail: 45, single: "Bottle/Normal/Limon-sultan su.png", sixPack: "Small packs/limon.png", bigPack: "Big packs/24`lü Limon.png" },
  { code: "APP", flavor: "Apple", retail: 45, single: "Bottle/Normal/Elma-sultan su.png", bigPack: "Big packs/24`lü Elma_2.png" },
  { code: "MAN", flavor: "Mandarin", retail: 45, single: "Bottle/Normal/Mandalina-sultan su.png", sixPack: "Small packs/mandalina.png", bigPack: "Big packs/24`lü Mandalina.png" },
  { code: "SADE", flavor: "Sade", retail: 42, single: "Bottle/Normal/Sade_Teneke-Kapak-sultan su.png", bigPack: "Big packs/24`lü Sade.png" },
  { code: "GAZ", flavor: "Gazoz", retail: 42, single: "Bottle/Normal/Gazoz-sultan su 2 TR.png", sixPack: "Small packs/gazoz .png", bigPack: "Big packs/24`lü Gazoz.png" },
  { code: "MAP", flavor: "Mango & Pineapple", retail: 45, single: "Bottle/Normal/Mango-Ananas-sultan - TR .png", sixPack: "Small packs/Mango Ananas.png", bigPack: "Big packs/Mango Ananas 24 lü.png" },
  { code: "CEX", flavor: "C-Extra", retail: 48, single: "Bottle/Normal/C-extra-sultan su.png", bigPack: "Big packs/24`lü C-extra.png" },
  { code: "MOJ", flavor: "Mojito", retail: 45, single: "Bottle/Normal/Nane limon - 200ml mockup tr.png", sixPack: "Small packs/Nane limon .png", bigPack: "Big packs/24_lü Nane limon .png" },
  { code: "BMC", flavor: "Black Mulberry & Blackcurrant", retail: 45, single: "Bottle/Normal/Karadut-Frenk Üzümü-sultan su.png", sixPack: "Small packs/karadut.png", bigPack: "Big packs/24`lü Karadut.png" },
  // No single-bottle photo exists for this flavor, only the 6-pack shot — reused for both.
  { code: "BER", flavor: "Berry & Hibiscus", retail: 45, single: "Small packs/Berry Hibiscus - Shrink Mockup .png", sixPack: "Small packs/Berry Hibiscus - Shrink Mockup .png" },
  { code: "WMS", flavor: "Watermelon Strawberry", retail: 45, single: "Bottle/Normal/Karpuz-Çilek-sultan su.png", sixPack: "Small packs/karpuz çilek .png", bigPack: "Big packs/24`lü Karpuz Çilek.png" },
];

const sparklingProducts = SPARKLING_FLAVORS.flatMap((f) => {
  const wholesale = (r) => (r * 0.71).toFixed(2);
  const rows = [
    {
      sku: `SUL-SPK-${f.code}-200`,
      name: "Sultan Sparkling",
      type: "SPARKLING",
      flavor: f.flavor,
      sizeMl: 200,
      packCount: 1,
      retailPrice: f.retail.toFixed(2),
      wholesalePrice: wholesale(f.retail),
      stockQuantity: 180,
      lowStockThreshold: 40,
      imageUrl: `${SPARKLING_ASSET_DIR}/${f.single}`,
    },
  ];
  if (f.sixPack) {
    const price = packPrice(f.retail, 6, 0.07);
    rows.push({
      sku: `SUL-SPK-${f.code}-6PK`,
      name: "Sultan Sparkling 6-Pack",
      type: "SPARKLING",
      flavor: f.flavor,
      sizeMl: 200,
      packCount: 6,
      retailPrice: price,
      wholesalePrice: wholesale(parseFloat(price)),
      stockQuantity: 60,
      lowStockThreshold: 15,
      imageUrl: `${SPARKLING_ASSET_DIR}/${f.sixPack}`,
    });
  }
  if (f.bigPack) {
    const price = packPrice(f.retail, 24, 0.12);
    rows.push({
      sku: `SUL-SPK-${f.code}-24PK`,
      name: "Sultan Sparkling Case of 24",
      type: "SPARKLING",
      flavor: f.flavor,
      sizeMl: 200,
      packCount: 24,
      retailPrice: price,
      wholesalePrice: wholesale(parseFloat(price)),
      stockQuantity: 20,
      lowStockThreshold: 5,
      imageUrl: `${SPARKLING_ASSET_DIR}/${f.bigPack}`,
    });
  }
  return rows;
});

async function main() {
  const products = await Promise.all(
    [
      // Still line — real bottle photography from the customer's official
      // upload (../reference/Customer upload/water). 400/800ml (Prime) have
      // no clean single-bottle shot in that set, only the 12-pack shrink
      // photo, so that's what's used for those two.
      { sku: "SUL-STL-250", name: "Sultan Spring Water", type: "STILL", flavor: null, sizeMl: 250, packCount: 1, retailPrice: "15.00", wholesalePrice: "10.50", stockQuantity: 600, lowStockThreshold: 120, imageUrl: "/Assets/Products/Still/0.25/25lik-yeni-şişe-etiket.png" },
      { sku: "SUL-STL-500", name: "Sultan Spring Water", type: "STILL", flavor: null, sizeMl: 500, packCount: 1, retailPrice: "30.00", wholesalePrice: "21.00", stockQuantity: 500, lowStockThreshold: 100, imageUrl: "/Assets/Products/Still/0.5/0.5.png" },
      { sku: "SUL-STL-1500", name: "Sultan Spring Water", type: "STILL", flavor: null, sizeMl: 1500, packCount: 1, retailPrice: "45.00", wholesalePrice: "31.50", stockQuantity: 120, lowStockThreshold: 50, imageUrl: "/Assets/Products/Still/1.5/1,5.png" },
      { sku: "SUL-STL-PRIME-400", name: "Sultan Prime", type: "STILL", flavor: null, sizeMl: 400, packCount: 1, retailPrice: "40.00", wholesalePrice: "28.00", stockQuantity: 200, lowStockThreshold: 40, imageUrl: "/Assets/Products/Still/0.4/0,40l -  1250x1250.png" },
      { sku: "SUL-STL-PRIME-800", name: "Sultan Prime", type: "STILL", flavor: null, sizeMl: 800, packCount: 1, retailPrice: "60.00", wholesalePrice: "42.00", stockQuantity: 90, lowStockThreshold: 30, imageUrl: "/Assets/Products/Still/0.8/0,80l -  1250x1250 shirink.png" },

      // Sparkling line — all eleven real flavours, confirmed against the
      // customer's official bottle/pack photography (labels read 200ml,
      // packs read "6x200 ml" and 24-count cases — not 330ml as previously
      // assumed here; corrected). "Strawberry" and "Pomegranate" were
      // dropped: no such Sultan flavors exist in the reference photos.
      // "Sade" (plain, unflavored) and "C-Extra" (lemon + vitamin C) are
      // real flavors that were missing from this lineup; added in their
      // place. 6-pack and 24-case SKUs (SPARKLING_FLAVORS above) are
      // separate purchasable products, not just display images on the
      // single-bottle SKU.
      ...sparklingProducts,
    ].map((p) => prisma.product.upsert({ where: { sku: p.sku }, update: { imageUrl: p.imageUrl, sizeMl: p.sizeMl, packCount: p.packCount, retailPrice: p.retailPrice, wholesalePrice: p.wholesalePrice, name: p.name }, create: p }))
  );

  const individual = await prisma.customer.upsert({
    where: { email: "marie@example.mu" },
    update: {},
    create: {
      type: "INDIVIDUAL",
      name: "Marie Perrine",
      email: "marie@example.mu",
      phone: "+230 5788 1234",
      deliveryAddress: "12 Royal Road, Curepipe",
      deliveryZone: "Plaines Wilhems",
    },
  });

  const business = await prisma.customer.upsert({
    where: { email: "orders@lagoonbistro.mu" },
    update: {},
    create: {
      type: "BUSINESS",
      name: "Jean Ah-Kim",
      email: "orders@lagoonbistro.mu",
      companyName: "Lagoon Bistro Ltd",
      vatNumber: "VAT27391045",
      creditTermsDays: 30,
      phone: "+230 5911 4477",
      deliveryAddress: "Coastal Road, Grand Baie",
      deliveryZone: "Rivière du Rempart",
    },
  });

  const [watermelon, , blackMulberry, still500] = products;

  const order1 = await prisma.order.create({
    data: {
      customerId: individual.id,
      channel: "B2C",
      status: "PENDING",
      deliveryAddress: individual.deliveryAddress,
      deliveryZone: individual.deliveryZone,
      subtotal: "180.00",
      total: "180.00",
      items: {
        create: [
          { productId: watermelon.id, quantity: 4, unitPriceAtOrder: "45.00", lineTotal: "180.00" },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      customerId: business.id,
      channel: "B2B",
      status: "PAID",
      deliveryAddress: business.deliveryAddress,
      deliveryZone: business.deliveryZone,
      subtotal: "3200.00",
      total: "3200.00",
      items: {
        create: [
          { productId: blackMulberry.id, quantity: 60, unitPriceAtOrder: "32.00", lineTotal: "1920.00" },
          { productId: still500.id, quantity: 20, unitPriceAtOrder: "14.00", lineTotal: "280.00" },
        ],
      },
    },
  });

  await prisma.invoice.upsert({
    where: { orderId: order2.id },
    update: {},
    create: {
      orderId: order2.id,
      status: "ISSUED",
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amountPaid: "0",
      balanceDue: order2.total,
    },
  });

  await prisma.invoice.upsert({
    where: { orderId: order1.id },
    update: {},
    create: {
      orderId: order1.id,
      status: "DRAFT",
      amountPaid: "0",
      balanceDue: order1.total,
    },
  });

  await prisma.contactInquiry.createMany({
    data: [
      { type: "GENERAL", name: "Priya Naidoo", email: "priya@example.mu", message: "Do you deliver to Flic en Flac?", handled: false },
      { type: "WHOLESALE", name: "Jean Ah-Kim", email: "orders@lagoonbistro.mu", companyName: "Lagoon Bistro Ltd", estimatedVolume: "80 cases/month", message: "Interested in a standing weekly order.", handled: true },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
