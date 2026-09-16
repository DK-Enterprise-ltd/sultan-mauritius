-- Collapse OUT_FOR_DELIVERY/PAID into CONFIRMED/FULFILLED: no online
-- payment means there's nothing distinct for "paid" to track on Order
-- (Invoice.status already owns payment reconciliation), and dispatch vs.
-- delivered wasn't a distinction admins were using day to day.
UPDATE "Order" SET status = 'CONFIRMED' WHERE status = 'OUT_FOR_DELIVERY';
UPDATE "Order" SET status = 'FULFILLED' WHERE status = 'PAID';

-- Postgres has no direct "drop enum value": swap in a narrower type.
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED');

ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';

DROP TYPE "OrderStatus";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "estimatedDeliveryAt" TIMESTAMP(3);
