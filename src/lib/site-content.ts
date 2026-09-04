// Read helper for CMS copy synced from Sanity (see sanity-sync.ts). Every
// call site keeps its messages.json string as a fallback, so a page never
// breaks just because a Sanity doc hasn't been authored/synced yet.
import { prisma } from "@/lib/prisma";

export async function getSiteContent(key: string): Promise<Record<string, unknown> | null> {
  const row = await prisma.siteContent.findUnique({ where: { key } });
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
