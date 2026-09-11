import { Resend } from "resend";
import type { OrderStatus } from "@prisma/client";
import { formatMur } from "@/lib/format";

// Lazy: `new Resend(undefined)` throws synchronously at construction, not
// just on send. Since this whole module is imported by createOrder (via
// sendOrderStatusEmail), constructing it eagerly at module load would take
// down checkout itself whenever RESEND_API_KEY is unset — not just emails.
let resend: Resend | undefined;
function getResend(): Resend {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

// ponytail: falls back to Resend's shared onboarding@resend.dev address,
// which only delivers to the Resend account's own verified email — every
// other recipient silently fails to send. Once a domain is verified in
// Resend, set EMAIL_FROM (e.g. "Sultan Mauritius <orders@sultanmauritius.mu>")
// so switching senders is a config change, not a code change.
const FROM = process.env.EMAIL_FROM || "Sultan Mauritius <onboarding@resend.dev>";

let warnedMissingKey = false;

const STATUS_COPY: Partial<Record<OrderStatus, { subject: string; body: (orderNumber: number) => string }>> = {
  PENDING: {
    subject: "We've received your order",
    body: (n) =>
      `We've received order #${n} and it's awaiting confirmation.\n\n` +
      `Please await confirmation, after which we'll email you the payment details.`,
  },
  CONFIRMED: {
    subject: "Your order is confirmed: payment details",
    body: (n) =>
      `We've confirmed order #${n} and are getting it ready.\n\n` +
      `To complete your purchase, please pay by bank transfer or MCB Juice, using order #${n} as your payment reference:\n` +
      `- Bank transfer: Sultan Mauritius Ltd, MCB, Account 000123456789\n` +
      `- MCB Juice: see the Payment Instructions page on our website for the merchant number and steps\n` +
      `- Cash on delivery may also be available in your area`,
  },
  PAID: {
    subject: "Payment received",
    body: (n) => `We've received payment for order #${n}. It's now being prepared for delivery.`,
  },
  OUT_FOR_DELIVERY: {
    subject: "Your order is out for delivery",
    body: (n) => `Order #${n} is on its way to you.`,
  },
  FULFILLED: {
    subject: "Your order has been delivered",
    body: (n) => `Order #${n} has been delivered. Thank you for choosing Sultan.`,
  },
  CANCELLED: {
    subject: "Your order has been cancelled",
    body: (n) => `Order #${n} has been cancelled. Contact us if this wasn't expected.`,
  },
};

type StatusEmailOrder = {
  orderNumber: number;
  status: OrderStatus;
  total: Parameters<typeof formatMur>[0];
  customer: { name: string; email: string };
};

type InvoiceEmailPayload = {
  invoiceNumber: number;
  orderNumber: number;
  dueDate: Date | null;
  balanceDue: Parameters<typeof formatMur>[0];
  customer: { name: string; email: string };
  pdfBuffer: Buffer;
};

/** Unlike sendOrderStatusEmail, this throws on failure — "Send invoice" is
 * the one action whose whole point is the email; the caller uses success
 * to decide whether to mark the invoice ISSUED. */
export async function sendInvoiceEmail(invoice: InvoiceEmailPayload): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set — cannot send invoice emails.");
  }

  const dueLine = invoice.dueDate
    ? `Payment is due by ${invoice.dueDate.toLocaleDateString("en-MU")}.`
    : "Payment is due immediately.";

  await getResend().emails.send({
    from: FROM,
    to: invoice.customer.email,
    subject: `Invoice #${invoice.invoiceNumber} for order #${invoice.orderNumber}`,
    text:
      `Hi ${invoice.customer.name},\n\n` +
      `Please find attached invoice #${invoice.invoiceNumber} for order #${invoice.orderNumber}.\n\n` +
      `Balance due: ${formatMur(invoice.balanceDue)}\n${dueLine}\n\n` +
      `Sultan Mauritius`,
    attachments: [
      {
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        content: invoice.pdfBuffer,
      },
    ],
  });
}

// Best-effort: a failed send should never roll back an admin's status
// update, so this only logs on error rather than throwing.
export async function sendOrderStatusEmail(order: StatusEmailOrder) {
  const copy = STATUS_COPY[order.status];
  if (!copy) return;

  if (!process.env.RESEND_API_KEY) {
    // Fail loud exactly once per server instance instead of attempting (and
    // silently failing) a send on every status change with no key set.
    if (!warnedMissingKey) {
      warnedMissingKey = true;
      console.error("RESEND_API_KEY is not set — order status emails will not be sent.");
    }
    return;
  }

  try {
    await getResend().emails.send({
      from: FROM,
      to: order.customer.email,
      subject: `${copy.subject}: Order #${order.orderNumber}`,
      text: `Hi ${order.customer.name},\n\n${copy.body(order.orderNumber)}\n\nOrder total: ${formatMur(order.total)}\n\nSultan Mauritius`,
    });
  } catch (error) {
    console.error(`Failed to send order status email for order #${order.orderNumber}:`, error);
  }
}
