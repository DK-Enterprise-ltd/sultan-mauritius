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
      // Still line — real bottle photography from the customer's official
      // upload (../reference/Customer upload/water). 400/800ml (Prime) have
      // no clean single-bottle shot in that set, only the 12-pack shrink
      // photo, so that's what's used for those two.
      { sku: "SUL-STL-250", name: "Sultan Spring Water", type: "STILL", flavor: null, sizeMl: 250, retailPrice: "15.00", wholesalePrice: "10.50", stockQuantity: 600, lowStockThreshold: 120, imageUrl: "/Assets/Products/Still/spring-water-250ml.png" },
      { sku: "SUL-STL-500", name: "Sultan Spring Water", type: "STILL", flavor: null, sizeMl: 500, retailPrice: "30.00", wholesalePrice: "21.00", stockQuantity: 500, lowStockThreshold: 100, imageUrl: "/Assets/Products/Still/spring-water-500ml.png" },
      { sku: "SUL-STL-1500", name: "Sultan Spring Water", type: "STILL", flavor: null, sizeMl: 1500, retailPrice: "45.00", wholesalePrice: "31.50", stockQuantity: 120, lowStockThreshold: 50, imageUrl: "/Assets/Products/Still/spring-water-1500ml.png" },
      { sku: "SUL-STL-PRIME-400", name: "Sultan Prime", type: "STILL", flavor: null, sizeMl: 400, retailPrice: "40.00", wholesalePrice: "28.00", stockQuantity: 200, lowStockThreshold: 40, imageUrl: "/Assets/Products/Still/prime-400ml.png" },
      { sku: "SUL-STL-PRIME-800", name: "Sultan Prime", type: "STILL", flavor: null, sizeMl: 800, retailPrice: "60.00", wholesalePrice: "42.00", stockQuantity: 90, lowStockThreshold: 30, imageUrl: "/Assets/Products/Still/prime-800ml.png" },

      // Sparkling line — all eleven real flavours, confirmed against the
      // customer's official bottle/pack photography (labels read 200ml,
      // packs read "6x200 ml" and 24-count cases — not 330ml as previously
      // assumed here; corrected). "Strawberry" and "Pomegranate" were
      // dropped: no such Sultan flavors exist in the reference photos.
      // "Sade" (plain, unflavored) and "C-Extra" (lemon + vitamin C) are
      // real flavors that were missing from this lineup; added in their place.
      { sku: "SUL-SPK-LEM-200", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Lemon", sizeMl: 200, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 180, lowStockThreshold: 40, imageUrl: "/Assets/Products/Sparkling/lemon.jpg" },
      { sku: "SUL-SPK-APP-200", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Apple", sizeMl: 200, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 180, lowStockThreshold: 40, imageUrl: "/Assets/Products/Sparkling/apple.jpg" },
      { sku: "SUL-SPK-MAN-200", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Mandarin", sizeMl: 200, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 180, lowStockThreshold: 40, imageUrl: "/Assets/Products/Sparkling/mandarine.jpg" },
      { sku: "SUL-SPK-SADE-200", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Sade", sizeMl: 200, retailPrice: "42.00", wholesalePrice: "30.00", stockQuantity: 260, lowStockThreshold: 40, imageUrl: "/Assets/Products/Sparkling/sade.jpg" },
      { sku: "SUL-SPK-GAZ-200", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Gazoz", sizeMl: 200, retailPrice: "42.00", wholesalePrice: "30.00", stockQuantity: 260, lowStockThreshold: 40, imageUrl: "/Assets/Products/Sparkling/gazoz.jpg" },
      { sku: "SUL-SPK-MAP-200", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Mango & Pineapple", sizeMl: 200, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 180, lowStockThreshold: 40, imageUrl: "/Assets/Products/Sparkling/mango-and-pineapple.jpg" },
      { sku: "SUL-SPK-CEX-200", name: "Sultan Sparkling", type: "SPARKLING", flavor: "C-Extra", sizeMl: 200, retailPrice: "48.00", wholesalePrice: "34.00", stockQuantity: 150, lowStockThreshold: 40, imageUrl: "/Assets/Products/Sparkling/c-extra.jpg" },
      { sku: "SUL-SPK-MOJ-200", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Mojito", sizeMl: 200, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 150, lowStockThreshold: 40, imageUrl: "/Assets/Products/Sparkling/mojito.png" },
      { sku: "SUL-SPK-BMC-200", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Black Mulberry & Blackcurrant", sizeMl: 200, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 96, lowStockThreshold: 40, imageUrl: "/Assets/Products/Sparkling/black-mulberry-currant.jpg" },
      { sku: "SUL-SPK-BER-200", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Berry & Hibiscus", sizeMl: 200, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 150, lowStockThreshold: 40, imageUrl: "/Assets/Products/Sparkling/berry-hibiscus.png" },
      { sku: "SUL-SPK-WMS-200", name: "Sultan Sparkling", type: "SPARKLING", flavor: "Watermelon Strawberry", sizeMl: 200, retailPrice: "45.00", wholesalePrice: "32.00", stockQuantity: 240, lowStockThreshold: 40, imageUrl: "/Assets/Products/Sparkling/watermelon-strawberry.jpg" },
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
