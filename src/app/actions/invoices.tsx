"use server";

import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { Prisma, type InvoiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { sendInvoiceEmail } from "@/lib/email";
import { InvoicePdfDocument } from "@/lib/pdf/invoice-pdf";

type ActionResult = { ok: true } | { ok: false; error: string };
type GenerateInvoiceResult = { ok: true; invoiceId: string } | { ok: false; error: string };

const INVOICE_STATUSES: InvoiceStatus[] = ["DRAFT", "ISSUED", "PAID"];

/** Admin-only: creates a draft invoice for an order that doesn't have one
 * yet — editable, not yet sent to the customer. Due date defaults from the
 * customer's credit terms (0 days — due immediately — when unset, matching
 * the schema's "null means pay-before-fulfillment" convention) but stays
 * editable before it's actually sent. */
export async function generateInvoiceForOrder(orderId: string): Promise<GenerateInvoiceResult> {
  if (!isAdmin()) return { ok: false, error: "Not authorized." };

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

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${invoice.id}`);

  return { ok: true, invoiceId: invoice.id };
}

type UpdateInvoiceInput = {
  dueDate: string | null; // yyyy-mm-dd from <input type="date">, or null to clear
  amountPaid: number;
  status: InvoiceStatus;
};

/** Admin-only: edits an invoice's terms/payment state. balanceDue is always
 * re-derived from the order total, never taken from the client, so it can
 * never drift out of sync with amountPaid. */
export async function updateInvoice(invoiceId: string, input: UpdateInvoiceInput): Promise<ActionResult> {
  if (!isAdmin()) return { ok: false, error: "Not authorized." };
  if (!INVOICE_STATUSES.includes(input.status)) {
    return { ok: false, error: "Invalid status." };
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { order: true },
  });
  if (!invoice) return { ok: false, error: "Invoice not found." };

  const orderTotal = invoice.order.total;
  const amountPaid = new Prisma.Decimal(Number.isFinite(input.amountPaid) ? input.amountPaid : 0);
  if (amountPaid.lessThan(0) || amountPaid.greaterThan(orderTotal)) {
    return { ok: false, error: `Amount paid must be between 0 and ${orderTotal}.` };
  }

  const dueDate = input.dueDate ? new Date(input.dueDate) : null;
  if (input.dueDate && Number.isNaN(dueDate?.getTime())) {
    return { ok: false, error: "Invalid due date." };
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      dueDate,
      amountPaid,
      balanceDue: orderTotal.minus(amountPaid),
      status: input.status,
      // Moving into ISSUED by hand (without using "Send invoice") still
      // needs an issued date; don't touch it if it's already set.
      issuedAt: input.status !== "DRAFT" && !invoice.issuedAt ? new Date() : invoice.issuedAt,
    },
  });

  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/orders/${invoice.order.id}`);

  return { ok: true };
}

/** Admin-only: emails the invoice PDF to the customer and marks it ISSUED.
 * Unlike order-status emails, a failed send is reported back to the admin
 * instead of swallowed — the whole point of this action is the email, so
 * silently "succeeding" without sending would be misleading. */
export async function sendInvoice(invoiceId: string): Promise<ActionResult> {
  if (!isAdmin()) return { ok: false, error: "Not authorized." };

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

  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/orders/${invoice.order.id}`);

  return { ok: true };
}
