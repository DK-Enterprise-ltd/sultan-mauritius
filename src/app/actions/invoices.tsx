"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type InvoiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { createDraftInvoiceForOrder, emailInvoice } from "@/lib/invoice-service";

type ActionResult = { ok: true } | { ok: false; error: string };
type GenerateInvoiceResult = { ok: true; invoiceId: string } | { ok: false; error: string };

const INVOICE_STATUSES: InvoiceStatus[] = ["DRAFT", "ISSUED", "PAID"];

/** Admin-only: creates a draft invoice for an order that doesn't have one
 * yet — editable, not yet sent to the customer. See
 * src/lib/invoice-service.ts for the shared logic (also used to
 * auto-generate an invoice at order creation, src/app/actions/orders.ts). */
export async function generateInvoiceForOrder(orderId: string): Promise<GenerateInvoiceResult> {
  if (!isAdmin()) return { ok: false, error: "Not authorized." };

  const result = await createDraftInvoiceForOrder(orderId);
  if (result.ok) {
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/invoices");
    revalidatePath(`/admin/invoices/${result.invoiceId}`);
  }
  return result;
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
 * silently "succeeding" without sending would be misleading. See
 * src/lib/invoice-service.ts for the shared logic (also used to
 * auto-send an invoice on fulfillment, src/app/actions/orders.ts). */
export async function sendInvoice(invoiceId: string): Promise<ActionResult> {
  if (!isAdmin()) return { ok: false, error: "Not authorized." };

  const result = await emailInvoice(invoiceId);
  if (!result.ok) return result;

  revalidatePath(`/admin/invoices/${invoiceId}`);
  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/orders/${result.orderId}`);

  return { ok: true };
}
