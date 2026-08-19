import type { Prisma } from "@prisma/client";

/** Format a Prisma Decimal (or number/string) as Mauritian Rupees, e.g. "Rs 1,250.00". */
export function formatMur(value: Prisma.Decimal | number | string): string {
  const n = typeof value === "object" ? value.toNumber() : Number(value);
  return `Rs ${n.toLocaleString("en-MU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
