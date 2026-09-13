import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import { isAdmin } from "@/lib/auth";
import Badge from "@/components/Badge/Badge";
import styles from "../page.module.css";
import filterStyles from "../orders/page.module.css";

export const dynamic = "force-dynamic";

const STATUSES = ["DRAFT", "ISSUED", "PAID"] as const;

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  if (!isAdmin()) return null;

  const status = STATUSES.includes(searchParams.status as (typeof STATUSES)[number])
    ? (searchParams.status as (typeof STATUSES)[number])
    : undefined;

  const invoices = await prisma.invoice.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { order: { include: { customer: true } } },
  });

  return (
    <div>
      <h1 className={styles.title}>Invoices</h1>

      <div className={filterStyles.filters}>
        <Link
          href="/admin/invoices"
          className={`${filterStyles.filter} ${!status ? filterStyles.filterActive : ""}`}
        >
          All
        </Link>
        <Link
          href="/admin/invoices?status=DRAFT"
          className={`${filterStyles.filter} ${status === "DRAFT" ? filterStyles.filterActive : ""}`}
        >
          Draft — not yet sent
        </Link>
        <Link
          href="/admin/invoices?status=ISSUED"
          className={`${filterStyles.filter} ${status === "ISSUED" ? filterStyles.filterActive : ""}`}
        >
          Sent
        </Link>
        <Link
          href="/admin/invoices?status=PAID"
          className={`${filterStyles.filter} ${status === "PAID" ? filterStyles.filterActive : ""}`}
        >
          Paid
        </Link>
      </div>

      <div className={styles.section}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Order</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Balance due</th>
              <th>Due date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <Link href={`/admin/invoices/${inv.id}`} className={styles.rowLink}>
                    {inv.invoiceNumber}
                  </Link>
                </td>
                <td>#{inv.order.orderNumber}</td>
                <td>{inv.order.customer.name}</td>
                <td>
                  <Badge status={inv.status} />
                </td>
                <td>{formatMur(inv.balanceDue)}</td>
                <td>{inv.dueDate ? inv.dueDate.toLocaleDateString("en-MU") : "—"}</td>
                <td>
                  <Link href={`/admin/invoices/${inv.id}`} className={filterStyles.seeInvoiceButton}>
                    See invoice
                  </Link>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.empty}>No invoices yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
