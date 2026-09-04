import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { syncHomeContent, type HomeContentDoc } from "@/lib/sanity-sync";

// Sanity Studio webhook target. Configure in Sanity Manage → API →
// Webhooks: filter `_type == "homeContent"`, projection includes every
// field (Studio → API → Webhooks → "Include drafts" off, projection `{...}`).
export async function POST(req: NextRequest) {
  const { isValidSignature, body } = await parseBody<HomeContentDoc>(
    req,
    process.env.SANITY_WEBHOOK_SECRET
  );
  if (!isValidSignature || !body?._id) {
    return new Response("Invalid signature", { status: 401 });
  }

  await syncHomeContent(body);
  return NextResponse.json({ ok: true });
}
