import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import { isAdmin } from "@/lib/auth";
import styles from "../page.module.css";
import filterStyles from "./page.module.css";
import StatusSelect from "./StatusSelect";

export const dynamic = "force-dynamic";

const STATUSES = ["PENDING", "CONFIRMED", "PAID", "OUT_FOR_DELIVERY", "FULFILLED", "CANCELLED"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; customerId?: string };
}) {
  if (!isAdmin()) return null;

  const status = STATUSES.includes(searchParams.status as (typeof STATUSES)[number])
    ? (searchParams.status as (typeof STATUSES)[number])
    : undefined;
  const customerId = searchParams.customerId;

  const orders = await prisma.order.findMany({
    where: { ...(status ? { status } : {}), ...(customerId ? { customerId } : {}) },
    orderBy: { createdAt: "desc" },
    include: { customer: true, invoice: true },
  });
  const filteredCustomerName = customerId ? orders[0]?.customer.name : undefined;

  return (
    <div>
      <h1 className={styles.title}>Orders</h1>

      {customerId && (
        <p className={filterStyles.customerFilterNote}>
          Showing orders for {filteredCustomerName ?? "this customer"} ·{" "}
          <Link href={status ? `/admin/orders?status=${status}` : "/admin/orders"}>Clear</Link>
        </p>
      )}

      <div className={filterStyles.filters}>
        <Link
          href={customerId ? `/admin/orders?customerId=${customerId}` : "/admin/orders"}
          className={`${filterStyles.filter} ${!status ? filterStyles.filterActive : ""}`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}${customerId ? `&customerId=${customerId}` : ""}`}
            className={`${filterStyles.filter} ${status === s ? filterStyles.filterActive : ""}`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className={styles.section}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Total</th>
              <th>Placed</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/orders/${order.id}`} className={styles.rowLink}>
                    #{order.orderNumber}
                  </Link>
                </td>
                <td>{order.customer.name}</td>
                <td>{order.channel}</td>
                <td>
                  <StatusSelect orderId={order.id} status={order.status} />
                </td>
                <td>{formatMur(order.total)}</td>
                <td>{order.createdAt.toLocaleDateString("en-MU")}</td>
                <td>
                  {order.invoice ? (
                    <Link href={`/admin/invoices/${order.invoice.id}`} className={filterStyles.seeInvoiceButton}>
                      See invoice
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.empty}>No orders match this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
