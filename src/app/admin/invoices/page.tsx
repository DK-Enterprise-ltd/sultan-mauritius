import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import Badge from "@/components/Badge/Badge";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: { include: { customer: true } } },
  });

  return (
    <div>
      <h1 className={styles.title}>Invoices</h1>

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
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.invoiceNumber}</td>
                <td>#{inv.order.orderNumber}</td>
                <td>{inv.order.customer.name}</td>
                <td>
                  <Badge status={inv.status} />
                </td>
                <td>{formatMur(inv.balanceDue)}</td>
                <td>{inv.dueDate ? inv.dueDate.toLocaleDateString("en-MU") : "—"}</td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.empty}>No invoices yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
