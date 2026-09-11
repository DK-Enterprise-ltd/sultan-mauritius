"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

/** Admin-only quick search: a bare number (optionally "#123") jumps
 * straight to that order; anything else searches customers by name/email/
 * company on the customers list. */
export async function searchAdmin(formData: FormData) {
  if (!isAdmin()) redirect("/admin");

  const query = String(formData.get("q") ?? "").trim();
  if (!query) redirect("/admin");

  const asOrderNumber = Number(query.replace(/^#/, ""));
  if (Number.isInteger(asOrderNumber) && asOrderNumber > 0) {
    const order = await prisma.order.findUnique({ where: { orderNumber: asOrderNumber } });
    if (order) redirect(`/admin/orders/${order.id}`);
  }

  redirect(`/admin/customers?q=${encodeURIComponent(query)}`);
}
