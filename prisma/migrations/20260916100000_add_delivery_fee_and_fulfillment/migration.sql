-- CreateEnum
CREATE TYPE "FulfillmentMethod" AS ENUM ('DELIVERY', 'PICKUP');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "fulfillmentMethod" "FulfillmentMethod" NOT NULL DEFAULT 'DELIVERY',
ADD COLUMN     "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0;
