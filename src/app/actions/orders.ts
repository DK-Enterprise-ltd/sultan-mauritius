"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/auth";

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

type OrderResult = { ok: true; orderNumber: number } | { ok: false; error: string };

/** Creates a PENDING order from a client-side cart. Prices are re-resolved
 * server-side from the current Product rows — never trust client-supplied
 * prices for a money path. */
export async function createOrder(input: OrderInput): Promise<OrderResult> {
  if (input.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

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

  const order = await prisma.$transaction(async (tx) => {
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
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
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

  return { ok: true, orderNumber: order.orderNumber };
}
