import { unstable_cache } from "next/cache";
import { Prisma, type Product } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ponytail: storefront pages were hitting the remote Neon DB fresh on every
// request (getViewer()'s cookies() call already forces dynamic rendering),
// which is most of what made page loads feel slow. Catalog data changes
// rarely, so cache it for a minute with Next's built-in data cache instead
// of reaching for a bigger caching layer. Money/stock at order time still
// goes through the live, uncached prisma calls in actions/orders.ts.
//
// unstable_cache round-trips values through JSON, so Decimal fields come
// back as plain strings — rehydrate them into Prisma.Decimal so callers
// (resolvePrice, formatMur) keep working unchanged.
function rehydrate(product: Product): Product {
  return {
    ...product,
    retailPrice: new Prisma.Decimal(product.retailPrice),
    wholesalePrice: product.wholesalePrice === null ? null : new Prisma.Decimal(product.wholesalePrice),
  };
}

const cachedActiveProducts = unstable_cache(
  async () => prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ["active-products"],
  { revalidate: 60, tags: ["products"] }
);
export async function getActiveProducts() {
  return (await cachedActiveProducts()).map(rehydrate);
}

const cachedProductById = unstable_cache(
  async (id: string) => prisma.product.findUnique({ where: { id } }),
  ["product-by-id"],
  { revalidate: 60, tags: ["products"] }
);
export async function getProductById(id: string) {
  const product = await cachedProductById(id);
  return product ? rehydrate(product) : null;
}

export const getProductCopyBySku = unstable_cache(
  async (sku: string) => prisma.productCopy.findUnique({ where: { sku } }),
  ["product-copy-by-sku"],
  { revalidate: 60, tags: ["product-copy"] }
);
