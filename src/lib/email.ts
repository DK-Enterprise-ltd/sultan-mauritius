import { Resend } from "resend";
import type { OrderStatus } from "@prisma/client";
import { formatMur } from "@/lib/format";

const resend = new Resend(process.env.RESEND_API_KEY);

// ponytail: no verified sending domain yet, so mail goes out from Resend's
// shared onboarding@resend.dev address. Swap for a verified "orders@
// sultanmauritius.mu" once a domain is added in Resend.
const FROM = "Sultan Mauritius <onboarding@resend.dev>";

const STATUS_COPY: Partial<Record<OrderStatus, { subject: string; body: (orderNumber: number) => string }>> = {
  CONFIRMED: {
    subject: "Your order is confirmed",
    body: (n) => `We've confirmed order #${n} and are getting it ready.`,
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

// Best-effort: a failed send should never roll back an admin's status
// update, so this only logs on error rather than throwing.
export async function sendOrderStatusEmail(order: StatusEmailOrder) {
  const copy = STATUS_COPY[order.status];
  if (!copy) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: order.customer.email,
      subject: `${copy.subject}: Order #${order.orderNumber}`,
      text: `Hi ${order.customer.name},\n\n${copy.body(order.orderNumber)}\n\nOrder total: ${formatMur(order.total)}\n\nSultan Mauritius`,
    });
  } catch (error) {
    console.error(`Failed to send order status email for order #${order.orderNumber}:`, error);
  }
}
