import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import {
  syncStockist,
  syncProductCopy,
  syncSiteContent,
  type StockistDoc,
  type ProductCopyDoc,
  type SiteContentDoc,
} from "@/lib/sanity-sync";

type AnyDoc = { _id: string; _type: string } & Record<string, unknown>;

// Every page-copy singleton's Sanity _type -> the SiteContent.key pages
// actually read via getSiteContent() (see src/lib/site-content.ts). Add a
// row here (and a matching schema in ../../studio/schemaTypes and
// src/sanity/schemaTypes) to give a new page Sanity-editable copy.
const SITE_CONTENT_KEY_BY_TYPE: Record<string, string> = {
  homeContent: "home",
  aboutContent: "about",
  wholesaleContent: "wholesale",
  stockistsContent: "stockists",
  contactContent: "contact",
  productsContent: "products",
};

// Single webhook target covering every synced document type. The Sanity
// plan on this project caps webhooks at 2, so one combined hook here plus
// room for a future one, rather than the one-hook-per-type layout the
// individual /api/sanity/{stockist,product-copy,home-content} routes were
// built for (kept working, just unused while this project is on that plan).
// Configure in Sanity Manage -> API -> Webhooks: filter
// `_type in ["stockist", "productCopy", "homeContent", "aboutContent",
// "wholesaleContent", "stockistsContent", "contactContent",
// "productsContent"]`, no projection (send the whole document).
export async function POST(req: NextRequest) {
  const { isValidSignature, body } = await parseBody<AnyDoc>(
    req,
    process.env.SANITY_WEBHOOK_SECRET
  );
  if (!isValidSignature || !body?._id || !body?._type) {
    return new Response("Invalid signature", { status: 401 });
  }

  const contentKey = SITE_CONTENT_KEY_BY_TYPE[body._type];
  if (contentKey) {
    await syncSiteContent(contentKey, body as SiteContentDoc);
    return NextResponse.json({ ok: true });
  }

  switch (body._type) {
    case "stockist":
      await syncStockist(body as StockistDoc);
      break;
    case "productCopy":
      await syncProductCopy(body as ProductCopyDoc);
      break;
    default:
      return NextResponse.json({ ok: false, error: "Unknown document type" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
