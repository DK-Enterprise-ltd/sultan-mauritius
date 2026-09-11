"use server";

import { Prisma, OrderStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getViewer, isAdmin } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";
import { cleanStr, isValidEmail } from "@/lib/validate";

const MAX_QUANTITY_PER_LINE = 500;

type OrderInput = {
  items: { productId: string; quantity: number }[];
  customer: {
    name: string;
    email: string;
    phone: string;
    companyName?: string;
    deliveryAddress: string;
    deliveryZone?: string;
  };
  notes?: string;
};

type OrderResult = { ok: true; orderNumber: number; id: string } | { ok: false; error: string };

/** Creates a PENDING order from a client-side cart. Prices are re-resolved
 * server-side from the current Product rows — never trust client-supplied
 * prices for a money path. Quantities and customer fields are untrusted
 * client input too: validate before they touch stock or the DB. */
export async function createOrder(input: OrderInput): Promise<OrderResult> {
  if (input.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  for (const item of input.items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_LINE) {
      return { ok: false, error: "One of the quantities in your cart is invalid." };
    }
  }

  const customer = {
    name: cleanStr(input.customer.name, 200),
    email: cleanStr(input.customer.email, 254).toLowerCase(),
    phone: cleanStr(input.customer.phone, 40),
    companyName: input.customer.companyName ? cleanStr(input.customer.companyName, 200) : undefined,
    deliveryAddress: cleanStr(input.customer.deliveryAddress, 500),
    deliveryZone: input.customer.deliveryZone ? cleanStr(input.customer.deliveryZone, 100) : undefined,
  };
  const notes = input.notes ? cleanStr(input.notes, 1000) : undefined;
  if (!customer.name || !isValidEmail(customer.email) || !customer.phone || !customer.deliveryAddress) {
    return { ok: false, error: "Please fill in your name, a valid email, phone, and delivery address." };
  }
  input = { items: input.items, customer, notes };

  const viewer = getViewer();
  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product || !product.isActive) {
      return { ok: false, error: "One of the items in your cart is no longer available." };
    }
    if (item.quantity > product.stockQuantity) {
      return { ok: false, error: `Not enough stock for ${product.name}.` };
    }
  }

  const lineItems = input.items.map((item) => {
    const product = byId.get(item.productId)!;
    const unitPrice =
      viewer.isB2B && product.wholesalePrice ? product.wholesalePrice : product.retailPrice;
    return {
      productId: product.id,
      quantity: item.quantity,
      unitPriceAtOrder: unitPrice,
      lineTotal: unitPrice.times(item.quantity),
    };
  });

  const subtotal = lineItems.reduce(
    (sum, li) => sum.plus(li.lineTotal),
    new Prisma.Decimal(0)
  );

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { email: input.customer.email },
        update: {
          name: input.customer.name,
          phone: input.customer.phone,
          companyName: input.customer.companyName,
          deliveryAddress: input.customer.deliveryAddress,
          deliveryZone: input.customer.deliveryZone,
        },
        create: {
          type: viewer.isB2B ? "BUSINESS" : "INDIVIDUAL",
          name: input.customer.name,
          email: input.customer.email,
          phone: input.customer.phone,
          companyName: input.customer.companyName,
          deliveryAddress: input.customer.deliveryAddress,
          deliveryZone: input.customer.deliveryZone,
        },
      });

      const created = await tx.order.create({
        data: {
          customerId: customer.id,
          channel: viewer.isB2B ? "B2B" : "B2C",
          status: "PENDING",
          deliveryAddress: input.customer.deliveryAddress,
          deliveryZone: input.customer.deliveryZone,
          subtotal,
          total: subtotal,
          notes: input.notes,
          items: { create: lineItems },
        },
      });

      for (const item of input.items) {
        // Guarded, atomic decrement: without the stockQuantity >= quantity
        // condition, two concurrent orders for the same last unit(s) could
        // both pass the earlier read-only check and both decrement, taking
        // stock negative. updateMany returns count: 0 when the guard
        // fails, which we treat as "someone else took it" and roll back
        // the whole order transaction.
        const result = await tx.product.updateMany({
          where: { id: item.productId, stockQuantity: { gte: item.quantity } },
          data: { stockQuantity: { decrement: item.quantity } },
        });
        if (result.count === 0) {
          const product = byId.get(item.productId);
          throw new Error(`Not enough stock for ${product?.name ?? "one of the items in your cart"}.`);
        }
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: "SALE",
            quantityChange: -item.quantity,
            orderId: created.id,
          },
        });
      }

      return created;
    });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not place your order." };
  }

  revalidateTag("products");

  await sendOrderStatusEmail({
    orderNumber: order.orderNumber,
    status: "PENDING",
    total: order.total,
    customer: { name: input.customer.name, email: input.customer.email },
  });

  return { ok: true, orderNumber: order.orderNumber, id: order.id };
}

/** Admin-only: moves an order to the next stage of fulfilment.
 * TODO(real-auth): gated by isAdmin() only, same stub as the rest of the
 * admin surface — see src/lib/auth.ts. */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  if (!isAdmin()) return { ok: false as const, error: "Not authorized." };

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { customer: true },
  });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  await sendOrderStatusEmail(order);
  return { ok: true as const };
}
