import type { ProductType } from "@prisma/client";

// Two storefronts share one Product table (and so one stock count, cart,
// checkout and admin form): the Sultan water lines on /products and the
// Grignoti Store on /grignoti. A product's type alone decides which page
// lists it, so there's no separate "store" column to keep in sync.

export const SULTAN_TYPES = ["STILL", "SPARKLING"] as const satisfies readonly ProductType[];
export const GRIGNOTI_TYPES = ["DRINK", "SNACK", "MISC"] as const satisfies readonly ProductType[];

export type SultanType = (typeof SULTAN_TYPES)[number];
export type GrignotiType = (typeof GRIGNOTI_TYPES)[number];

export function isSultanType(type: string): type is SultanType {
  return (SULTAN_TYPES as readonly string[]).includes(type);
}

export function isGrignotiType(type: string): type is GrignotiType {
  return (GRIGNOTI_TYPES as readonly string[]).includes(type);
}

/** Admin-facing labels, used by the add/edit product forms and the
 * inventory table. Storefront labels live in messages/*.json. */
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  STILL: "Still",
  SPARKLING: "Sparkling",
  DRINK: "Grignoti: Drinks",
  SNACK: "Grignoti: Snacks",
  MISC: "Grignoti: Misc",
};

/** "200ml", or null for an item with no volume (most Grignoti snacks). */
export function formatSizeMl(sizeMl: number | null | undefined): string | null {
  return sizeMl ? `${sizeMl}ml` : null;
}

export type OrderTagline = {
  short: string; // email header strap line
  long: string; // email footer and invoice PDF footer
};

const WATER_TAGLINE: OrderTagline = {
  short: "Natural Mineral Water",
  long: "Premium Mineral Water Sourced from Turkey",
};
const GRIGNOTI_TAGLINE: OrderTagline = {
  short: "Drinks, Snacks & More",
  long: "Grignoti Store: Drinks, Snacks & More",
};
const MIXED_TAGLINE: OrderTagline = {
  short: "Mineral Water, Drinks & Snacks",
  long: "Premium Mineral Water from Turkey, plus Drinks & Snacks from the Grignoti Store",
};

/** The brand strap line for an order's emails and invoice, chosen from what
 * was actually bought: water only, Grignoti only, or a mix of both. An
 * empty list (no item info passed) keeps the original water tagline. */
export function taglineForOrder(productTypes: readonly ProductType[] = []): OrderTagline {
  const hasGrignoti = productTypes.some(isGrignotiType);
  const hasSultan = productTypes.some(isSultanType);
  if (hasGrignoti && hasSultan) return MIXED_TAGLINE;
  if (hasGrignoti) return GRIGNOTI_TAGLINE;
  return WATER_TAGLINE;
}
