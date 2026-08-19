import type { Product } from "@prisma/client";
import type { Viewer } from "@/lib/auth";

/** Wholesale price for B2B viewers when set, otherwise falls back to retail. */
export function resolvePrice(product: Product, viewer: Viewer): number {
  if (viewer.isB2B && product.wholesalePrice) {
    return product.wholesalePrice.toNumber();
  }
  return product.retailPrice.toNumber();
}
