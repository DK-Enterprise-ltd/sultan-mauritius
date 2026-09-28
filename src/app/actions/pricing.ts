"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { setBulkDiscountPercent } from "@/lib/pricing";

export type UpdateBulkDiscountState = { error?: string; success?: boolean };

/** Admin-only: sets the automatic bulk-discount percent applied at order
 * time to any line with BULK_DISCOUNT_MIN_QTY+ units (src/lib/pricing.ts).
 * Defaults to 0 (no discount) until set here. */
export async function updateBulkDiscountPercent(
  _prevState: UpdateBulkDiscountState,
  formData: FormData
): Promise<UpdateBulkDiscountState> {
  if (!isAdmin()) return { error: "Not authorized." };

  const raw = String(formData.get("bulkDiscountPercent") ?? "");
  const percent = Number(raw);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    return { error: "Enter a percentage between 0 and 100." };
  }

  await setBulkDiscountPercent(percent);
  // Storefront /products reads this directly via prisma (not the
  // unstable_cache'd getActiveProducts), and is already dynamically
  // rendered per-request because it reads searchParams — no revalidation
  // needed there.
  revalidatePath("/admin/settings");
  return { success: true };
}
