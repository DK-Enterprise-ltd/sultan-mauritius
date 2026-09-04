-- CreateTable
CREATE TABLE "Stockist" (
    "id" TEXT NOT NULL,
    "sanityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "mapUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stockist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCopy" (
    "id" TEXT NOT NULL,
    "sanityId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "tasteNote" TEXT,
    "tasteNoteFr" TEXT,
    "bestServedNote" TEXT,
    "bestServedNoteFr" TEXT,
    "specNote" TEXT,
    "specNoteFr" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCopy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContent" (
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stockist_sanityId_key" ON "Stockist"("sanityId");

-- CreateIndex
CREATE INDEX "Stockist_region_idx" ON "Stockist"("region");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCopy_sanityId_key" ON "ProductCopy"("sanityId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCopy_sku_key" ON "ProductCopy"("sku");
