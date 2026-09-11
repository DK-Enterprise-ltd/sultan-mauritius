import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { InvoicePdfDocument } from "@/lib/pdf/invoice-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
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

  const buffer = await renderToBuffer(<InvoicePdfDocument invoice={invoice} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
