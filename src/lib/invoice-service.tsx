import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { sendInvoiceEmail } from "@/lib/email";
import { InvoicePdfDocument } from "@/lib/pdf/invoice-pdf";

// Shared, auth-agnostic invoice logic used both by the admin-only server
// actions (src/app/actions/invoices.tsx, gated by isAdmin()) and by the
// automatic triggers in src/app/actions/orders.ts (order creation, order
// fulfillment) which run in the customer's own request, not an admin
// session. Deliberately NOT exported from a "use server" file: every
// top-level export of a "use server" module becomes a publicly callable
// server action, and these two have no auth check of their own — that
// check is each caller's responsibility.

export type CreateInvoiceResult = { ok: true; invoiceId: string } | { ok: false; error: string };
export type EmailInvoiceResult = { ok: true; orderId: string } | { ok: false; error: string };

/** Creates a DRAFT invoice for an order that doesn't have one yet (a no-op,
 * returning the existing id, if it already does). Due date defaults from
 * the customer's credit terms (0 days when unset). */
export async function createDraftInvoiceForOrder(orderId: string): Promise<CreateInvoiceResult> {
  const existing = await prisma.invoice.findUnique({ where: { orderId } });
  if (existing) return { ok: true, invoiceId: existing.id };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true },
  });
  if (!order) return { ok: false, error: "Order not found." };

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (order.customer.creditTermsDays ?? 0));

  const invoice = await prisma.invoice.create({
    data: {
      orderId: order.id,
      status: "DRAFT",
      issuedAt: null,
      dueDate,
      amountPaid: 0,
      balanceDue: order.total,
    },
  });

  return { ok: true, invoiceId: invoice.id };
}

/** Renders the invoice PDF, emails it to the customer, and marks the
 * invoice ISSUED (unless it's already past that, e.g. PAID — never
 * downgrades a status). */
export async function emailInvoice(invoiceId: string): Promise<EmailInvoiceResult> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      order: {
        include: { customer: true, items: { include: { product: true } } },
      },
    },
  });
  if (!invoice) return { ok: false, error: "Invoice not found." };

  const pdfBuffer = await renderToBuffer(<InvoicePdfDocument invoice={invoice} />);

  try {
    await sendInvoiceEmail({
      invoiceNumber: invoice.invoiceNumber,
      orderNumber: invoice.order.orderNumber,
      dueDate: invoice.dueDate,
      balanceDue: invoice.balanceDue,
      customer: invoice.order.customer,
      pdfBuffer,
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not send the invoice email." };
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: invoice.status === "DRAFT" ? "ISSUED" : invoice.status,
      issuedAt: invoice.issuedAt ?? new Date(),
    },
  });

  return { ok: true, orderId: invoice.order.id };
}
