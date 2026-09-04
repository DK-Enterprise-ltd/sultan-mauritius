// Upsert helpers shared by the /api/sanity/* webhook routes and
// scripts/sanity-backfill.js's one-time backfill. Sanity Studio is the
// authoring surface; these write the synced copy into Postgres, which is
// what the site actually renders from (see prisma/schema.prisma's CMS
// content section for why).
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function stripDraftPrefix(id: string): string {
  return id.replace(/^drafts\./, "");
}

export type StockistDoc = {
  _id: string;
  name?: string;
  region?: string;
  town?: string;
  address?: string;
  phone?: string;
  mapUrl?: string;
  isActive?: boolean;
};

export async function syncStockist(doc: StockistDoc) {
  const sanityId = stripDraftPrefix(doc._id);

  // ponytail: deletion is inferred from the required "name" field being
  // absent, since a deleted document's webhook payload can't be projected
  // for its fields. Upgrade path: Sanity's dedicated delete-event webhook
  // trigger, which reliably sends {_id, _type} on removal.
  if (!doc.name) {
    await prisma.stockist.deleteMany({ where: { sanityId } });
    return;
  }

  await prisma.stockist.upsert({
    where: { sanityId },
    create: {
      sanityId,
      name: doc.name,
      region: doc.region ?? "",
      town: doc.town ?? "",
      address: doc.address,
      phone: doc.phone,
      mapUrl: doc.mapUrl,
      isActive: doc.isActive ?? true,
    },
    update: {
      name: doc.name,
      region: doc.region ?? "",
      town: doc.town ?? "",
      address: doc.address,
      phone: doc.phone,
      mapUrl: doc.mapUrl,
      isActive: doc.isActive ?? true,
    },
  });
}

export type ProductCopyDoc = {
  _id: string;
  sku?: string;
  tasteNote?: string;
  tasteNoteFr?: string;
  bestServedNote?: string;
  bestServedNoteFr?: string;
  specNote?: string;
  specNoteFr?: string;
};

export async function syncProductCopy(doc: ProductCopyDoc) {
  const sanityId = stripDraftPrefix(doc._id);

  if (!doc.sku) {
    await prisma.productCopy.deleteMany({ where: { sanityId } });
    return;
  }

  const fields = {
    sku: doc.sku,
    tasteNote: doc.tasteNote,
    tasteNoteFr: doc.tasteNoteFr,
    bestServedNote: doc.bestServedNote,
    bestServedNoteFr: doc.bestServedNoteFr,
    specNote: doc.specNote,
    specNoteFr: doc.specNoteFr,
  };

  await prisma.productCopy.upsert({
    where: { sanityId },
    create: { sanityId, ...fields },
    update: fields,
  });
}

export type HomeContentDoc = { _id: string } & Record<string, unknown>;

const SANITY_META_KEYS = ["_id", "_type", "_rev", "_createdAt", "_updatedAt"];

export async function syncHomeContent(doc: HomeContentDoc) {
  const fields = Object.fromEntries(
    Object.entries(doc).filter(([key]) => !SANITY_META_KEYS.includes(key))
  ) as Prisma.InputJsonObject;

  await prisma.siteContent.upsert({
    where: { key: "home" },
    create: { key: "home", data: fields },
    update: { data: fields },
  });
}
