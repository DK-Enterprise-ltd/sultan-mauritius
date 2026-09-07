import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import {
  syncStockist,
  syncProductCopy,
  syncHomeContent,
  type StockistDoc,
  type ProductCopyDoc,
  type HomeContentDoc,
} from "@/lib/sanity-sync";

type AnyDoc = { _id: string; _type: string } & Record<string, unknown>;

// Single webhook target covering every synced document type. The Sanity
// plan on this project caps webhooks at 2, so one combined hook here plus
// room for a future one, rather than the one-hook-per-type layout the
// individual /api/sanity/{stockist,product-copy,home-content} routes were
// built for (kept working, just unused while this project is on that plan).
// Configure in Sanity Manage -> API -> Webhooks: filter
// `_type in ["stockist", "productCopy", "homeContent"]`, no projection (send
// the whole document).
export async function POST(req: NextRequest) {
  const { isValidSignature, body } = await parseBody<AnyDoc>(
    req,
    process.env.SANITY_WEBHOOK_SECRET
  );
  if (!isValidSignature || !body?._id || !body?._type) {
    return new Response("Invalid signature", { status: 401 });
  }

  switch (body._type) {
    case "stockist":
      await syncStockist(body as StockistDoc);
      break;
    case "productCopy":
      await syncProductCopy(body as ProductCopyDoc);
      break;
    case "homeContent":
      await syncHomeContent(body as HomeContentDoc);
      break;
    default:
      return NextResponse.json({ ok: false, error: "Unknown document type" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
