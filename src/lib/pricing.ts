import { Prisma, type Product } from "@prisma/client";
import type { Viewer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Wholesale price for B2B viewers when set, otherwise falls back to retail. */
export function resolvePrice(product: Product, viewer: Viewer): number {
  if (viewer.isB2B && product.wholesalePrice) {
    return product.wholesalePrice.toNumber();
  }
  return product.retailPrice.toNumber();
}

const PRICING_SETTING_ID = "singleton";

// The client asked for the discount to kick in once an order line has
// "more than 6 units" of the same product — 7+, not a DB-configurable
// number like the percent below (see PricingSetting).
export const BULK_DISCOUNT_MIN_QTY = 7;

/** Falls back to 0 (no discount) until an admin sets one via
 * setBulkDiscountPercent — same found-row-or-fallback shape as
 * verifyAdminPassword in src/lib/admin-credential.ts. */
export async function getBulkDiscountPercent(): Promise<Prisma.Decimal> {
  const row = await prisma.pricingSetting.findUnique({ where: { id: PRICING_SETTING_ID } });
  return row?.bulkDiscountPercent ?? new Prisma.Decimal(0);
}

export async function setBulkDiscountPercent(percent: number): Promise<void> {
  await prisma.pricingSetting.upsert({
    where: { id: PRICING_SETTING_ID },
    create: { id: PRICING_SETTING_ID, bulkDiscountPercent: percent },
    update: { bulkDiscountPercent: percent },
  });
}

/** Applies the bulk discount to a single order line's unit price when its
 * quantity meets BULK_DISCOUNT_MIN_QTY, replacing the old per-pack Product
 * rows (6-pack, 24-case, etc.) with one automatic calculation off the
 * single-bottle price. Decimal math throughout, same money-path discipline
 * as the rest of the order/invoice pricing code. */
export function applyBulkDiscount(
  unitPrice: Prisma.Decimal,
  quantity: number,
  percent: Prisma.Decimal | number
): Prisma.Decimal {
  const percentDecimal = percent instanceof Prisma.Decimal ? percent : new Prisma.Decimal(percent);
  if (quantity < BULK_DISCOUNT_MIN_QTY || percentDecimal.lessThanOrEqualTo(0)) {
    return unitPrice;
  }
  const discounted = unitPrice.times(new Prisma.Decimal(1).minus(percentDecimal.dividedBy(100)));
  return discounted.toDecimalPlaces(2);
}
