// Read helper for CMS copy synced from Sanity (see sanity-sync.ts). Every
// call site keeps its messages.json string as a fallback, so a page never
// breaks just because a Sanity doc hasn't been authored/synced yet.
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// Cached like catalog.ts's product data: every storefront page calls this
// once now (it used to be just the homepage), so an uncached query here
// was a real per-page-load cost. 60s matches the rest of the CMS content.
const cachedSiteContent = unstable_cache(
  async (key: string) => prisma.siteContent.findUnique({ where: { key } }),
  ["site-content-by-key"],
  { revalidate: 60, tags: ["site-content"] }
);

export async function getSiteContent(key: string): Promise<Record<string, unknown> | null> {
  const row = await cachedSiteContent(key);
  return (row?.data as Record<string, unknown> | undefined) ?? null;
}

export function pick(
  content: Record<string, unknown> | null,
  key: string,
  locale: string,
  fallback: string
): string {
  if (!content) return fallback;
  const localizedKey = locale === "fr" ? `${key}Fr` : key;
  const value = content[localizedKey];
  return typeof value === "string" && value.trim() ? value : fallback;
}
