import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";

// Product rows change from the admin panel, not from a redeploy: without
// this, the sitemap would only ever reflect the catalog as of the last
// build.
export const revalidate = 86400;

const STATIC_PATHS = [
  "",
  "/products",
  "/about",
  "/wholesale",
  "/contact",
  "/stockists",
  "/legal",
  "/legal/privacy-policy",
  "/legal/terms-consumer",
  "/legal/terms-business",
  "/legal/payment-instructions",
  "/legal/delivery-shipping",
  "/legal/cancellation-refund",
  "/legal/cookie-policy",
  "/legal/legal-notice",
  "/legal/copyright",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, updatedAt: true },
  });

  const paths = [
    ...STATIC_PATHS.map((path) => ({ path, lastModified: undefined as Date | undefined })),
    ...products.map((p) => ({ path: `/products/${p.id}`, lastModified: p.updatedAt })),
  ];

  return routing.locales.flatMap((locale) =>
    paths.map(({ path, lastModified }) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified,
    }))
  );
}
