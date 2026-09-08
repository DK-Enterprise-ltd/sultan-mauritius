import { unstable_cache } from "next/cache";
import { Prisma, type Product } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resolvePrice } from "@/lib/pricing";
import type { Viewer } from "@/lib/auth";

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

// A Studio-authored photo (productCopy.imageUrl, by sku) overrides the
// catalogue's own imageUrl when set, so the business can swap a product
// photo without a code deploy. Applied at the read boundary here rather
// than in every page, so ProductCard/admin/cart all see it the same way.
// Cached like everything else here — this used to run a fresh query on
// every single product-listing render, which was a real chunk of the
// page-load slowness.
const cachedCopyImages = unstable_cache(
  async () => {
    const copies = await prisma.productCopy.findMany({
      where: { imageUrl: { not: null } },
      select: { sku: true, imageUrl: true },
    });
    return copies as { sku: string; imageUrl: string }[];
  },
  ["product-copy-images"],
  { revalidate: 60, tags: ["product-copy"] }
);

async function withCopyImage(products: Product[]): Promise<Product[]> {
  if (products.length === 0) return products;
  const copies = await cachedCopyImages();
  if (copies.length === 0) return products;
  const imageBySku = new Map(copies.map((c) => [c.sku, c.imageUrl]));
  return products.map((p) => (imageBySku.has(p.sku) ? { ...p, imageUrl: imageBySku.get(p.sku)! } : p));
}

const cachedActiveProducts = unstable_cache(
  async () => prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ["active-products"],
  { revalidate: 60, tags: ["products", "product-copy"] }
);
export async function getActiveProducts() {
  return withCopyImage((await cachedActiveProducts()).map(rehydrate));
}

const cachedProductById = unstable_cache(
  async (id: string) => prisma.product.findUnique({ where: { id } }),
  ["product-by-id"],
  { revalidate: 60, tags: ["products", "product-copy"] }
);
export async function getProductById(id: string) {
  const product = await cachedProductById(id);
  if (!product) return null;
  const [withImage] = await withCopyImage([rehydrate(product)]);
  return withImage;
}

// Single bottle plus its pre-packed multi-buys (6-pack, 24-case) are
// separate Product rows sharing type/flavor/size; group them here so a
// card's variant picker can offer pack sizes without a second query.
export function productVariants(product: Product, allProducts: Product[], viewer: Viewer) {
  return allProducts
    .filter((p) => p.type === product.type && p.flavor === product.flavor && p.sizeMl === product.sizeMl)
    .sort((a, b) => a.packCount - b.packCount)
    .map((v) => ({
      id: v.id,
      name: v.name,
      flavor: v.flavor,
      sizeMl: v.sizeMl,
      packCount: v.packCount,
      imageUrl: v.imageUrl,
      displayPrice: resolvePrice(v, viewer),
      stockQuantity: v.stockQuantity,
    }));
}

export const getProductCopyBySku = unstable_cache(
  async (sku: string) => prisma.productCopy.findUnique({ where: { sku } }),
  ["product-copy-by-sku"],
  { revalidate: 60, tags: ["product-copy"] }
);
