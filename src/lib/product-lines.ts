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
