import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { InvoicePdfDocument } from "@/lib/pdf/invoice-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) {
    return new NextResponse("Not authorized.", { status: 403 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      order: {
        include: { customer: true, items: { include: { product: true } } },
      },
    },
  });
  if (!invoice) {
    return new NextResponse("Invoice not found.", { status: 404 });
  }

  // Default to inline so it opens in the browser's own PDF viewer
  // (visible without leaving the admin panel); ?download=1 forces a save
  // dialog for the explicit "Download PDF" action.
  const forceDownload = new URL(req.url).searchParams.get("download") === "1";
  const disposition = forceDownload ? "attachment" : "inline";

  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(<InvoicePdfDocument invoice={invoice} />);
  } catch (error) {
    console.error(`Failed to render PDF for invoice #${invoice.invoiceNumber}:`, error);
    return NextResponse.json(
      { error: "Could not generate the invoice PDF. Check server logs for details." },
      { status: 500 },
    );
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      // Same-origin only (the admin invoice page's own <iframe> preview),
      // not the global X-Frame-Options: DENY / frame-ancestors 'none' this
      // route is carved out of in next.config.mjs and middleware.ts.
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
