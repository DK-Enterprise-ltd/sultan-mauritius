import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import Badge from "@/components/Badge/Badge";
import styles from "../page.module.css";
import filterStyles from "./page.module.css";

export const dynamic = "force-dynamic";

const STATUSES = ["PENDING", "CONFIRMED", "PAID", "FULFILLED", "CANCELLED"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = STATUSES.includes(searchParams.status as (typeof STATUSES)[number])
    ? (searchParams.status as (typeof STATUSES)[number])
    : undefined;

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div>
      <h1 className={styles.title}>Orders</h1>

      <div className={filterStyles.filters}>
        <Link
          href="/admin/orders"
          className={`${filterStyles.filter} ${!status ? filterStyles.filterActive : ""}`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
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
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{order.customer.name}</td>
                <td>{order.channel}</td>
                <td>
                  <Badge status={order.status} />
                </td>
                <td>{formatMur(order.total)}</td>
                <td>{order.createdAt.toLocaleDateString("en-MU")}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.empty}>No orders match this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
