import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { syncStockist, type StockistDoc } from "@/lib/sanity-sync";

// Sanity Studio webhook target. Configure in Sanity Manage → API →
// Webhooks: filter `_type == "stockist"`, projection includes _id, name,
// region, town, address, phone, mapUrl, isActive.
export async function POST(req: NextRequest) {
  const { isValidSignature, body } = await parseBody<StockistDoc>(
    req,
    process.env.SANITY_WEBHOOK_SECRET
  );
  if (!isValidSignature || !body?._id) {
    return new Response("Invalid signature", { status: 401 });
  }

  await syncStockist(body);
  return NextResponse.json({ ok: true });
}
