// ponytail: plain CommonJS seed script — no ts-node/tsx dependency needed.
// Run with: node prisma/seed.js
require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = await Promise.all(
    [
      // Still line — matches the design canvas catalog exactly (id, price, case size).
      { sku: "SUL-STL-250", name: "Sultan Spring Water", type: "STILL", flavor: null, sizeMl: 250, retailPrice: "15.00", wholesalePrice: "10.50", stockQuantity: 600, lowStockThreshold: 120, imageUrl: "/uploads/bottle-13.png" },
      { sku: "SUL-STL-500", name: "Sultan Spring Water", type: "STILL", flavor: null, sizeMl: 500, retailPrice: "30.00", wholesalePrice: "21.00", stockQuantity: 500, lowStockThreshold: 100, imageUrl: "/uploads/bottle-06.png" },
      { sku: "SUL-STL-1500", name: "Sultan Spring Water", type: "STILL", flavor: null, sizeMl: 1500, retailPrice: "45.00", wholesalePrice: "31.50", stockQuantity: 120, lowStockThreshold: 50, imageUrl: "/uploads/bottle-04.png" },
      { sku: "SUL-STL-PRIME-400", name: "Sultan Prime", type: "STILL", flavor: null, sizeMl: 400, retailPrice: "40.00", wholesalePrice: "28.00", stockQuantity: 200, lowStockThreshold: 40, imageUrl: "/uploads/bottle-05.png" },
      { sku: "SUL-STL-PRIME-800", name: "Sultan Prime", type: "STILL", flavor: null, sizeMl: 800, retailPrice: "60.00", wholesalePrice: "42.00", stockQuantity: 90, lowStockThreshold: 30, imageUrl: "/uploads/bottle-07.png" },

      // Sparkling line — all eleven flavours from the canvas. Kept at the
      // real local bottle size (330ml, per CLAUDE.md) rather than the
      // canvas's 0.20L, which is the Turkey/global catalogue format Sultan
      // doesn't actually sell in Mauritius.
      { sku: "SUL-SPK-LEM-330", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Lemon", sizeMl: 330, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 180, lowStockThreshold: 40, imageUrl: "/uploads/c-extra.png" },
      { sku: "SUL-SPK-APP-330", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Apple", sizeMl: 330, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 180, lowStockThreshold: 40, imageUrl: "/uploads/apple.png" },
      { sku: "SUL-SPK-MAN-330", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Mandarin", sizeMl: 330, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 180, lowStockThreshold: 40, imageUrl: "/uploads/mandarine.png" },
      { sku: "SUL-SPK-STR-330", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Strawberry", sizeMl: 330, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 180, lowStockThreshold: 40, imageUrl: "/uploads/strawberry.png" },
      { sku: "SUL-SPK-GAZ-330", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Gazoz", sizeMl: 330, retailPrice: "42.00", wholesalePrice: "30.00", stockQuantity: 260, lowStockThreshold: 40, imageUrl: "/uploads/sultan-gazoz.png" },
      { sku: "SUL-SPK-MAP-330", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Mango & Pineapple", sizeMl: 330, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 180, lowStockThreshold: 40, imageUrl: "/uploads/exotic.png" },
      { sku: "SUL-SPK-POM-330", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Pomegranate", sizeMl: 330, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 18, lowStockThreshold: 40, imageUrl: "/uploads/pomegranate.jpg" },
      { sku: "SUL-SPK-MOJ-330", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Mojito", sizeMl: 330, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 150, lowStockThreshold: 40, imageUrl: "/uploads/mojito.png" },
      { sku: "SUL-SPK-BMC-330", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Black Mulberry & Blackcurrant", sizeMl: 330, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 96, lowStockThreshold: 40, imageUrl: "/uploads/black-mulberry-currant.png" },
      { sku: "SUL-SPK-BER-330", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Berry & Hibiscus", sizeMl: 330, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 150, lowStockThreshold: 40, imageUrl: "/uploads/ig-13.jpg" },
      { sku: "SUL-SPK-WMS-330", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Watermelon Strawberry", sizeMl: 330, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 240, lowStockThreshold: 40, imageUrl: "/uploads/watermelon-strawberry.jpg" },
    ].map((p) => prisma.product.upsert({ where: { sku: p.sku }, update: { imageUrl: p.imageUrl, sizeMl: p.sizeMl, retailPrice: p.retailPrice, wholesalePrice: p.wholesalePrice, name: p.name }, create: p }))
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
