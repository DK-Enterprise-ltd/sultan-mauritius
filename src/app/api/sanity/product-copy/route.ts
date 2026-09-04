import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { syncProductCopy, type ProductCopyDoc } from "@/lib/sanity-sync";

// Sanity Studio webhook target. Configure in Sanity Manage → API →
// Webhooks: filter `_type == "productCopy"`, projection includes _id, sku,
// tasteNote(Fr), bestServedNote(Fr), specNote(Fr).
export async function POST(req: NextRequest) {
  const { isValidSignature, body } = await parseBody<ProductCopyDoc>(
    req,
    process.env.SANITY_WEBHOOK_SECRET
  );
  if (!isValidSignature || !body?._id) {
    return new Response("Invalid signature", { status: 401 });
  }

  await syncProductCopy(body);
  return NextResponse.json({ ok: true });
}
