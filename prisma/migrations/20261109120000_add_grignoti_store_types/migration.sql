-- AlterEnum
ALTER TYPE "ProductType" ADD VALUE 'DRINK';
ALTER TYPE "ProductType" ADD VALUE 'SNACK';
ALTER TYPE "ProductType" ADD VALUE 'MISC';

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "sizeMl" DROP NOT NULL;
