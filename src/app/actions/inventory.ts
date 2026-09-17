"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { Prisma, ProductType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { cleanStr } from "@/lib/validate";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

/** Admin-only: creates a new product, uploading its photo to Vercel Blob
 * (public access — product images are shown on the storefront) when one is
 * given. Redirects back to the form with ?error= on bad input rather than
 * returning a result, since it's bound directly as a <form action>. */
export async function createProduct(formData: FormData) {
  if (!isAdmin()) redirect("/admin");

  const sku = cleanStr(String(formData.get("sku") ?? ""), 40);
  const name = cleanStr(String(formData.get("name") ?? ""), 120);
  const type = String(formData.get("type") ?? "");
  const flavor = cleanStr(String(formData.get("flavor") ?? ""), 60) || null;
  const sizeMl = Number(formData.get("sizeMl"));
  const packCount = Number(formData.get("packCount") || 1);
  const retailPrice = Number(formData.get("retailPrice"));
  const wholesalePriceRaw = String(formData.get("wholesalePrice") ?? "").trim();
  const stockQuantity = Number(formData.get("stockQuantity") || 0);
  const lowStockThreshold = Number(formData.get("lowStockThreshold") || 20);
  const image = formData.get("image");

  const fail = (error: string) => redirect(`/admin/inventory/new?error=${encodeURIComponent(error)}`);

  if (!sku || !name) return fail("SKU and name are required.");
  if (!Object.values(ProductType).includes(type as ProductType)) return fail("Choose a product type.");
  if (!Number.isInteger(sizeMl) || sizeMl <= 0) return fail("Size (ml) must be a positive whole number.");
  if (!Number.isInteger(packCount) || packCount <= 0) return fail("Pack count must be a positive whole number.");
  if (!Number.isFinite(retailPrice) || retailPrice <= 0) return fail("Retail price must be a positive number.");
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) return fail("Starting stock must be a whole number.");
  if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) return fail("Low stock threshold must be a whole number.");
  if (image instanceof File && image.size > MAX_IMAGE_BYTES) return fail("Image must be under 5MB.");

  let wholesalePrice: number | null = null;
  if (wholesalePriceRaw) {
    wholesalePrice = Number(wholesalePriceRaw);
    if (!Number.isFinite(wholesalePrice) || wholesalePrice <= 0) return fail("Wholesale price must be a positive number.");
  }

  let imageUrl: string | null = null;
  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) return fail("Image file must be a photo (JPEG/PNG/WebP).");
    try {
      const blob = await put(`products/${sku}-${Date.now()}`, image, { access: "public" });
      imageUrl = blob.url;
    } catch {
      return fail("Image upload failed. Try again, or add the photo later from the product page.");
    }
  }

  try {
    const product = await prisma.product.create({
      data: {
        sku,
        name,
        type: type as ProductType,
        flavor,
        sizeMl,
        packCount,
        retailPrice: new Prisma.Decimal(retailPrice),
        wholesalePrice: wholesalePrice !== null ? new Prisma.Decimal(wholesalePrice) : null,
        stockQuantity,
        lowStockThreshold,
        imageUrl,
      },
    });
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");
    redirect(`/admin/inventory/${product.id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("A product with that SKU already exists.");
    }
    throw error;
  }
}

/** Admin-only: updates every editable field of an existing product,
 * including replacing or removing either photo. A new "image"/"image2" file
 * upload replaces the existing photo; the "removeImage"/"removeImage2"
 * checkboxes clear a photo without replacing it. Same fail()-via-redirect
 * pattern as createProduct, back to the edit form. */
export async function updateProduct(productId: string, formData: FormData) {
  if (!isAdmin()) redirect("/admin");

  const sku = cleanStr(String(formData.get("sku") ?? ""), 40);
  const name = cleanStr(String(formData.get("name") ?? ""), 120);
  const type = String(formData.get("type") ?? "");
  const flavor = cleanStr(String(formData.get("flavor") ?? ""), 60) || null;
  const sizeMl = Number(formData.get("sizeMl"));
  const packCount = Number(formData.get("packCount") || 1);
  const retailPrice = Number(formData.get("retailPrice"));
  const wholesalePriceRaw = String(formData.get("wholesalePrice") ?? "").trim();
  const lowStockThreshold = Number(formData.get("lowStockThreshold") || 20);
  const image = formData.get("image");
  const image2 = formData.get("image2");
  const removeImage = formData.get("removeImage") === "on";
  const removeImage2 = formData.get("removeImage2") === "on";

  const fail = (error: string) =>
    redirect(`/admin/inventory/${productId}/edit?error=${encodeURIComponent(error)}`);

  if (!sku || !name) return fail("SKU and name are required.");
  if (!Object.values(ProductType).includes(type as ProductType)) return fail("Choose a product type.");
  if (!Number.isInteger(sizeMl) || sizeMl <= 0) return fail("Size (ml) must be a positive whole number.");
  if (!Number.isInteger(packCount) || packCount <= 0) return fail("Pack count must be a positive whole number.");
  if (!Number.isFinite(retailPrice) || retailPrice <= 0) return fail("Retail price must be a positive number.");
  if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) return fail("Low stock threshold must be a whole number.");
  if (image instanceof File && image.size > MAX_IMAGE_BYTES) return fail("Image must be under 5MB.");
  if (image2 instanceof File && image2.size > MAX_IMAGE_BYTES) return fail("Second image must be under 5MB.");
  if (image instanceof File && image.size > 0 && !image.type.startsWith("image/")) {
    return fail("Image file must be a photo (JPEG/PNG/WebP).");
  }
  if (image2 instanceof File && image2.size > 0 && !image2.type.startsWith("image/")) {
    return fail("Second image file must be a photo (JPEG/PNG/WebP).");
  }

  let wholesalePrice: number | null = null;
  if (wholesalePriceRaw) {
    wholesalePrice = Number(wholesalePriceRaw);
    if (!Number.isFinite(wholesalePrice) || wholesalePrice <= 0) return fail("Wholesale price must be a positive number.");
  }

  const data: Prisma.ProductUpdateInput = {
    sku,
    name,
    type: type as ProductType,
    flavor,
    sizeMl,
    packCount,
    retailPrice: new Prisma.Decimal(retailPrice),
    wholesalePrice: wholesalePrice !== null ? new Prisma.Decimal(wholesalePrice) : null,
    lowStockThreshold,
  };

  try {
    if (image instanceof File && image.size > 0) {
      const blob = await put(`products/${sku}-${Date.now()}`, image, { access: "public" });
      data.imageUrl = blob.url;
    } else if (removeImage) {
      data.imageUrl = null;
    }

    if (image2 instanceof File && image2.size > 0) {
      const blob2 = await put(`products/${sku}-2-${Date.now()}`, image2, { access: "public" });
      data.imageUrl2 = blob2.url;
    } else if (removeImage2) {
      data.imageUrl2 = null;
    }
  } catch {
    return fail("Image upload failed. Try again.");
  }

  try {
    await prisma.product.update({ where: { id: productId }, data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return fail("A product with that SKU already exists.");
    }
    throw error;
  }

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${productId}`);
  revalidatePath("/admin");
  redirect(`/admin/inventory/${productId}`);
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

/** Admin-only: permanently deletes a product. OrderItem/StockMovement both
 * reference Product without onDelete: Cascade on purpose (see
 * schema.prisma) so past orders/invoices/stock history stay intact — that
 * makes this a hard block (Prisma P2003) for any product that has ever been
 * ordered or had stock movements, not just a risk to warn about. Deactivate
 * (setProductActive) is the correct way to retire a product that has
 * history; this is only for a product that was never actually used. */
export async function deleteProduct(productId: string) {
  if (!isAdmin()) return { ok: false as const, error: "Not authorized." };

  try {
    await prisma.product.delete({ where: { id: productId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return {
        ok: false as const,
        error: "This product has order or stock history and can't be deleted. Deactivate it instead.",
      };
    }
    throw error;
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  return { ok: true as const };
}
