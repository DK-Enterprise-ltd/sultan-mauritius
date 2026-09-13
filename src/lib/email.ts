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

export function getEmailDiagnostics() {
  const hasKey = Boolean(process.env.RESEND_API_KEY);
  const isDefaultSender = FROM.includes("onboarding@resend.dev");
  return {
    configured: hasKey,
    from: FROM,
    isSandboxSender: isDefaultSender,
    warning: !hasKey
      ? "RESEND_API_KEY is missing. Emails will not be sent."
      : isDefaultSender
      ? "Using default sandbox email (onboarding@resend.dev). Delivery is limited to account owner email until custom domain is set in EMAIL_FROM."
      : null,
  };
}

function wrapHtmlEmail(title: string, bodyHtml: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c2536; line-height: 1.5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #faf8f5; padding: 24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="background-color: #1b2a4a; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: 0.5px; font-family: Georgia, serif;">Sultan Mauritius</h1>
              <p style="color: #4fb8d6; font-size: 12px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Natural Mineral Water</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
              <p style="margin: 0 0 4px 0;"><strong>Sultan Mauritius Ltd</strong></p>
              <p style="margin: 0;">Premium Mineral Water Sourced from Uludağ</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

const STATUS_COPY: Partial<Record<OrderStatus, { subject: string; body: (orderNumber: number) => string; htmlBody?: (orderNumber: number) => string }>> = {
  PENDING: {
    subject: "We've received your order",
    body: (n) =>
      `We've received order #${n} and it's awaiting confirmation.\n\n` +
      `Please await confirmation, after which we'll email you the payment details.`,
    htmlBody: (n) =>
      `<p>We've received order <strong>#${n}</strong> and it is currently awaiting confirmation.</p>` +
      `<p>Please await confirmation, after which we will email you the payment details.</p>`,
  },
  CONFIRMED: {
    subject: "Your order is confirmed: payment details",
    body: (n) =>
      `We've confirmed order #${n} and are getting it ready.\n\n` +
      `To complete your purchase, please pay by bank transfer or MCB Juice, using order #${n} as your payment reference:\n` +
      `- Bank transfer: Sultan Mauritius Ltd, MCB, Account 000123456789\n` +
      `- MCB Juice: see the Payment Instructions page on our website for the merchant number and steps\n` +
      `- Cash on delivery may also be available in your area`,
    htmlBody: (n) =>
      `<p>We've confirmed order <strong>#${n}</strong> and are getting it ready for fulfillment.</p>` +
      `<div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; margin: 16px 0;">` +
      `<p style="margin-top: 0; font-weight: 600;">Payment Instructions (Reference: Order #${n}):</p>` +
      `<ul style="margin-bottom: 0; padding-left: 20px;">` +
      `<li><strong>Bank Transfer:</strong> Sultan Mauritius Ltd, MCB, Account 000123456789</li>` +
      `<li><strong>MCB Juice:</strong> Check Payment Instructions on our site for merchant details</li>` +
      `<li>Cash on delivery may also be available in your area</li>` +
      `</ul></div>`,
  },
  PAID: {
    subject: "Payment received",
    body: (n) => `We've received payment for order #${n}. It's now being prepared for delivery.`,
    htmlBody: (n) => `<p>We've received payment for order <strong>#${n}</strong>. It is now being prepared for delivery.</p>`,
  },
  OUT_FOR_DELIVERY: {
    subject: "Your order is out for delivery",
    body: (n) => `Order #${n} is on its way to you.`,
    htmlBody: (n) => `<p>Order <strong>#${n}</strong> is on its way to you.</p>`,
  },
  FULFILLED: {
    subject: "Your order has been delivered",
    body: (n) => `Order #${n} has been delivered. Thank you for choosing Sultan.`,
    htmlBody: (n) => `<p>Order <strong>#${n}</strong> has been delivered. Thank you for choosing Sultan Mauritius!</p>`,
  },
  CANCELLED: {
    subject: "Your order has been cancelled",
    body: (n) => `Order #${n} has been cancelled. Contact us if this wasn't expected.`,
    htmlBody: (n) => `<p>Order <strong>#${n}</strong> has been cancelled. Contact us if this was not expected.</p>`,
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

  const htmlContent = wrapHtmlEmail(
    `Invoice #${invoice.invoiceNumber}`,
    `<h2 style="margin-top: 0; color: #1b2a4a; font-size: 18px;">Invoice #${invoice.invoiceNumber}</h2>` +
      `<p>Hi ${invoice.customer.name},</p>` +
      `<p>Please find attached invoice <strong>#${invoice.invoiceNumber}</strong> for order <strong>#${invoice.orderNumber}</strong>.</p>` +
      `<div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #1b9aae; margin: 20px 0;">` +
      `<p style="margin: 0; font-size: 16px; font-weight: 600; color: #1b2a4a;">Balance due: ${formatMur(invoice.balanceDue)}</p>` +
      `<p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">${dueLine}</p>` +
      `</div>` +
      `<p>Thank you,<br/>Sultan Mauritius Team</p>`
  );

  await getResend().emails.send({
    from: FROM,
    to: invoice.customer.email,
    subject: `Invoice #${invoice.invoiceNumber} for order #${invoice.orderNumber}`,
    text:
      `Hi ${invoice.customer.name},\n\n` +
      `Please find attached invoice #${invoice.invoiceNumber} for order #${invoice.orderNumber}.\n\n` +
      `Balance due: ${formatMur(invoice.balanceDue)}\n${dueLine}\n\n` +
      `Sultan Mauritius`,
    html: htmlContent,
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
    if (!warnedMissingKey) {
      warnedMissingKey = true;
      console.error("RESEND_API_KEY is not set — order status emails will not be sent.");
    }
    return;
  }

  const innerHtml = copy.htmlBody ? copy.htmlBody(order.orderNumber) : `<p>${copy.body(order.orderNumber)}</p>`;
  const htmlContent = wrapHtmlEmail(
    copy.subject,
    `<h2 style="margin-top: 0; color: #1b2a4a; font-size: 18px;">${copy.subject}</h2>` +
      `<p>Hi ${order.customer.name},</p>` +
      `${innerHtml}` +
      `<p style="margin-top: 20px; font-weight: 600; color: #1b2a4a;">Order Total: ${formatMur(order.total)}</p>` +
      `<p>Thank you,<br/>Sultan Mauritius Team</p>`
  );

  try {
    await getResend().emails.send({
      from: FROM,
      to: order.customer.email,
      subject: `${copy.subject}: Order #${order.orderNumber}`,
      text: `Hi ${order.customer.name},\n\n${copy.body(order.orderNumber)}\n\nOrder total: ${formatMur(order.total)}\n\nSultan Mauritius`,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`Failed to send order status email for order #${order.orderNumber}:`, error);
  }
}
