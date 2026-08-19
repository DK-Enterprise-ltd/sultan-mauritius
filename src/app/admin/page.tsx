import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMur } from "@/lib/format";
import Badge from "@/components/Badge/Badge";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [pendingOrders, lowStockProducts, unhandledInquiries, recentOrders] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.findMany({
      where: { isActive: true },
    }).then((products) => products.filter((p) => p.stockQuantity <= p.lowStockThreshold)),
    prisma.contactInquiry.count({ where: { handled: false } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { customer: true },
    }),
  ]);

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.stats}>
        <Link href="/admin/orders?status=PENDING" className={styles.stat}>
          <span className={styles.statValue}>{pendingOrders}</span>
          <span className={styles.statLabel}>Pending orders</span>
        </Link>
        <Link href="/admin/inventory" className={styles.stat}>
          <span className={styles.statValue}>{lowStockProducts.length}</span>
          <span className={styles.statLabel}>Low stock products</span>
        </Link>
        <div className={styles.stat}>
          <span className={styles.statValue}>{unhandledInquiries}</span>
          <span className={styles.statLabel}>Unhandled inquiries</span>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent orders</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNumber}</td>
                <td>{order.customer.name}</td>
                <td>
                  <Badge status={order.status} />
                </td>
                <td>{formatMur(order.total)}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.empty}>No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {lowStockProducts.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Low stock alerts</h2>
          <ul className={styles.alertList}>
            {lowStockProducts.map((p) => (
              <li key={p.id}>
                {p.name} — {p.stockQuantity} left (threshold {p.lowStockThreshold})
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
