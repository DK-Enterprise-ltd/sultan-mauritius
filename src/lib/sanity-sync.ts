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

// A Sanity `image` field's value on the webhook payload — an asset
// reference, not a URL. See sanityImageUrl() below for the conversion.
type SanityImageValue = { asset?: { _ref?: string } } | undefined;

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.SANITY_DATASET || "production";

// Sanity's asset _ref is "image-<id>-<width>x<height>-<format>"; the CDN
// URL is a fixed transform of that, no API call needed. See
// https://www.sanity.io/docs/image-urls for the format.
export function sanityImageUrl(image: SanityImageValue): string | undefined {
  const ref = image?.asset?._ref;
  if (!ref || !SANITY_PROJECT_ID) return undefined;
  const match = /^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/.exec(ref);
  if (!match) return undefined;
  const [, id, dims, format] = match;
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dims}.${format}`;
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
  image?: SanityImageValue;
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
    imageUrl: sanityImageUrl(doc.image),
  };

  await prisma.productCopy.upsert({
    where: { sanityId },
    create: { sanityId, ...fields },
    update: fields,
  });
}

export type SiteContentDoc = { _id: string; _type: string } & Record<string, unknown>;

const SANITY_META_KEYS = ["_id", "_type", "_rev", "_createdAt", "_updatedAt"];

// Every page-copy singleton (home, about, wholesale, stockists, contact,
// products) syncs through here, keyed by its own SiteContent row — see
// SITE_CONTENT_KEY_BY_TYPE in the webhook route for the _type -> key map.
// Generic because Sanity is the whole document already; there's nothing
// left to validate or reshape per page, unlike stockist/productCopy which
// map onto real Prisma columns.
export async function syncSiteContent(key: string, doc: SiteContentDoc) {
  const fields = Object.fromEntries(
    Object.entries(doc).filter(([k]) => !SANITY_META_KEYS.includes(k))
  ) as Prisma.InputJsonObject;

  await prisma.siteContent.upsert({
    where: { key },
    create: { key, data: fields },
    update: { data: fields },
  });
}
