"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

/** Admin-only: adjusts a product's stock up or down and logs a
 * StockMovement for it. Stock never goes below 0 — delta is clamped to the
 * current quantity on the way down. */
export async function adjustStock(productId: string, delta: number) {
  if (!isAdmin()) return { ok: false as const, error: "Not authorized." };
  if (!Number.isInteger(delta) || delta === 0) {
    return { ok: false as const, error: "Enter a non-zero whole number." };
  }

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUniqueOrThrow({ where: { id: productId } });
    const applied = Math.max(delta, -product.stockQuantity);

    await tx.product.update({
      where: { id: productId },
      data: { stockQuantity: product.stockQuantity + applied },
    });
    await tx.stockMovement.create({
      data: {
        productId,
        type: applied > 0 ? "RESTOCK" : "ADJUSTMENT",
        quantityChange: applied,
      },
    });
  });

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${productId}`);
  revalidatePath("/admin");
  return { ok: true as const };
}

/** Admin-only: activates or deactivates a product (hides/shows it from the
 * storefront catalog via getActiveProducts()'s isActive filter). */
export async function setProductActive(productId: string, isActive: boolean) {
  if (!isAdmin()) return { ok: false as const, error: "Not authorized." };

  await prisma.product.update({
    where: { id: productId },
    data: { isActive },
  });

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${productId}`);
  revalidatePath("/admin");
  return { ok: true as const };
}
